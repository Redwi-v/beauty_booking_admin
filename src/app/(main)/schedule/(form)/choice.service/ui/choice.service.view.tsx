'use client';

import { FC, useEffect, useState } from 'react';
import s from './choice.service.view.module.scss';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from 'react-query';
import moment from 'moment';
import { Rethink_Sans } from 'next/font/google';
import { useAppointmentStore } from '../../appointment/model/appointment.store';
import { Service } from '@/api/booking/types';
import { MastersListApi } from '@/api/masters.list';
import { servicesListApi } from '@/api/services.list';
import useDebounce from '@/scripts/hooks/use.debounce';
import { CheckBox } from '@/components/ui/checkbox';

interface ChoiceServiceViewProps {}

export const ChoiceServiceView: FC<ChoiceServiceViewProps> = () => {
	const { toggleServices, date, time, masterId, services } = useAppointmentStore(state => state);

	const router = useRouter();

	const clickHandler = () => {
		if (!masterId) return router.push('/choice.specialist');
		if (!time && !date && masterId) return router.push('/choice.date');

		router.push('/entry.confirm');
	};

	const isEndStep = date && time && masterId;

	return (
		<div className='container'>
			<h1 className='h1 pt-25'>Выбрать услуги</h1>
			<ListWithTabs />
		</div>
	);
};

const ListWithTabs = () => {
	const { toggleServices, services, masterId, time, date } = useAppointmentStore(state => state);

	const [search, setSearch] = useState('');

	const { data: masterData } = useQuery({
		queryKey: ['MasterData', masterId],
		queryFn: () => MastersListApi.getOne(masterId!),
		enabled: !!masterId,
	});

	const { data, refetch } = useQuery({
		queryKey: ['Services', masterId],
		queryFn: () => servicesListApi.getList({ search: search, masterId: masterId! }),
		enabled: !!masterId,
	});

	const activeServices: Service[] = [];

	services.forEach(id =>
		data?.data?.list?.forEach(serviceTag =>
			serviceTag.services.forEach(service => {
				//@ts-ignore
				if (id === service.id) activeServices.push(service);
			}),
		),
	);

	const startMinutes = time ? +time?.split(':')[0] * 60 + +time?.split(':')[1] : 0;

	const isSearch = useDebounce(search, 1000);

	useEffect(() => {
		refetch();
	}, [isSearch]);

	const isNotValid = (service: Service): boolean => {
		if (!data?.data || !masterData) return false;

		if (!date) return false;

		let haveFreeTime = false;

		const maxWorkingTime =
			+moment(masterData.endShift).format('HH:mm').split(':')[0] * 60 +
			+moment(masterData.startShift).format('HH:mm').split(':')[1];

		let bookingEndTimeSteps: [number, number][] = [];

		const activeDateBooking = masterData?.Booking.filter(booking => {
			return moment(date).format('DD.MM.YYYY') === moment(booking.time).format('DD.MM.YYYY');
		});

		activeDateBooking.forEach(booking => {
			const bookingsStartTime =
				+moment(booking.time).format('HH:mm').split(':')[0] * 60 +
				+moment(booking.time).format('HH:mm').split(':')[1];

			const bookingEndTime = booking?.services?.reduce((prev, service) => {
				return prev + service.time;
			}, bookingsStartTime);

			bookingEndTimeSteps.push([bookingsStartTime, bookingEndTime]);
		});

		data?.data.list.forEach(tag => {
			tag.services.forEach(serviceInTag => {
				if (services.find(serviceId => serviceInTag.id === serviceId)) return;

				const endMinutes = activeServices?.reduce((prev, service) => {
					return prev + service.time;
				}, startMinutes);

				const plusOneMinutes = endMinutes + service.time;

				if (plusOneMinutes > maxWorkingTime) {
					haveFreeTime = false;
				}

				bookingEndTimeSteps.forEach(bookingTimeStep => {
					if (
						(plusOneMinutes >= bookingTimeStep[0] && plusOneMinutes <= bookingTimeStep[1]) ||
						(startMinutes <= bookingTimeStep[0] && plusOneMinutes >= bookingTimeStep[0])
					)
						return;

					haveFreeTime = false;
				});
			});
		});

		console.log(haveFreeTime);

		return haveFreeTime;
	};

	const onlyTabs = data?.data?.list && data.data.list.map(service => ({ tab: service.tagName }));

	return (
		<div className={`${s.content}`}>
			<div className={s.top_section}>
				<div className=''>
					<div className={s.input_wrapper}>
						<div className={s.icon}>
							<Image
								alt='search'
								src={'/icons/search.svg'}
								width={18}
								height={18}
							/>
						</div>
						<input
							placeholder='Поиск по услугам'
							className={s.input}
							type='text'
							value={search}
							onChange={e => setSearch(e.target.value)}
						/>
					</div>

					<div className={s.tabs_wrapper}>
						<div className={s.tabs}>
							{onlyTabs &&
								onlyTabs.map(item => (
									<a
										href={'#' + item.tab}
										key={item.tab}
										className={s.tab}
									>
										{item.tab}
									</a>
								))}
						</div>
					</div>
				</div>
			</div>

			<div className={s.list}>
				{data?.data?.list &&
					data.data.list.map((item, topIndex) => (
						<>
							<div key={item.tagName}>
								<h1
									className='h1'
									id={item.tagName}
								>
									{item.tagName}
								</h1>
							</div>

							<ul className='mt-20'>
								{item.services.map((service, index) => (
									<li
										className={`${s.item} ${
											//@ts-ignore
											isNotValid(service) && !services.includes(service.id) && s.disable_item
										}`}
										key={index}
									>
										<p className={`${s.name} p`}>{service.name}</p>

										<div className={s.item_characteristics}>
											<p className='p'>
												<Image
													src={'/icons/time.svg'}
													width={24}
													height={24}
													alt='time'
												/>
												{moment().hours(0).minutes(service.time).format('HH:mm')} ч
											</p>
											<p className='p'>
												<Image
													src={'/icons/ruble.svg'}
													width={24}
													height={24}
													alt='time'
												/>
												{service.price}р
											</p>
										</div>

										<CheckBox
											isActive={services.includes(service.id)}
											onClick={() => toggleServices(service.id)}
										/>
									</li>
								))}
							</ul>
						</>
					))}
			</div>
		</div>
	);
};
