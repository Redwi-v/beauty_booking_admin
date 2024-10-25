'use client'

import { FC } from "react"
import { Button, buttonTypes } from '../../../inputs/button/index';
import s from '../login.forms.module.scss'
import Input from "@/components/inputs/input"
import { authApi } from '@/api/auth';
import { useMutation } from '@tanstack/react-query';
import { ISignUpParams } from '@/api/auth/types';
import { Store } from 'react-notifications-component';
import { notificationSettings } from '@/constants/notification.settings';
import { SubmitHandler, useForm } from 'react-hook-form';
import { requiredMessage } from '@/constants/errors';
import { useRouter } from 'next/navigation';

export const SignUpForm: FC = () => {
	const router = useRouter();

	const signUpMutation = useMutation({
		mutationFn: (params: ISignUpParams) => authApi.signUp(params),
		
		onError: err => {
			Store.addNotification({
				...notificationSettings,
				message: 'Не удалось зарегистрировать аккаунт',
				title: 'error',
				type: 'danger',
			});
		},

		onSuccess: () => {
			router.replace('salons');
		},
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ISignUpParams>();

	const onSubmit: SubmitHandler<ISignUpParams> = data => signUpMutation.mutate(data);

	return (
		<div className={s.form}>
			<Input
				className={s.input}
				isRequired
				label='Email'
				errMessage={errors.email?.message}
				inputParams={{
					placeholder: 'admin@gmail.com',
					...register('email', { required: { value: true, message: requiredMessage } }),
				}}
			/>

			<Input
				className={s.input}
				isRequired
				label='Имя'
				errMessage={errors.name?.message}
				inputParams={{
					placeholder: 'Иван',
					...register('name', { required: { value: true, message: requiredMessage } }),
				}}
			/>

			<Input
				className={s.input}
				isRequired
				label='Фамилия'
				errMessage={errors.lastName?.message}
				inputParams={{
					placeholder: 'Иванов',
					...register('lastName', { required: { value: true, message: requiredMessage } }),
				}}
			/>

			<Input
				className={s.input}
				isRequired
				label='Пароль'
				errMessage={errors.password?.message}
				inputParams={{
					placeholder: '',
					type: 'password',
					...register('password', { required: { value: true, message: requiredMessage } }),
				}}
			/>

			<Button
				type={buttonTypes.blue}
				buttonParams={{
					className: s.next_button,
					onClick: handleSubmit(onSubmit),
				}}
			>
				Далее
			</Button>
		</div>
	);
};