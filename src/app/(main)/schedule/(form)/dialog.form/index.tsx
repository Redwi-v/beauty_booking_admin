import { eventsApi } from '@/api/events';
import { masterScheduleApi } from '@/api/master.schedule';
import { mastersListApi } from '@/api/masters.list';
import { salonBranchApi } from '@/api/salonBranch';
import { SalonApi } from '@/api/salons.list';
import { servicesListApi } from '@/api/services.list';
import { Button } from '@/components/ui/button';
import InputMask from 'react-input-mask';

import {
	DialogActionTrigger,
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { SelectItem, SelectRoot } from '@/components/ui/select';
import {
	Box,
	Center,
	createListCollection,
	Flex,
	Input,
	SelectContent,
	SelectTrigger,
	SelectValueText,
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import DatePicker from 'react-multi-date-picker';
import { requiredMessage } from '@/constants/errors';
import { withMask } from 'use-mask-input';
import { toaster } from '@/components/ui/toaster';
import { IEvent } from '@/api/events/types';

type Inputs = {
	start: string;
	duration: string;
	salonBranch: string[];
	title: string;
	description: string;
	masterId: string[];
	servicesIdArr: string[];
	clientNumber: string;
	clientName: string;
	clientLastName: string;
	clientComment: string;
	salonId: string[];
	time: number | undefined;
};

interface DialogFormProps {
	refetch: () => void;
	updateEvent: IEvent | null;
	setEventId: () => void;
}

const DialogForm: FC<DialogFormProps> = ({ refetch, updateEvent, setEventId }) => {
	const {
		register,
		handleSubmit,
		watch,
		control,
		getValues,
		formState: { errors },
		getFieldState,
		reset,
		setValue,
	} = useForm<Inputs>();
	const onSubmit: SubmitHandler<Inputs> = data => {
		if (updateEvent) {
			return updateEventMutation.mutate();
		}

		addEventMutation.mutate();
	};

	const addEventMutation = useMutation({
		mutationFn: () => {
			let time: number | string[] = watch('duration')?.split(':');
			time = time ? +time[0] * 60 + +time[1] : 0;

			const duration = time
				? time
				: watch('servicesIdArr')?.reduce((prev, serviceId) => {
						if (!services) return 0;

						const service = services.data.list.find(service => +service.id === +serviceId);

						if (!service?.duration) return prev;

						return service?.duration + prev;
					}, 0);

			const promise = eventsApi.create({
				clientComment: getValues('clientComment') || '-',
				clientLastName: getValues('clientLastName') || '-',
				clientName: getValues('clientName'),
				clientNumber: getValues('clientNumber').replace(' ', '').replace('+', ''),
				description: getValues('description') || '-',
				duration: duration,
				masterId: +getValues('masterId')[0],
				salonBranch: +getValues('salonBranch')[0],
				servicesIdArr: getValues('servicesIdArr').map(id => +id),
				start:
					getValues('start') +
					' ' +
					moment()
						.set({ hours: 0, minutes: getValues('time') })
						.format('HH:mm'),
				title: getValues('title'),
			});

			toaster.promise(promise, {
				loading: {
					title: 'Добавление',
				},
				success: {
					title: 'Запись успешно Добавлена',
				},
				error: {
					title: 'Что то пошло не так',
				},
			});

			return promise;
		},
		onSuccess: () => {
			setIsOpen(false);
			refetch();
		},
	});

	const { data: salons } = useQuery({
		queryKey: ['SALONS'],
		queryFn: () => SalonApi.getAllSalons({ pagination: { skip: 0, take: 100 } }),
	});

	const { data: salonBranches } = useQuery({
		queryKey: ['SALONS-BRANCHES', watch('salonId')?.[0]],
		enabled: !!watch('salonId')?.[0],
		queryFn: () => salonBranchApi.getBranchesList({ salonId: +getValues('salonId')?.[0]! }),
	});

	const { data: mastersData } = useQuery({
		queryKey: ['MASTERS', watch('salonId')?.[0], getValues('salonBranch')?.[0]],
		enabled: !!watch('salonBranch')?.[0] && !!getValues('salonBranch')?.[0]!,
		queryFn: () =>
			mastersListApi.getList({
				salonBranchId: +getValues('salonBranch')?.[0]!,
				salonId: +getValues('salonId')?.[0]!,
			}),
	});

	const { data: services } = useQuery({
		queryKey: ['SERVICES', watch('salonId')?.[0]],
		enabled: !!watch('salonId')?.[0],
		queryFn: () => servicesListApi.getlist({ salonId: +getValues('salonId')[0]! }),
	});

	const salonsCollection = createListCollection({
		items: salons?.list ? salons?.list.map(item => ({ label: item.name, value: item.id })) : [],
	});

	const salonBranchesCollection = createListCollection({
		items: salonBranches?.data.list
			? salonBranches.data.list.map(item => ({ label: item.address, value: item.id }))
			: [],
	});

	const servicesCollection = createListCollection({
		items: services?.data.list
			? services.data.list.map(item => ({
					label: `${item.name} | ${item.price}₽ | время: ${moment()
						.set({
							minutes: item.duration,
							hours: 0,
						})
						.format('HH:mm')}`,
					value: item.id,
				}))
			: [],
	});

	const { data: scheduleData } = useQuery({
		queryKey: ['MASTER_SCHEDULE', watch('masterId')?.[0]],
		enabled: !!watch('masterId')?.[0],
		queryFn: () => masterScheduleApi.getList(watch('masterId')?.[0]),
	});

	const [isOpen, setIsOpen] = useState(false);

	const { data: freeTimeData } = useQuery({
		queryKey: ['MASTER_SCHEDULE', watch('masterId')?.[0], watch('start'), updateEvent?.id],
		enabled: !!scheduleData && !!watch('masterId'),
		queryFn: () =>
			masterScheduleApi.getFreeTime(
				+watch('masterId')?.[0]!,
				moment(watch('start')).format('YYYY.MM.DD'),
				updateEvent?.id,
			),
	});

	const masterCollection = createListCollection({
		items: mastersData?.data.list
			? mastersData.data.list.map(item => ({
					label: `${item.name} ${item.lastName}`,
					value: item.id,
				}))
			: [],
	});

	const deleteEventMutation = useMutation({
		mutationFn: () => {
			const promise = eventsApi.delete(updateEvent?.id!);

			toaster.promise(promise, {
				loading: {
					title: 'Удаление',
				},
				success: {
					title: 'Запись успешно Удалена',
				},
				error: {
					title: 'Что то пошло не так',
				},
			});

			return promise;
		},

		onSuccess: () => {
			setIsOpen(false);
			setEventId();
			refetch();
		},
	});

	const updateEventMutation = useMutation({
		mutationFn: () => {
			let time: number | string[] = watch('duration')?.split(':');
			time = time ? +time[0] * 60 + +time[1] : 0;

			const duration = time
				? time
				: watch('servicesIdArr')?.reduce((prev, serviceId) => {
						if (!services) return 0;

						const service = services.data.list.find(service => +service.id === +serviceId);

						if (!service?.duration) return prev;

						return service?.duration + prev;
					}, 0);

			const promise = eventsApi.update(updateEvent?.id!, {
				salonBranch: +getValues('salonBranch')[0],
				title: getValues('title'),
				masterId: +getValues('masterId')[0],
				start:
					getValues('start').split(' ')[0] +
					' ' +
					moment()
						.set({ hours: 0, minutes: getValues('time') })
						.format('HH:mm'),
				servicesIdArr: getValues('servicesIdArr').map(id => +id),
				duration: duration,
				description: getValues('description'),
				clientComment: getValues('clientComment'),
				clientLastName: getValues('clientLastName'),
				clientName: getValues('clientName'),
				clientNumber: getValues('clientNumber').replaceAll(' ', ''),
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
			refetch();
			setEventId();
			setIsOpen(false);
			reset();
		},
	});

	const renderedValues = freeTimeData?.map(timeMinutes => {
		let fullServicesDuration = watch('servicesIdArr')?.reduce((prev, serviceId) => {
			if (!services) return 0;

			const service = services.data.list.find(service => +service.id === +serviceId);

			if (!service?.duration) return prev;

			return service?.duration + prev;
		}, 0);

		if (watch('duration')) {
			let time: number | string[] = watch('duration').split(':');
			time = +time[0] * 60 + +time[1];

			fullServicesDuration = time;
		}

		const hource = String(Math.floor(timeMinutes / 60));
		const minutes = String(timeMinutes % 60);

		const maxTime = fullServicesDuration + timeMinutes;

		if (maxTime > freeTimeData[freeTimeData.length - 1]) return null;

		return (
			<Button
				size={'xs'}
				onClick={() => setValue('time', timeMinutes)}
				colorPalette={timeMinutes === watch('time') ? 'green' : 'black'}
			>
				{hource.length > 1 ? hource : '0' + hource}:{minutes.length > 1 ? minutes : '0' + minutes}
			</Button>
		);
	});

	useEffect(() => {
		if (!updateEvent) return;
		console.log(updateEvent);

		setValue('title', updateEvent.title);
		//@ts-ignore
		setValue('salonId', [updateEvent.salonBranch.salonId]);
		//@ts-ignore
		setValue('salonBranch', [updateEvent.salonBranch.id]);
		//@ts-ignore
		setValue('masterId', [updateEvent.master.id]);
		setValue('start', updateEvent.start);
		setValue(
			'servicesIdArr',
			//@ts-ignore
			updateEvent.services.map(service => service.id),
		);
		setValue('duration', moment().set({ hours: 0, minutes: updateEvent.duration }).format('HH:mm'));

		const timeHHmm = updateEvent.start.split(' ')[1].split(':');
		const minutes = +timeHHmm[0] * 60 + +timeHHmm[1];
		setValue('time', minutes);
		setValue('description', updateEvent.description);
		setValue('clientComment', updateEvent.clientComment);
		setValue('clientName', updateEvent.clientName);
		setValue('clientLastName', updateEvent.clientLastName);
		setValue('clientNumber', updateEvent.clientNumber.replaceAll(' ', ''));
	}, [updateEvent?.id]);

	console.log(watch('clientNumber'));

	return (
		<DialogRoot
			open={isOpen || updateEvent !== null}
			onOpenChange={e => {
				if (!e.open) {
					setEventId();
					reset({
						clientComment: '',
						clientLastName: '',
						clientName: '',
						clientNumber: '',
						description: '',
						duration: '',
						masterId: [],
						salonBranch: [],
						salonId: [],
						servicesIdArr: [],
						start: '',
						time: undefined,
						title: '',
					});
				}
				setIsOpen(e.open);
			}}
		>
			<DialogTrigger asChild>
				<Button
					mb={5}
					size='md'
					onClick={() => setIsOpen(true)}
				>
					Добавить запись
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Добавить запись</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<Field label='Заголовок записи'>
						<Input {...register('title')} />
					</Field>

					<Field
						marginTop={5}
						label='Салон'
						invalid={!!errors.salonId}
						errorText={errors.salonId?.message}
					>
						<Controller
							control={control}
							name='salonId'
							render={({ field }) => (
								<SelectRoot
									name={field.name}
									value={field.value}
									onValueChange={({ value }) => field.onChange(value)}
									onInteractOutside={() => field.onBlur()}
									collection={salonsCollection}
								>
									<SelectTrigger>
										<SelectValueText placeholder='Салон' />
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
						invalid={!!errors.salonBranch}
						errorText={errors.salonBranch?.message}
						disabled={!!!getValues('salonId')?.[0]}
					>
						<Controller
							control={control}
							name='salonBranch'
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
						invalid={!!errors.masterId}
						errorText={errors.masterId?.message}
						disabled={!!!getValues('salonBranch')?.[0]}
					>
						<Controller
							control={control}
							name='masterId'
							render={({ field }) => (
								<SelectRoot
									name={field.name}
									value={field.value}
									onValueChange={({ value }) => field.onChange(value)}
									onInteractOutside={() => field.onBlur()}
									collection={masterCollection}
								>
									<SelectTrigger>
										<SelectValueText placeholder='Выберете Мастера' />
									</SelectTrigger>
									<SelectContent>
										{masterCollection.items.map(salon => (
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
						label='Дата'
					>
						<Controller
							control={control}
							name='start'
							rules={{ required: true }} //optional
							render={({
								field: { onChange, name, value },
								fieldState: { invalid, isDirty }, //optional
								formState: { errors }, //optional, but necessary if you want to show an error message
							}) => (
								<>
									<DatePicker
										value={value || ''}
										onChange={date => {
											onChange(date?.isValid ? date.format('YYYY.MM.DD') : '');
										}}
										mapDays={day => {
											const activeDate = scheduleData?.find(date => {
												if (
													day.date.format('YYYY.MM.DD') === moment(date.day).format('YYYY.MM.DD')
												) {
													return date;
												}
											});

											return {
												disabled: !!!activeDate,
											};
										}}
										format={'YYYY.MM.DD'}
									/>
									{errors && errors?.[name] && errors?.[name]?.type === 'required' && (
										//if you want to show an error message
										<span>Обязательное поле</span>
									)}
								</>
							)}
						/>
					</Field>
					<Field
						marginTop={5}
						label='Услуги'
						invalid={!!errors.servicesIdArr}
						errorText={errors.servicesIdArr?.message}
						disabled={!!!getValues('salonId')?.[0]}
					>
						<Controller
							control={control}
							name='servicesIdArr'
							render={({ field }) => (
								<SelectRoot
									multiple
									name={field.name}
									value={field.value}
									onValueChange={({ value }) => {
										setValue('time', undefined);
										field.onChange(value);
									}}
									onInteractOutside={() => field.onBlur()}
									collection={servicesCollection}
								>
									<SelectTrigger>
										<SelectValueText placeholder='Выберете Услуги' />
									</SelectTrigger>
									<SelectContent>
										{servicesCollection.items.map(salon => (
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
						label='Длительность'
						errorText={errors.time?.message}
					>
						<InputMask
							mask={'99:99'}
							value={watch('duration')}
							onChange={e => {
								setValue('duration', e.target.value);
								setValue('time', undefined);
							}}
							children={<Input />}
						/>
					</Field>
					<Flex
						gap={2}
						marginTop={5}
						wrap={'wrap'}
					>
						{renderedValues}
					</Flex>

					<Field
						marginTop={5}
						label='комментарий'
					>
						<Input {...register('description')} />
					</Field>

					<Field
						marginTop={5}
						label='Имя клиента'
						required
					>
						<Input
							{...register('clientName', { required: { value: true, message: requiredMessage } })}
						/>
					</Field>

					<Field
						marginTop={5}
						label='Фамилия клиента'
					>
						<Input {...register('clientLastName')} />
					</Field>

					<Field
						marginTop={5}
						label='Коментарий клиента'
					>
						<Input {...register('clientComment')} />
					</Field>

					<Field
						marginTop={5}
						label='Номер телефона'
						errorText={errors.clientNumber?.message}
						required
					>
						<InputMask
							{...register('clientNumber', {
								required: { value: true, message: requiredMessage },
							})}
							value={watch('clientNumber')}
							onChange={e => setValue('clientNumber', e.target.value)}
							mask={'+7 999 999 99 99'}
						>
							<Input
								size={'2xl'}
								placeholder='+7 999 999 99 99'
							/>
						</InputMask>
					</Field>
				</DialogBody>
				<DialogFooter>
					<DialogActionTrigger asChild>
						<Button
							size={'lg'}
							variant='outline'
						>
							Отмена
						</Button>
					</DialogActionTrigger>
					{updateEvent && (
						<Button
							colorPalette={'red'}
							onClick={() => deleteEventMutation.mutate()}
							size={'lg'}
						>
							Удалить
						</Button>
					)}
					<Button
						colorPalette={'green'}
						onClick={handleSubmit(onSubmit)}
						size={'lg'}
					>
						{updateEvent ? 'Обновить' : 'Добавить'}
					</Button>
				</DialogFooter>
				<DialogCloseTrigger />
			</DialogContent>
		</DialogRoot>
	);
};

export default DialogForm;
