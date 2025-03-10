'use client';
import { useNextCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import {
	createViewDay,
	createViewMonthAgenda,
	createViewMonthGrid,
	createViewWeek,
	viewMonthAgenda,
	viewWeek,
} from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
import { FC, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/api/events';
import { SalonApi } from '@/api/salons.list';
import { createListCollection, Flex, SelectRoot } from '@chakra-ui/react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Field } from '@/components/ui/field';
import { watch } from 'fs';
import { salonBranchApi } from '@/api/salonBranch';
import { SelectContent, SelectItem, SelectTrigger, SelectValueText } from '@/components/ui/select';
import moment from 'moment';
import { mastersListApi } from '@/api/masters.list';
import DialogForm from './dialog.form';
import { createEventModalPlugin } from '@schedule-x/event-modal';

import { createCurrentTimePlugin } from '@schedule-x/current-time';
import { toaster } from '@/components/ui/toaster';

import { createResizePlugin } from '@schedule-x/resize';

interface ICalendarProps {}

type Inputs = {
	activeSalonId: string[];
	activeBranchId: string[];
	activeMasterId: string[];

	updateEventId: number | undefined;
};

interface IUpdateEventParams {
	id: number;
	start: string;
	duration: number
}

const FullCalendar: FC<ICalendarProps> = props => {
	const {
		register,
		handleSubmit,
		watch,
		control,
		formState: { errors },
		setValue,
	} = useForm<Inputs>({
		defaultValues: {
			updateEventId: undefined,
		},
	});
	const onSubmit: SubmitHandler<Inputs> = data => console.log(data);

	const updateEventMutation = useMutation({
		mutationFn: ({ id, start, duration }: IUpdateEventParams) => {
			const promise = eventsApi.update(id, {
				start,
				duration,
			});

			toaster.promise(promise, {
				loading: {
					title: 'Обновление',
				},
				success: {
					title: 'Запись успешно обновлена',
				},
				error: {
					title: 'Что то пошло не так',
				},
			});

			return promise;
		},
		onSuccess: () => {
			refetchEvents();
		},
	});

	const eventsService = useState(() => createEventsServicePlugin())[0];
	const eventModal = createEventModalPlugin();

	const { data: salons } = useQuery({
		queryKey: ['SALONS'],
		queryFn: () => SalonApi.getAllSalons({ pagination: { skip: 0, take: 100 } }),
	});

	const salonsCollection = createListCollection({
		items: salons?.list ? salons?.list.map(item => ({ label: item.name, value: item.id })) : [],
	});

	const { data: salonBranches } = useQuery({
		queryKey: ['SALONS-BRANCHES', watch('activeSalonId')?.[0]],
		enabled: !!watch('activeSalonId')?.[0],
		queryFn: () => salonBranchApi.getBranchesList({ salonId: +watch('activeSalonId')?.[0]! }),
	});

	const salonBranchesCollection = createListCollection({
		items: salonBranches?.data.list
			? salonBranches.data.list.map(item => ({ label: item.address, value: item.id }))
			: [],
	});

	const { data: mastersData } = useQuery({
		queryKey: ['SALONS-BRANCHES', watch('activeBranchId')?.[0], watch('activeSalonId')?.[0]],
		enabled: !!watch('activeBranchId')?.[0] && !!watch('activeSalonId')?.[0],
		queryFn: () =>
			mastersListApi.getList({
				salonId: +watch('activeSalonId')?.[0],
				salonBranchId: +watch('activeBranchId')?.[0],
			}),
	});

	const mastersCollections = createListCollection({
		items: mastersData?.data.list
			? mastersData.data.list.map(item => ({
					label: item.name + ' ' + item.lastName,
					value: item.id,
				}))
			: [],
	});

	const { data: events, refetch: refetchEvents } = useQuery({
		queryKey: [
			'EVENTS',
			+watch('activeSalonId')?.[0]!,
			+watch('activeBranchId')?.[0]!,
			+watch('activeMasterId')?.[0]!,
		],
		enabled: !!watch('activeSalonId')?.[0],
		queryFn: () =>
			eventsApi.getList(
				+watch('activeSalonId')?.[0]!,
				+watch('activeBranchId')?.[0],
				+watch('activeMasterId')?.[0],
			),
	});

	// init каледаря
	const calendar = useNextCalendarApp(
		{
			views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
			locale: 'ru-RU',
			weekOptions: {
				timeAxisFormatOptions: {
					hour: '2-digit',
					minute: '2-digit',
				},
			},
			defaultView: viewMonthAgenda.name,

			events: [],
			callbacks: {
				onDoubleClickEvent(calendarEvent) {
					setValue('updateEventId', +calendarEvent.id);
				},
				onEventUpdate(event) {
					const date1 = moment(event.start);
					const date2 = moment(event.end);

					// Находим разницу в минутах
					const duration = date2.diff(date1, 'minutes');
				
					updateEventMutation.mutate({id: +event.id, start: event.start, duration});
				},
			},
		},
		[
			eventsService,
			eventModal,
			createCurrentTimePlugin(),
			createDragAndDropPlugin(),
			createResizePlugin(),
		],
	);

	// обновить эвенты в каледаре
	useEffect(() => {
		if (!events) return;

		const newEvents = events.data.map(item => {
			let endTime = 0;
			endTime += +item.start.split(' ')[1].split(':')[0] * 60;
			endTime += +item.start.split(' ')[1].split(':')[1];
			endTime += item.duration;

			return {
				id: item.id || 0,
				title: item.title,
				start: item.start.replaceAll('.', '-'),
				location: item.salonBranch.address,
				people: [item.master.name + ' ' + item.master.lastName],
				description: `
					Клиент: ${item.clientName} \r\n ${item.clientLastName} \r\n ${item.clientNumber}
				`,

				end:
					item.start.replaceAll('.', '-').split(' ')[0] +
					' ' +
					moment().set({ hours: 0, minutes: endTime }).format('HH:mm'),
			};
		});
		eventsService.set(newEvents);
	}, [events]);

	return (
		<div>
			<DialogForm
				updateEvent={
					watch('updateEventId')
						? events?.data.find(event => event.id === watch('updateEventId')) || null
						: null
				}
				refetch={() => refetchEvents()}
				setEventId={() => setValue('updateEventId', undefined)}
			/>
			<Flex
				gap={5}
				marginBottom={5}
			>
				<Field
					marginTop={5}
					label='Салон'
					invalid={!!errors.activeSalonId}
					errorText={errors.activeSalonId?.message}
				>
					<Controller
						control={control}
						name='activeSalonId'
						render={({ field }) => (
							<SelectRoot
								name={field.name}
								value={field.value}
								onValueChange={({ value }) => field.onChange(value)}
								onInteractOutside={() => field.onBlur()}
								collection={salonsCollection}
							>
								<SelectTrigger>
									<SelectValueText placeholder='Выберете салон' />
								</SelectTrigger>
								<SelectContent>
									{salonsCollection.items.map(salon => (
										<SelectItem
											item={salon}
											key={salon.value}
										>
											{salon.label}
										</SelectItem>
									))}
								</SelectContent>
							</SelectRoot>
						)}
					/>
				</Field>

				<Field
					marginTop={5}
					label='Точка'
					invalid={!!errors.activeBranchId}
					errorText={errors.activeBranchId?.message}
					disabled={!!!watch('activeSalonId')?.[0]}
				>
					<Controller
						control={control}
						name='activeBranchId'
						render={({ field }) => (
							<SelectRoot
								name={field.name}
								value={field.value}
								onValueChange={({ value }) => field.onChange(value)}
								onInteractOutside={() => field.onBlur()}
								collection={salonBranchesCollection}
							>
								<SelectTrigger>
									<SelectValueText placeholder='Выберете адрес' />
								</SelectTrigger>
								<SelectContent>
									{salonBranchesCollection.items.map(salon => (
										<SelectItem
											item={salon}
											key={salon.value}
										>
											{salon.label}
										</SelectItem>
									))}
								</SelectContent>
							</SelectRoot>
						)}
					/>
				</Field>

				<Field
					marginTop={5}
					label='Мастер'
					invalid={!!errors.activeBranchId}
					errorText={errors.activeBranchId?.message}
					disabled={!!!watch('activeBranchId')?.[0]}
				>
					<Controller
						control={control}
						name='activeMasterId'
						render={({ field }) => (
							<SelectRoot
								name={field.name}
								value={field.value}
								onValueChange={({ value }) => field.onChange(value)}
								onInteractOutside={() => field.onBlur()}
								collection={mastersCollections}
							>
								<SelectTrigger>
									<SelectValueText placeholder='Выберете мастера' />
								</SelectTrigger>
								<SelectContent>
									{mastersCollections.items.map(salon => (
										<SelectItem
											item={salon}
											key={salon.value}
										>
											{salon.label}
										</SelectItem>
									))}
								</SelectContent>
							</SelectRoot>
						)}
					/>
				</Field>
			</Flex>

			<ScheduleXCalendar calendarApp={calendar} />
		</div>
	);
};

export default FullCalendar;
