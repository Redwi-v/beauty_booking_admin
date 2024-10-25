'use client'

import { Button, buttonTypes } from '@/components/inputs/button';
import Input from '@/components/inputs/input';
import { FC } from 'react';
import { useMutation } from '@tanstack/react-query';
import { SubmitHandler, useForm } from 'react-hook-form';

import s from '../login.forms.module.scss';
import { useRouter } from 'next/navigation';
import { ISignInParams } from '@/api/auth/types';
import { authApi } from '@/api/auth';
import { Store } from 'react-notifications-component';
import { notificationSettings } from '@/constants/notification.settings';
import { requiredMessage } from '@/constants/errors';

export const SignInForm: FC = () => {
	const router = useRouter();

	const signInMutation = useMutation({
		mutationFn: async (params: ISignInParams) => authApi.signIn(params),
		onError: err => {
			Store.addNotification({
				...notificationSettings,
				message: 'Не удалось войти в аккаунт проверьте email и пароль',
				title: 'error',
				type: 'danger',
			});
		},
		onSuccess: () => {
			router.push('/salons')
		}
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ISignInParams>();

	const onSubmit: SubmitHandler<ISignInParams> = data => {
		signInMutation.mutate(data);
	};

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
				errMessage={errors.password?.message}
				label='Пароль'
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