import FullCalendar from '@fullcalendar/react';
import { FC, useEffect, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import s from '../schedule.module.scss';
import { EventContentArg, EventInput, EventSourceInput } from '@fullcalendar/core/index.js';
import moment from 'moment';
import { IBooking, IMaster } from '@/api/masters.list/types';
import Popup from 'reactjs-popup';
import { H2, P } from '@/components/containers/text';
import { Button, buttonTypes } from '@/components/inputs/button';
import { useMutation, useQuery } from '@tanstack/react-query';
import { bookingApi } from '@/api/booking';
import { ChoiceServiceView } from './choice.service';
import { useAppointmentStore } from './appointment/model/appointment.store';
import { TimeListPicker } from '@/components/ui/time.picker.list/ui/time.picker';
import { MastersListApi } from '@/api/masters.list';
import { EntryConfirmView } from './entry.confirm.view';
import Select from 'react-select';
interface ICalendarProps {
	master?: IMaster;
	refetch: () => void;
	branchId: number | null;
	salonId: number | null;
	masters: IMaster[];
}

const Calendar: FC<ICalendarProps> = props => {
	const { master, refetch, branchId, salonId, masters } = props;

	const deleteBookingMutation = useMutation({
		mutationFn: (id: number) => bookingApi.delete(id),
		onSuccess: () => {
			setInfoPopUpIsOpen(null);
			refetch();
		},
	});

	const {
		data: allBooking,
		refetch: refetchAllBooking,
		isSuccess: allBookingSuccess,
	} = useQuery({
		queryKey: ['BookingAll', branchId, salonId],
		queryFn: () => bookingApi.getAllBooking(branchId!, salonId!),
		enabled: !!branchId && !!salonId,
	});

	useEffect(() => {
		if (allBookingSuccess) {
			setEvents(
				allBooking.data.map(booking => {
					return { date: booking.time, id: String(booking.id) };
				}),
			);
		}
	}, [allBookingSuccess, allBooking]);

	const [events, setEvents] = useState<EventInput[]>([]);
	const [activeUpdateBookingId, setActiveUpdateBookingId] = useState<number | null>(null);

	const [step, setStep] = useState(1);

	useEffect(() => {
		if (!master) {
			return;
		}

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
		const activeEvent = master
			? master.Booking.find(booking => +eventInfo.event.id === booking.id)
			: allBooking?.data.find(booking => +eventInfo.event.id === booking.id);

		if (!activeEvent) return 'hello';

		const allMinutes = activeEvent.services.reduce((prev, service) => {
			return service.time + prev;
		}, 0);

		return (
			<button
				onClick={() => openInfoPopUp(activeEvent)}
				className={s.schedule_event}
			>
				{!master && (
					<div>Мастер: {activeEvent.master.name + ' ' + activeEvent.master.lastName}</div>
				)}
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
		masterId,
	} = useAppointmentStore(store => store);

	useEffect(() => {
		if (activeUpdateBookingId) return;

		setServices([]);
		setDateAndTime(date, null);
		setStep(1);
	}, [masterId]);

	const handleDateClick = (arg: DateClickArg) => {
		if (
			(moment().isAfter(arg.dateStr) && moment().format('YYYY-MM-DD') !== arg.dateStr) ||
			!branchId ||
			!salonId
		)
			return;

		setActiveUpdateBookingId(null);
		clear();
		setStep(1);
		setTime('');
		setDateAndTime(arg.dateStr, null);
		setAddEventPopupIsOpen(true);
	};

	const [time, setTime] = useState(stateTime || '');

	const { data: freeTime } = useQuery({
		queryKey: ['FreeTime', date, masterId, services],
		queryFn: () =>
			MastersListApi.getFreeTime({
				date: moment(date).toDate(),
				masterId: masterId!,
				bookingId: activeUpdateBookingId,
				servicesIdList: services.map(item => String(item)),
			}),
		enabled: !!masterId,
	});
	
	return (
		<>
			<FullCalendar
				viewClassNames={s.calendar}
				plugins={[dayGridPlugin, interactionPlugin]}
				height={'auto'}
				dayMaxEvents={3}
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
				overlayStyle={{
					zIndex: 100000,
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
					<Button
						type={buttonTypes.blue}
						buttonParams={{
							onClick: () => {
								if (!infoPopUpIsOpen) return;

								setActiveUpdateBookingId(infoPopUpIsOpen?.id);
								setDateAndTime(
									moment(infoPopUpIsOpen.time).format('MM.DD.YYYY'),
									moment(infoPopUpIsOpen.time).format('HH:mm'),
								);
								setTime(moment(infoPopUpIsOpen.time).format('HH:mm'));

								setServices(infoPopUpIsOpen.services.map(item => item.id));
								setMasterId(infoPopUpIsOpen.masterAccountId);
								setAddEventPopupIsOpen(true);
							},
						}}
					>
						Изменить
					</Button>
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
				overlayStyle={{
					zIndex: 100001,
				}}
				onClose={() => setAddEventPopupIsOpen(false)}
			>
				{step === 1 && (
					<div>
						<div className='modal'>
							<H2 className='modal_header '>
								Запись на {moment(date).locale('ru').format('DD MMMM YYYY ')}
							</H2>
						</div>

						<>
							<Select
								className={s.master_select}
								classNamePrefix='select'
								value={
									masterId !== null && {
										value: masterId,
										label:
											masters.find(master => masterId === master.id)?.name +
											' ' +
											masters.find(master => masterId === master.id)?.lastName,
									}
								}
								onChange={value => {
									if (typeof value === 'boolean' || !value?.value) return;

									setServices([]);
									setDateAndTime(date, null);
									setMasterId(value?.value);
								}}
								isSearchable={true}
								name='color'
								options={masters.map(master => ({
									value: master.id,
									label: master.name + ' ' + master.lastName,
								}))}
							/>
						</>

						{masterId && <ChoiceServiceView />}
						<div>
							{services.length > 0 && (
								<TimeListPicker
									steps={freeTime?.data?.freeTime || []}
									time={time || undefined}
									setTime={setTime}
								/>
							)}
						</div>
						<Button
							buttonParams={{
								onClick: () => {
									if (!date || !time) return;

									setDateAndTime(date.toString(), time);

									if (master) setMasterId(master?.id);

									//@ts-ignore
									setSalonBranch(branchId);
									setStep(2);
								},
							}}
							type={date && time && services.length > 0 ? buttonTypes.blue : undefined}
						>
							{activeUpdateBookingId ? 'Обновить запись' : 'Добавить запись'}
						</Button>
					</div>
				)}

				{step === 2 && (
					<div className='modal'>
						<EntryConfirmView
							refetch={() => {
								refetch();
								refetchAllBooking();
							}}
							activeBookingId={activeUpdateBookingId}
							closeForm={() => {
								setAddEventPopupIsOpen(false);
								refetch();
								refetchAllBooking();
								setStep(1);
							}}
							branchId={branchId!}
							salonId={salonId!}
						/>
					</div>
				)}
			</Popup>
		</>
	);
};

export default Calendar;
