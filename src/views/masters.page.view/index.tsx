'use client';
import { FC, useEffect, useState } from 'react';
import s from './masters.page.view.module.scss';
import List from '@/components/ui/list';
import { useMutation, useQuery } from 'react-query';
import Avatar from '@/../public/images/no_avatar.jpg';
import { H1, H2 } from '../../components/containers/text/index';
import Popup from 'reactjs-popup';
import { SubmitHandler, useForm } from 'react-hook-form';
import Input from '@/components/inputs/input';
import { Button, buttonTypes } from '@/components/inputs/button';
import { MastersListApi } from '../../api/masters.list/index';
import Checkbox from '@/components/inputs/checkbox';
import { getImagePath } from '@/scripts/helpers/getImagePath';
import { ICreateMasterBody, weeksDays } from '@/api/masters.list/types';
import { SalonsApi } from '@/api/salons.list';
import Select from 'react-select';
import { servicesListApi } from '@/api/services.list';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';

interface MastersPageViewProps {
	salonId: string;
}

interface Inputs extends Omit<ICreateMasterBody, 'startShift' | 'endShift'> {
	startShift?: string;
	endShift?: string;
}

const schema = yup.object({
	startShift: yup
		.string()
		.matches(/(([2][0-3])|([0-1][0-9])):([0-5][0-9])/, 'Не верный формат, верный вид: 19:00'),
	endShift: yup
		.string()
		.matches(/(([2][0-3])|([0-1][0-9])):([0-5][0-9])/, 'Не верный формат, верный вид: 19:00'),
});

const weeks: { [key: string]: string } = {
	[weeksDays.Monday]: 'Пн',
	[weeksDays.Tuesday]: 'Вт',
	[weeksDays.Wednesday]: 'Ср',
	[weeksDays.Thursday]: 'Чт',
	[weeksDays.Friday]: 'Пт',
	[weeksDays.Saturday]: 'Сб',
	[weeksDays.Sunday]: 'Вс',
};

const MastersPageView: FC<MastersPageViewProps> = ({ salonId }) => {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors },

		//@ts-ignore
	} = useForm<Inputs>({ resolver: yupResolver(schema) });

	const [search, setSearch] = useState('');

	const weekClickHandler = (index: number) => {
		setActiveWeekKeys(prev => {
			if (prev.includes(index)) return [...prev].filter(prevIndex => prevIndex !== index);

			return [...prev, index];
		});
	};

	const [activeBranchValue, setActiveBranchValue] = useState<{
		value: number;
		label: string;
	} | null>();

	const [open, setOpen] = useState(false);
	const [activeItemId, setActiveItemId] = useState<null | number>(null);

	const { data: services } = useQuery({
		queryKey: ['Services'],
		queryFn: () => servicesListApi.getList(),
	});

	const [limit, setLimit] = useState(5);

	const { data, refetch } = useQuery({
		queryKey: ['mastersList', limit],
		queryFn: () => MastersListApi.getList(salonId, search),
		keepPreviousData: true,
	});

	const { data: salonBranchesData } = useQuery({
		queryFn: () => SalonsApi.getSalonBranches(salonId),
		queryKey: ['salonBranches', salonId],
		onSuccess: data => {
			// setActiveBranchValue({
			// 	label: data.list[0].address.city + ', ' + data.list[0].address.address,
			// 	value: data.list[0].id,
			// });
		},
	});

	const activeWeeks: number[] =
		data?.masters
			.find(item => item.id === activeItemId)
			?.workingDays.map(item => +weeksDays[item]) || [];

	const [activeWeekKeys, setActiveWeekKeys] = useState<number[]>([
		weeksDays.Monday,
		weeksDays.Tuesday,
		weeksDays.Wednesday,
		weeksDays.Thursday,
		weeksDays.Friday,
	]);

	useEffect(() => {
		if (!activeItemId)
			return setActiveWeekKeys([
				weeksDays.Monday,
				weeksDays.Tuesday,
				weeksDays.Wednesday,
				weeksDays.Thursday,
				weeksDays.Friday,
			]);

		setActiveWeekKeys(activeWeeks);
	}, [activeItemId]);

	const onSubmit: SubmitHandler<Inputs> = data => {
		if (!activeBranchValue || !data || !data.startShift || !data.endShift) return;


		const startShiftDate = moment();
		startShiftDate.hours(+data.startShift.split(':')[0]);
		startShiftDate.minutes(+data.startShift.split(':')[1]);

		const endShiftDate = moment();
		endShiftDate.hours(+data.endShift.split(':')[0]);
		endShiftDate.minutes(+data.endShift.split(':')[1]);

		const formData: ICreateMasterBody = {
			...data,
			telegramId: data.telegramId,
			salonBranchId: +activeBranchValue?.value,
			workingDays: activeWeekKeys.map(item => weeksDays[item]),
			startShift: startShiftDate.toDate(),
			endShift: endShiftDate.toDate(),
		};

		if (activeItemId) {
			return updateMasterMutation.mutate(formData);
		}

		masterMutation.mutate(formData);
	};

	const masterMutation = useMutation({
		mutationFn: (data: ICreateMasterBody) => MastersListApi.create(data),
		onSuccess: () => {
			closeModal();
			refetch();
		},
	});

	const updateMasterMutation = useMutation({
		mutationFn: (data: ICreateMasterBody) => MastersListApi.update(activeItemId!, data),
		onSuccess: () => {
			closeModal();
			refetch();
		},
	});

	const deleteMasterMutation = useMutation({
		mutationFn: (id: number) => MastersListApi.delete(id),
		onSuccess: () => {
			closeModal();
			refetch();
		},
	});

	const openModal = (id: number | null) => {
		setActiveItemId(id);

		setOpen(true);
		reset();

		if (!id) {
			setActiveItemId(null);
			return;
		}

		const activeMaster = data?.masters.find(master => id === master.id);
		if (!activeMaster) return;

		setActiveBranchValue({
			label: activeMaster.salonBranch.address.city,
			value: activeMaster.salonBranch.id,
		});
		setValue('name', activeMaster.name);
		setValue('lastName', activeMaster.lastName);
		setValue('email', activeMaster.email);
		setValue('salonBranchId', activeMaster.salonBranchId);
		setValue('telegramId', String(activeMaster.telegramId));

		setValue('speciality', activeMaster.speciality);
		setValue('canChangeSchedule', activeMaster.canChangeSchedule);
		setValue('startShift', moment(activeMaster.startShift).format('HH:mm'));
		setValue('endShift', moment(activeMaster.endShift).format('HH:mm'));
	};

	const closeModal = () => {
		setActiveItemId(null);
		reset();
		setActiveBranchValue(null);
		setOpen(false);
	};

	const activeServicesOption = data?.masters.find(item => item.id === activeItemId)?.masterService
		?.length
		? data?.masters
				.find(item => item.id === activeItemId)
				?.masterService.map(value => ({
					value: value.id,
					label: value.name,
				}))
		: [];

	let servicesOptions: { value: number; label: string }[] = [];

	if (services) {
		const allOptions: any = [];
		services?.data.list
			.map(item => item.services)
			.forEach(arr => {
				allOptions.push(...arr.map(item => ({ value: item.id, label: item.name })));
			});

		servicesOptions = allOptions;
	}

	const mappedMastersList = data?.masters
		? data?.masters.map(masterItemData => ({
				title: masterItemData.name + ' ' + masterItemData.lastName,
				id: +masterItemData.id,
				avatar: masterItemData.avatar ? getImagePath(masterItemData.avatar) : Avatar,
				additionalInformation: (
					<div className={s.list_additional}>
						<span>Должность: {masterItemData.speciality}</span>
						<span>TelegramId: {masterItemData.telegramId}</span>
						<span>email: {masterItemData.email}</span>
					</div>
				),
		  }))
		: [];

	useEffect(() => {
		setValue(
			'servicesIdArray',
			activeServicesOption?.map(item => item.value),
		);
	}, [activeItemId, data]);

	return (
		<div className='container'>
			<H1 className={s.title}> Список мастеров: </H1>
			<div className={s.search_block}>
				<Input
					className={s.search}
					inputParams={{
						placeholder: 'Поиск',
						value: search,
						onChange: e => setSearch(e.target.value),
					}}
				/>
				<Button
					type={buttonTypes.blue}
					buttonParams={{
						onClick: () => {
							refetch();
						},
					}}
				>
					Найти
				</Button>
			</div>
			<Button
				type={buttonTypes.blue}
				buttonParams={{ onClick: () => openModal(null), className: s.add_button }}
			>
				Добавить +
			</Button>
			<List
				haveMore={false}
				limit={limit}
				setLimit={setLimit}
				items={mappedMastersList}
				editCallBack={openModal}
			/>
			<Popup
				open={open}
				closeOnDocumentClick
				onClose={closeModal}
				className={s.form_popup}
			>
				<div className='modal'>
					<div className='modal_header'>
						<H2>{activeItemId ? 'Редактировать' : 'Создать'}</H2>

						<button
							className='close_modal'
							onClick={() => {
								setOpen(false);
							}}
						>
							<span>&times;</span>
						</button>
					</div>

					<div className={s.form}>
						<Input
							className={s.input}
							isRequired
							label='Имя'
							inputParams={{ ...register('name') }}
						/>
						<Input
							className={s.input}
							isRequired
							label='Фамилия'
							inputParams={{ ...register('lastName') }}
						/>
						<Input
							className={s.input}
							isRequired
							label='email'
							inputParams={{ ...register('email') }}
						/>
						<Input
							className={s.input}
							isRequired
							label='Специальность'
							inputParams={{ ...register('speciality') }}
						/>
						<Input
							className={s.input}
							isRequired
							label='Telegram ID'
							inputParams={{ ...register('telegramId') }}
						/>

						<H2 className={s.title}>Выберете точку</H2>
						<Select
							className='mb-10'
							onChange={data => {
								if (!data) return;
								setActiveBranchValue({
									label: data?.label,
									value: data?.value,
								});
							}}
							value={activeBranchValue}
							options={
								salonBranchesData
									? salonBranchesData.list.map(branch => {
											return {
												value: branch.id,
												label: branch.address.city + ' ' + branch.address.address,
											};
									  })
									: []
							}
						/>

						<H2 className={s.title}>Выберете услуги</H2>
						<Select
							isMulti
							name='colors'
							onChange={value => {
								const newValue = value
									.map(service => service?.value)
									.filter(value => value !== undefined);

								//@ts-ignore
								setValue('servicesIdArray', newValue);
							}}
							value={watch('servicesIdArray')?.map(
								id =>
									({ value: id, label: servicesOptions.find(service => service.value === id) }
										.label),
							)}
							options={servicesOptions}
							className='basic-multi-select'
							classNamePrefix='select'
						/>

						<H2 className={`${s.title}`}>Рабочии дни</H2>
						<ul className={s.weeks}>
							{Object.keys(weeks).map((key, index) => (
								<li key={key}>
									<button
										onClick={() => weekClickHandler(index)}
										className={`${activeWeekKeys.includes(+key) && s.active}`}
									>
										{weeks[key]}
									</button>
								</li>
							))}
						</ul>
						<H2 className={`${s.title}`}>Рабочее время</H2>
						<div className={s.set_work_time}>
							<Input
								errMessage={errors.startShift?.message}
								inputParams={{
									placeholder: 'Начало 09:00',
									...register('startShift'),
								}}
							/>
							<span>:</span>
							<Input
								errMessage={errors.endShift?.message}
								inputParams={{
									placeholder: 'Конец 18:00',
									...register('endShift'),
								}}
							/>
						</div>

						<div style={{ marginTop: 15 }}>
							<Checkbox
								checked={watch('canChangeSchedule')}
								setChecked={(value: boolean) => setValue('canChangeSchedule', value)}
								label='Разрешено менять расписание?'
							/>
						</div>

						<Button
							type={buttonTypes.blue}
							buttonParams={{ onClick: handleSubmit(onSubmit), className: s.send_button }}
						>
							Отправить
						</Button>

						{activeItemId && (
							<Button
								type={buttonTypes.red}
								buttonParams={{
									onClick: () => deleteMasterMutation.mutate(activeItemId),
									className: s.send_button,
								}}
							>
								Удалить
							</Button>
						)}
					</div>
				</div>
			</Popup>
		</div>
	);
};

export default MastersPageView;
