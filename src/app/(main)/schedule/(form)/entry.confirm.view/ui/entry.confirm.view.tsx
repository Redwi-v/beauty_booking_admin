'use client';
import { DetailedHTMLProps, FC, InputHTMLAttributes, useState } from 'react';
import s from './entry.confirm.view.module.scss';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import buttonStyles from '@/widgets/controls/ui/controls.module.scss';
import moment from 'moment';
import 'moment/locale/ru';
import { useMutation, useQuery } from 'react-query';
import { SubmitHandler, useForm, UseFormRegisterReturn } from 'react-hook-form';
import ReactInputMask from 'react-input-mask';
import { useAppointmentStore } from '../../appointment/model/appointment.store';
import { MastersListApi } from '@/api/masters.list';
import { servicesListApi } from '@/api/services.list';
import { ICreateBookingData, Service } from '@/api/booking/types';
import { bookingApi } from '@/api/booking';
import { getImagePath } from '@/scripts/helpers/getImagePath';
import { Button, buttonTypes } from '@/components/inputs/button';
moment.locale('ru');

interface IEntryConfirmViewProps {
	salonId: number;
	branchId: number;
	closeForm: () => void;
	activeBookingId: number | null;
}

type Inputs = {
	clientComment: string;
	clientName: string;
	clientPhone: string;
};

export const EntryConfirmView: FC<IEntryConfirmViewProps> = props => {
	const { salonId, branchId, closeForm, activeBookingId } = props;

	const router = useRouter();
	const { clear, date, masterId, services, time, branch } = useAppointmentStore(state => state);

	const { data: activeMaster } = useQuery({
		queryKey: ['activeMaster', masterId],
		queryFn: () => MastersListApi.getOne(masterId!),
		enabled: !!masterId,
	});

	const { data: servicesData } = useQuery({
		queryKey: ['Services'],
		queryFn: () => servicesListApi.getList(),
	});

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<Inputs>({
		mode: 'onChange',
	});
	const onSubmit: SubmitHandler<Inputs> = data => {
		const form: ICreateBookingData = {
			adminComment: data.clientComment,
			clientName: data.clientName,
			clientPhone: data.clientPhone,
			masterId: masterId!,
			salonBranchId: branchId,
			salonId: salonId,
			servicesIdArray: services,
			time: time
				? moment(date).hours(+time.split(':')[0]).minutes(+time.split(':')[1]).toDate()
				: new Date(),
		};

		if (activeBookingId) return updateBookingMutation.mutate(form);

		createBookingMutation.mutate(form);
	};

	const createBookingMutation = useMutation({
		mutationFn: (data: ICreateBookingData) => bookingApi.create(data),
		onSuccess: () => {
			clear();
			closeForm();
		},
	});

	const updateBookingMutation = useMutation({
		mutationFn: (data: Partial<ICreateBookingData>) => bookingApi.update(activeBookingId!, data),
		onSuccess: () => {
			clear();
			closeForm();
		},
	});

	let selectedServices: Service[] = [];
	servicesData?.data?.list?.forEach(item => {
		item.services.forEach(service => {
			//@ts-ignore
			if (services.includes(service.id)) selectedServices.push(service);
		});
	});

	const master = activeMaster;
	const totalMinutes = selectedServices.reduce((value, service) => {
		return (value += service.time);
	}, 0);

	return (
		<div className={`${s.wrapper}`}>
			<div className={`${s.main_info} container`}>
				<h1 className='h1'>Детали записи</h1>

				<div className={`${s.price} ${s.border_bottom}`}>
					<h2 className={`${s.sub_title} h2`}>Услуги</h2>

					{selectedServices.map(service => (
						<div
							key={service.id}
							className={s.price_item}
						>
							<span>{service.name}</span>
							<span>{service.price} ₽</span>
						</div>
					))}
				</div>

				<div className={s.time}>
					<h2 className={`${s.sub_title} h2`}>Дата и время</h2>

					<div className={`${s.info} flex`}>
						<span className='flex'>
							<Image
								width={24}
								height={24}
								src={'/icons/calendar.svg'}
								alt='calendar'
							/>
							{moment(date).locale('ru').format('DD.MM.YYYY (dd)')}
						</span>

						{time && (
							<span className='flex'>
								<Image
									width={24}
									height={24}
									src={'/icons/time.svg'}
									alt='time'
								/>
								{time} -{' '}
								{moment()
									.hours(+time.split(':')[0])
									.minutes(+time.split(':')[1])
									.add({ minutes: totalMinutes })
									.format('HH:mm')}
							</span>
						)}
					</div>
				</div>
			</div>

			<div className={`${s.form} `}>
				<h2 className='h2'> Личные данные</h2>

				<Input
					title='Имя клиента'
					placeholder='Введите имя клиента'
					error={errors?.clientName?.message}
					required
					inputProps={{
						...register('clientName', { required: { value: true, message: 'Поле обязательное' } }),
					}}
				/>
				<Input
					title='Телефон клиента'
					mask='+7 999 999 99 99'
					placeholder='Введите номер телефона клиента'
					error={errors?.clientPhone?.message}
					required
					inputProps={{
						...register('clientPhone', { required: { value: true, message: 'Поле обязательное' } }),
					}}
				/>

				<Input
					title='E-mail клиента'
					placeholder='Введите данные'
				/>
				<Input
					title='Оставте ваш комментарий'
					placeholder='Комментарий к записи'
					inputProps={{ ...register('clientComment') }}
				/>

				<div className={s.send_button}>
					<Button
						buttonParams={{ onClick: handleSubmit(onSubmit) }}
						type={buttonTypes.blue}
					>
						Создать
					</Button>
				</div>
			</div>
		</div>
	);
};

interface IInputProps {
	placeholder?: string;
	title?: string;
	error?: string | null;
	required?: boolean;

	inputProps?: UseFormRegisterReturn<any>;
	mask?: string;
}

const Input: FC<IInputProps> = ({ placeholder, title, error, required, mask, inputProps }) => {
	return (
		<div style={{ width: '100%' }}>
			<span className={`${s.form_title} ${required && s.required}`}>{title}</span>
			{mask ? (
				<ReactInputMask
					mask={mask}
					required={false}
					alwaysShowMask={false}
					placeholder={placeholder}
					{...inputProps}
				/>
			) : (
				<input
					placeholder={placeholder}
					{...inputProps}
				/>
			)}
			{error && <span className={s.err}>{error}</span>}
		</div>
	);
};

const CheckBox = () => {
	const [isActive, setIsActive] = useState(false);

	return (
		<div
			onClick={() => setIsActive(prev => !prev)}
			className={`${s.checkbox}`}
		>
			<div className={`${s.mark} ${isActive && s.active}`}>
				{isActive && (
					<Image
						width={14}
						height={14}
						src={'/icons/ok.svg'}
						alt='checkbox mark'
					/>
				)}
			</div>

			<p>
				Я принимаю <a href='/'>Условия предоставления услуг</a> и
				<a href='/'> Политика конфиденциальности.</a>
			</p>
		</div>
	);
};

const Edit: FC<{ to: string }> = ({ to }) => (
	<Link
		href={to}
		className={s.edit}
	>
		<Image
			width={24}
			height={24}
			src={'/icons/pencil.svg'}
			alt='edit'
		/>
	</Link>
);
