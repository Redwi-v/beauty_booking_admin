import FullCalendar from '@fullcalendar/react';
import { FC, useEffect, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import s from '../schedule.module.scss';
import { EventContentArg, EventInput, EventSourceInput } from '@fullcalendar/core/index.js';
import moment from 'moment';
import { IBooking, IMaster } from '@/api/masters.list/types';
import { Tooltip } from 'react-tooltip';
import Popup from 'reactjs-popup';
import { H2, P } from '@/components/containers/text';
import { time } from 'console';
import { Button, buttonTypes } from '@/components/inputs/button';
import { useMutation, useQuery } from 'react-query';
import { bookingApi } from '@/api/booking';
import { ChoiceServiceView } from './choice.service';
import { useAppointmentStore } from './appointment/model/appointment.store';
import { TimeListPicker } from '@/components/ui/time.picker.list/ui/time.picker';
import { MastersListApi } from '@/api/masters.list';
import { EntryConfirmView } from './entry.confirm.view';
import { SalonBranch } from '../../../../api/booking/types';
interface ICalendarProps {
	master: IMaster;
	refetch: () => void;
}

const Calendar: FC<ICalendarProps> = props => {
	const { master, refetch } = props;

	const deleteBookingMutation = useMutation({
		mutationFn: (id: number) => bookingApi.delete(id),
		onSuccess: () => {
			setInfoPopUpIsOpen(null);
			refetch();
		},
	});

	const [events, setEvents] = useState<EventInput[]>([]);
	const [activeUpdateBookingId, setActiveUpdateBookingId] = useState<number | null>(null);

	const [step, setStep] = useState(1);

	useEffect(() => {
		setEvents(
			master.Booking.map(booking => {
				return { date: booking.time, id: String(booking.id) };
			}),
		);
	}, [master]);

	const [infoPopUpIsOpen, setInfoPopUpIsOpen] = useState<null | IBooking>(null);

	const openInfoPopUp = (event: IBooking) => {
		setInfoPopUpIsOpen(event);
	};

	function renderEventContent(eventInfo: EventContentArg) {
		const activeEvent = master.Booking.find(booking => +eventInfo.event.id === booking.id);

		if (!activeEvent) return;

		const allMinutes = activeEvent.services.reduce((prev, service) => {
			return service.time + prev;
		}, 0);

		return (
			<button
				onClick={() => openInfoPopUp(activeEvent)}
				className={s.schedule_event}
			>
				<div>Клиент: {activeEvent.clientName}</div>
				<div>
					Время: {moment(activeEvent.time).format('HH:mm')} -
					{moment(activeEvent.time).add({ minutes: allMinutes }).format('HH:mm')}
				</div>
			</button>
		);
	}

	const [addEventPopupIsOpen, setAddEventPopupIsOpen] = useState(false);

	const allMinutes = infoPopUpIsOpen
		? infoPopUpIsOpen.services.reduce((prev, service) => {
				return service.time + prev;
		  }, 0)
		: 0;

	const {
		date,
		setDateAndTime,
		services,
		time: stateTime,
		setMasterId,
		setSalonBranch,
		setServices,
		clear,
	} = useAppointmentStore(store => store);

	const handleDateClick = (arg: DateClickArg) => {
		if (moment().isAfter(arg.dateStr) && moment().format('YYYY-MM-DD') !== arg.dateStr) return;

		setActiveUpdateBookingId(null);
		clear();
		setStep(1);
		setTime('');
		setDateAndTime(arg.dateStr, null);
		setAddEventPopupIsOpen(true);
	};

	const [time, setTime] = useState(stateTime || '');

	const { data: freeTime } = useQuery({
		queryKey: ['FreeTime', date, master?.id, services],
		queryFn: () =>
			MastersListApi.getFreeTime({
				date: moment(date).toDate(),
				masterId: master?.id,
				servicesIdList: services.map(item => String(item)),
			}),
	});

	console.log(infoPopUpIsOpen);

	return (
		<>
			<FullCalendar
				viewClassNames={s.calendar}
				plugins={[dayGridPlugin, interactionPlugin]}
				height={'auto'}
				buttonText={{
					month: 'Месяц',
					week: 'Неделя',
					today: 'Сегодня',
				}}
				initialView='dayGridMonth'
				dateClick={handleDateClick}
				headerToolbar={{
					left: 'prev,next today',
					center: 'title',
					right: 'dayGridMonth,dayGridWeek',
				}}
				initialDate='2024-10-12'
				locale={'ru'}
				eventClassNames={s.event_wrapper}
				stickyHeaderDates
				events={events}
				eventContent={renderEventContent}
			/>

			<Popup
				open={!!infoPopUpIsOpen}
				closeOnDocumentClick
				closeOnEscape
				onClose={() => {
					setInfoPopUpIsOpen(null);
				}}
			>
				<div className='modal'>
					<H2 className='modal_header'>
						Запись на {moment(infoPopUpIsOpen?.time).locale('ru').format('DD MMMM YYYY HH:mm')}
					</H2>
				</div>

				<P>Имя клинета: {infoPopUpIsOpen?.clientName}</P>
				<div>
					{infoPopUpIsOpen?.clientComment && (
						<>
							<P>Комментарий клиента:</P>
							<P>{infoPopUpIsOpen?.clientComment}</P>
						</>
					)}

					{infoPopUpIsOpen?.adminComment && (
						<>
							<P>Комментарий админа:</P>
							<P>{infoPopUpIsOpen?.adminComment}</P>
						</>
					)}

					{infoPopUpIsOpen?.masterComment && (
						<>
							<P>Комментарий мастера:</P>
							<P>{infoPopUpIsOpen?.masterComment}</P>
						</>
					)}
				</div>
				<P>
					Время: {moment(infoPopUpIsOpen?.time).format('HH:mm')} -
					{moment(infoPopUpIsOpen?.time).add({ minutes: allMinutes }).format('HH:mm')}
				</P>
				<P>Процедуры:</P>
				<ul className={s.popup_info_services}>
					{infoPopUpIsOpen &&
						infoPopUpIsOpen.services.map(item => {
							return (
								<li>
									<P>{item.name}</P>
									<P>{item.price}р</P>
									<P>{moment().hour(0).minutes(0).add({ minutes: item.time }).format('HH:mm')}ч</P>
								</li>
							);
						})}
				</ul>

				<div className={s.info_popup_controls}>
					{/* <Button
						type={buttonTypes.blue}
						buttonParams={{
							onClick: () => {
								if (!infoPopUpIsOpen) return;

								setActiveUpdateBookingId(infoPopUpIsOpen?.id);
								setDateAndTime(
									moment(infoPopUpIsOpen.time).format('MM.DD.YYY'),
									moment(infoPopUpIsOpen.time).format('HH:mm'),
								);
								setServices(infoPopUpIsOpen.services.map(item => item.id));
								setMasterId(infoPopUpIsOpen.masterAccountId), setAddEventPopupIsOpen(true);
							},
						}}
					>
						Изменить
					</Button> */}
					<Button
						type={buttonTypes.red}
						buttonParams={{
							onClick: () => deleteBookingMutation.mutate(infoPopUpIsOpen?.id!),
						}}
					>
						Отменить
					</Button>
				</div>
			</Popup>

			<Popup
				open={addEventPopupIsOpen}
				closeOnDocumentClick
				closeOnEscape
				onClose={() => setAddEventPopupIsOpen(false)}
			>
				{step === 1 && (
					<div>
						<div className='modal'>
							<H2 className='modal_header '>
								Запись на {moment(date).locale('ru').format('DD MMMM YYYY ')}
							</H2>
						</div>
						<ChoiceServiceView />
						<div>
							<TimeListPicker
								steps={freeTime?.data?.freeTime || []}
								time={time || undefined}
								setTime={setTime}
							/>
						</div>
						<Button
							buttonParams={{
								onClick: () => {
									if (!date || !time) return;

									setDateAndTime(date.toString(), time);
									setMasterId(master?.id);

									//@ts-ignore
									setSalonBranch(master.salonBranch);
									setStep(2);
								},
							}}
							type={date && time ? buttonTypes.blue : undefined}
						>
							Добавить запись
						</Button>
					</div>
				)}

				{step === 2 && (
					<div className='modal'>
						<EntryConfirmView
							activeBookingId={activeUpdateBookingId}
							closeForm={() => {
								setAddEventPopupIsOpen(false);
								refetch();
							}}
							branchId={master.salonBranchId}
							salonId={master.salonBranchId}
						/>
					</div>
				)}
			</Popup>
		</>
	);
};

export default Calendar;
