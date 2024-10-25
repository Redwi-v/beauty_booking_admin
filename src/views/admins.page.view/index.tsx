'use client';
import { FC, useState } from 'react';
import s from './admins.page.view.module.scss';
import List from '@/components/ui/list';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AdminsListApi } from '@/api/admins.list';
import Avatar from '@/../public/images/no_avatar.jpg';
import { H1, H2, P } from '../../components/containers/text/index';
import Popup from 'reactjs-popup';
import { SubmitHandler, useForm } from 'react-hook-form';
import Input from '@/components/inputs/input';
import cssIf from '@/scripts/helpers/class.add.if';
import { Button, buttonTypes } from '@/components/inputs/button';
import { IAdminUpdateParams } from '@/api/admins.list/types';
import { UsersApi } from '@/api/users';
import { IAddUserBody, IUpdateUserBody } from '@/api/users/types';
import { Role } from '@/api/types';
import { AdminApi } from '@/api';
import { axiosErrHandler } from '@/api/instance';

interface AdminsPageViewProps {}

type Inputs = IAddUserBody;

const AdminsPageView: FC<AdminsPageViewProps> = () => {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors },
	} = useForm<Inputs>({
		defaultValues: {
			role: Role.SALON_OWNER,
		},
	});

	const [open, setOpen] = useState(false);
	const [activeAdminId, setActiveAdminId] = useState<null | number>(null);

	const [limit, setLimit] = useState(5);

	const { data, refetch } = useQuery({
		queryKey: ['adminsList', limit],
		queryFn: () => UsersApi.getUsersList(),
		keepPreviousData: true,
	});

	const addAdminMutation = useMutation({
		mutationFn: (userInfo: IAddUserBody) => UsersApi.addUser(userInfo),
		onSuccess(variables) {
			reset();
			closeModal();
			refetch();
		},
		onError(err) {
			axiosErrHandler(err);
		},
	});

	const updateAdminMutation = useMutation({
		mutationFn: (userInfo: IUpdateUserBody) => UsersApi.update(activeAdminId!, userInfo),
		onSuccess(variables) {
			reset();
			closeModal();
			refetch();
		},
		onError(err) {
			axiosErrHandler(err);
		},
	});

	const removeAdminMutation = useMutation({
		mutationFn: () => UsersApi.delete(activeAdminId!),
		onSuccess(variables) {
			reset();
			closeModal();
			refetch();
		},
		onError(err) {
			axiosErrHandler(err);
		},
	});

	const onSubmit: SubmitHandler<Inputs> = data => {
		if (activeAdminId) return updateAdminMutation.mutate(data);
		addAdminMutation.mutate(data);
	};

	const openModal = (id: number | null) => {
		setActiveAdminId(id);
		setOpen(true);
		reset();

		if (!id) {
			setActiveAdminId(null);
			return;
		}

		const activeAdmin = data?.data.list.find(item => item.id === id);

		if (!activeAdmin) return;

		setValue('email', activeAdmin.email);
		setValue('lastName', activeAdmin.SalonOwnerAccount.lastName);
		setValue('name', activeAdmin.SalonOwnerAccount.name);
		setValue('role', activeAdmin.role as Role);
	};

	const closeModal = () => {
		setActiveAdminId(null);
		setOpen(false);
	};

	const {
		isLoading,
		isError,
		data: ProfileData,
	} = useQuery({
		queryFn: () => AdminApi.getProfile(),
		queryKey: ['PROFILE'],
	});

	const mappedItems = data
		? data.data.list.map(item => ({
				title: item.SalonOwnerAccount.name + ' ' + item.SalonOwnerAccount.lastName,
				avatar: Avatar,
				id: +item.id,
				additionalInformation: (
					<>
						<P>Id: {item.id}</P>
						<P>Роль: {item.role}</P>
					</>
				),
		  }))
		: [];

	return (
		<div className='container'>
			<H1 className={s.title}> Список Админов: </H1>
			<Input
				className={s.search}
				inputParams={{ placeholder: 'Поиск' }}
			/>
			<Button
				type={buttonTypes.blue}
				buttonParams={{ onClick: () => openModal(null), className: s.add_button }}
			>
				Добавить +
			</Button>
			<List
				limit={limit}
				setLimit={setLimit}
				items={mappedItems}
				editCallBack={openModal}
			/>
			<Popup
				open={open}
				closeOnDocumentClick
				onClose={closeModal}
			>
				<div className='modal'>
					<div className='modal_header'>
						<H2>{activeAdminId ? 'Редактировать' : 'Создать'}</H2>

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
							label='Логин (email)'
							inputParams={{ ...register('email') }}
						/>
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
						{!activeAdminId && (
							<Input
								className={s.input}
								isRequired
								label='Пароль'
								inputParams={{ ...register('password'), type: 'password' }}
							/>
						)}

						<H2>Укажите уровень прав пользователя</H2>
						<div className={s.choose_rights}>
							<button
								onClick={() => setValue('role', Role.ADMIN)}
								className={`${cssIf(watch('role') === Role.ADMIN, s.active)}`}
							>
								Admin
							</button>
							<button
								onClick={() => setValue('role', Role.SALON_OWNER)}
								className={`${cssIf(watch('role') === Role.SALON_OWNER, s.active)}`}
							>
								Salon owner
							</button>
							<button
								onClick={() => setValue('role', Role.MASTER)}
								className={`${cssIf(watch('role') === Role.MASTER, s.active)}`}
							>
								Master
							</button>
							<button
								onClick={() => setValue('role', Role.CLIENT)}
								className={`${cssIf(watch('role') === Role.CLIENT, s.active)}`}
							>
								Client
							</button>
						</div>

						<div className={s.controls}>
							<Button
								type={buttonTypes.blue}
								buttonParams={{ onClick: handleSubmit(onSubmit), className: s.send_button }}
							>
								Отправить
							</Button>
							{activeAdminId && (
								<Button
									type={buttonTypes.red}
									buttonParams={{
										onClick: () => removeAdminMutation.mutate(),
										className: s.send_button,
									}}
								>
									Удалить
								</Button>
							)}
						</div>
					</div>
				</div>
			</Popup>
		</div>
	);
};

export default AdminsPageView;
