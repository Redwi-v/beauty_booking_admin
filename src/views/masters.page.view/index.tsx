'use client';
import { FC, useState } from 'react';
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
import { ICreateMasterBody } from '@/api/masters.list/types';
import { SalonsApi } from '@/api/salons.list';
import Select from 'react-select';

interface MastersPageViewProps {
	salonId: string;
}

type Inputs = ICreateMasterBody;

const MastersPageView: FC<MastersPageViewProps> = ({ salonId }) => {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors },
	} = useForm<Inputs>();

	const [search, setSearch] = useState('');

	const [activeBranchValue, setActiveBranchValue] = useState<{
		value: number;
		label: string;
	} | null>();

	const [open, setOpen] = useState(false);
	const [activeItemId, setActiveItemId] = useState<null | number>(null);

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

	const onSubmit: SubmitHandler<Inputs> = data => {
		if (!activeBranchValue || !data) return;
		const formData: ICreateMasterBody = {
			...data,
			telegramId: data.telegramId,
			salonBranchId: +activeBranchValue?.value,
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
	};

	const closeModal = () => {
		setActiveItemId(null);
		reset();
		setActiveBranchValue(null);
		setOpen(false);
	};

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

						<H2 className='mb-10'>Выберете точку</H2>
						<Select
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

						<Checkbox
							checked={watch('canChangeSchedule')}
							setChecked={(value: boolean) => setValue('canChangeSchedule', value)}
							label='Разрешено менять расписание?'
						/>

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
