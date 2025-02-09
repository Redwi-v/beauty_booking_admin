import { masterScheduleApi } from '@/api/master.schedule';
import { Button } from '@/components/ui/button';
import { Box, Center, Flex, Heading, HStack, IconButton, Input, Tabs } from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { FC, useEffect } from 'react';

import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { HiPlus } from 'react-icons/hi2';
import { LuPen, LuTrash, LuWorkflow } from 'react-icons/lu';
import { Calendar, DateObject } from 'react-multi-date-picker';
import { useHookFormMask, withMask } from 'use-mask-input';

interface IMastersScheduleFormProps {
	masterId: null | number;
	closeForm: () => void;
}

enum buttonActionTypeEnum {
	ADD = 'ADD',
	DELETE = 'DELETE',
	EDIT = 'EDIT',
}

type Inputs = {
	workTimeStart: string;
	workTimeEnd: string;
	freeTime: string[];

	workTimeStartValue: string;
	workTimeEndValue: string;
};

const MastersScheduleForm: FC<IMastersScheduleFormProps> = props => {
	const { masterId, closeForm } = props;

	const {
		register,
		handleSubmit,
		watch,
		setValue: setFormValue,
		formState: { errors },
		getValues,
	} = useForm<Inputs>({
		defaultValues: {
			freeTime: [],
			workTimeStart: '09:00',
			workTimeEnd: '18:00',
			workTimeStartValue: '09:00',
			workTimeEndValue: '18:00',
		},
	});

	const [values, setValues] = useState<DateObject[]>([]);
	const [activeBookingTimes, setActiveBookingTimes] = useState<number[]>([]);
	const [buttonActionType, setButtonActionType] = useState(buttonActionTypeEnum.ADD);

	const { data: scheduleData, refetch } = useQuery({
		queryKey: ['SCHEDULE'],
		queryFn: () => masterScheduleApi.getList(masterId!),
		enabled: !!masterId,
	});

	useEffect(() => {
		if (values[0] && buttonActionType === buttonActionTypeEnum.EDIT) {
			const activeItem = scheduleData?.find(item => {
				return moment(item.day).format('DD.MM.YYYY') === values[0].format('DD.MM.YYYY');
			});

			console.log(activeItem);

			if (!activeItem) return;

			setFormValue('workTimeStartValue', activeItem.start);
			setFormValue('workTimeEndValue', activeItem.end);

			setFormValue('workTimeStart', activeItem.start);
			setFormValue('workTimeEnd', activeItem.end);

			setFormValue('freeTime', activeItem.freeTime);
			setActiveBookingTimes(activeItem.allowedRecordingTime);
		}
	}, [values, buttonActionType]);

	const registerWithMask = useHookFormMask(register);

	const updateScheduleMutation = useMutation({
		mutationFn: () =>
			masterScheduleApi.updateList(
				masterId!,
				values.map(item => ({
					day: item.toDate(),
					end: getValues('workTimeEnd'),
					start: getValues('workTimeStart'),
					freeTime: getValues('freeTime'),
					allowedRecordingTime: activeBookingTimes,
				})),
			),

		onSuccess: () => {
			refetch();
		},
	});

	const updateOneScheduleMutation = useMutation({
		mutationFn: () => {
			const activeItem = scheduleData?.find(item => {
				return moment(item.day).format('DD.MM.YYYY') === values[0].format('DD.MM.YYYY');
			});

			if (!activeItem) throw new Error();

			return masterScheduleApi.updateOne(
				activeItem?.id!,
				values.map(item => ({
					day: item.toDate(),
					end: getValues('workTimeEnd'),
					start: getValues('workTimeStart'),
					freeTime: getValues('freeTime'),
					allowedRecordingTime: activeBookingTimes,
				})),
			);
		},

		onSuccess: () => {
			refetch();
		},
	});

	useEffect(() => {
		setValues([]);
	}, [buttonActionType]);

	const deleteScheduleItem = useMutation({
		mutationFn: () => {
			const activeDates = values.map(item => item.format('DD.MM.YYYY'));

			const idArray = activeDates.map(date => {
				return scheduleData?.find(item => moment(item.day).format('DD.MM.YYYY') === date);
			});

			return masterScheduleApi.delete(idArray.map(item => +item?.id!));
		},

		onSuccess: () => {
			setValues([]);
			refetch();
		},
	});

	const startMinutes = watch('workTimeStart')
		? +watch('workTimeStart').split(':')[0] * 60 + +watch('workTimeStart').split(':')[1]
		: 0;

	const endMinutes = watch('workTimeEnd')
		? +watch('workTimeEnd').split(':')[0] * 60 + +watch('workTimeEnd').split(':')[1]
		: 0;

	const timeValues: number[] = [];

	const freeTime = getValues('freeTime');
	const freeTimeArr = freeTime
		.map(freeTimeString => {
			const startFreeTime = freeTimeString.split('-')[0];
			const endFreeTime = freeTimeString.split('-')[1];

			return [
				+startFreeTime.split(':')[0] * 60 + +startFreeTime.split(':')[1],
				+endFreeTime.split(':')[0] * 60 + +endFreeTime.split(':')[1],
			];
		})
		.filter(arr => arr[0] < arr[1]);

	for (let i = startMinutes; i <= endMinutes; i += 15) {
		const inFreeTime = freeTimeArr.find(([startFreeTime, endFreeTime]) => {
			if (i >= startFreeTime && i < endFreeTime) return true;
		});

		if (!inFreeTime) timeValues.push(i);
	}

	// useEffect(() => {
	// setActiveBookingTimes(timeValues);
	// }, [watch('workTimeStart'), watch('workTimeEnd')]);

	const renderedValues = timeValues.map(item => {
		const hource = String(Math.floor(item / 60));
		const minutes = String(item % 60);

		const selected = activeBookingTimes.includes(item);

		const handle = () => {
			if (selected) {
				setActiveBookingTimes(activeBookingTimes.filter(oldValue => oldValue !== item));
				return;
			}

			setActiveBookingTimes([...activeBookingTimes, item]);
		};

		return (
			<Button
				size={'xs'}
				onClick={() => handle()}
				colorPalette={selected ? 'green' : 'black'}
			>
				{hource.length > 1 ? hource : '0' + hource}:{minutes.length > 1 ? minutes : '0' + minutes}
			</Button>
		);
	});

	return (
		<>
			<Tabs.Root
				variant={'enclosed'}
				value={buttonActionType}
				size={'sm'}
				fontSize={'xs'}
			>
				<Tabs.List>
					<Tabs.Trigger
						onClick={() => setButtonActionType(buttonActionTypeEnum.ADD)}
						value='ADD'
					>
						<LuWorkflow />
						Добавить
					</Tabs.Trigger>
					<Tabs.Trigger
						onClick={() => setButtonActionType(buttonActionTypeEnum.DELETE)}
						value='DELETE'
					>
						<LuTrash />
						Удалить
					</Tabs.Trigger>
					<Tabs.Trigger
						onClick={() => setButtonActionType(buttonActionTypeEnum.EDIT)}
						value='EDIT'
					>
						<LuPen />
						Редактировать
					</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>
			<Center mt={10}>
				<Calendar
					//@ts-ignore
					mapDays={props => {
						let isDisabled;

						if (buttonActionType === buttonActionTypeEnum.ADD) {
							scheduleData?.forEach(item => {
								if (moment(item.day).format('DD.MM.YYYY') === props.date.format('DD.MM.YYYY'))
									return (isDisabled = true);
							});
						}

						if (
							buttonActionType === buttonActionTypeEnum.DELETE ||
							buttonActionType === buttonActionTypeEnum.EDIT
						) {
							const inArray = scheduleData?.find(item => {
								return !(props.date.format('DD.MM.YYYY') !== moment(item.day).format('DD.MM.YYYY'));
							});

							if (inArray) return (isDisabled = false);
							isDisabled = true;
						}

						return {
							disabled: isDisabled,
						};
					}}
					multiple={buttonActionType !== buttonActionTypeEnum.EDIT}
					value={buttonActionType === buttonActionTypeEnum.EDIT ? values[0] : values}
					onChange={value =>
						//@ts-ignore
						setValues(buttonActionType === buttonActionTypeEnum.EDIT ? [value] : value)
					}
				/>
			</Center>

			{buttonActionType !== buttonActionTypeEnum.DELETE && (
				<>
					<Heading
						size={'md'}
						marginTop={4}
						marginBottom={1}
					>
						Время работы
					</Heading>

					<Flex
						alignItems={'center'}
						gap={3}
					>
						<Input
							defaultValue={watch('workTimeStart')}
							{...registerWithMask('workTimeStartValue', 'datetime', {
								inputFormat: 'HH:MM',
							})}
							onBlur={e => {
								setFormValue('workTimeStart', e.target.value);
								setActiveBookingTimes(timeValues);
							}}
						/>

						<span>-</span>
						<Input
							defaultValue={watch('workTimeEnd')}
							{...registerWithMask('workTimeEndValue', 'datetime', {
								inputFormat: 'HH:MM',
							})}
							onBlur={e => {
								setFormValue('workTimeEnd', e.target.value);
								setActiveBookingTimes(timeValues);
							}}
						/>
					</Flex>

					<Button
						colorPalette='blue'
						variant='outline'
						size={'sm'}
						mt={5}
						onClick={() => {
							setFormValue('freeTime', [...watch('freeTime'), '12:00-13:00']);
						}}
					>
						Добавить перерыв <HiPlus />
					</Button>

					<Flex
						direction={'column'}
						mt={3}
						gap={2}
					>
						{watch('freeTime').map((freeTimeItem, index) => {
							const [start, end] = freeTimeItem.split('-');

							return (
								<Flex
									alignItems={'center'}
									gap={3}
								>
									<Input
										ref={withMask('datetime', {
											inputFormat: 'HH:MM',
										})}
										onBlur={e => {
											const oldValues = getValues('freeTime');

											oldValues[index] = e.target.value + '-' + oldValues[index].split('-')[1];

											setFormValue('freeTime', oldValues);
										}}
										defaultValue={start}
									/>
									<span>-</span>
									<Input
										ref={withMask('datetime', {
											inputFormat: 'HH:MM',
										})}
										onBlur={e => {
											const oldValues = getValues('freeTime');

											oldValues[index] = oldValues[index].split('-')[0] + '-' + e.target.value;

											setFormValue('freeTime', oldValues);
										}}
										defaultValue={end}
									/>

									<IconButton
										onClick={() => {
											setFormValue(
												'freeTime',
												getValues('freeTime').filter((_, freeTimeIndex) => index !== freeTimeIndex),
											);
										}}
									>
										<LuTrash />
									</IconButton>
								</Flex>
							);
						})}
					</Flex>
					<Heading
						size={'md'}
						marginTop={4}
						marginBottom={1}
					>
						Время записей
					</Heading>
					<Flex
						gap={2}
						wrap={'wrap'}
						mt={5}
					>
						{renderedValues}
					</Flex>
				</>
			)}

			<Flex
				gap={5}
				mt={10}
			>
				<Button
					size={'sm'}
					onClick={closeForm}
				>
					Отмена
				</Button>

				{(buttonActionType === buttonActionTypeEnum.ADD ||
					buttonActionType === buttonActionTypeEnum.EDIT) && (
					<Button
						colorPalette={'green'}
						size={'sm'}
						onClick={() => {
							if (buttonActionType === buttonActionTypeEnum.EDIT) {
								updateOneScheduleMutation.mutate();
								return;
							}

							updateScheduleMutation.mutate();
						}}
					>
						Сохранить
					</Button>
				)}

				{buttonActionType === buttonActionTypeEnum.DELETE && (
					<Button
						colorPalette={'red'}
						size={'sm'}
						onClick={() => {
							if (values.length <= 0) return;

							deleteScheduleItem.mutate();
						}}
					>
						Удалить
					</Button>
				)}
			</Flex>
		</>
	);
};

export default MastersScheduleForm;
