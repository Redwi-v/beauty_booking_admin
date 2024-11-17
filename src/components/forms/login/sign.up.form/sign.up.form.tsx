'use client';

import { FC, useEffect, useState } from 'react';
import s from '../login.forms.module.scss';
import { authApi } from '@/api/auth';
import { useMutation } from '@tanstack/react-query';
import { ISignUpParams } from '@/api/auth/types';
import { Store } from 'react-notifications-component';
import { notificationSettings } from '@/constants/notification.settings';
import { SubmitHandler, useForm } from 'react-hook-form';
import { getMinLengthErrorMessage, requiredMessage } from '@/constants/errors';
import { useRouter } from 'next/navigation';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Box, Center, Input, InputElement } from '@chakra-ui/react';
import { env } from 'process';
import InputMask from 'react-input-mask';
import { PasswordInput } from '@/components/ui/password-input';
import axios from 'axios';

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
			router.push('/salons');
		},
	});

	const [showForm, setShowForm] = useState(true);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<ISignUpParams & { phoneConfirmKey: string }>();

	const onSubmit: SubmitHandler<ISignUpParams> = data => {
		confirmPhone();
	};

	const confirmPhone = () => {
		//@ts-ignore
		window.VerifyWidget.mount(
			'#phone',
			{
				destination: watch('phoneNumber').replaceAll(' ', ''),
				widgetId: process.env.PHONE_CONFIRM_WIDGET_ID,
				captchaSiteKey: process.env.CAPTCHA_SITEKEY,
			},
			//@ts-ignore
			key => {
				setValue('phoneConfirmKey', key);
				setShowForm(false);
				authApi.sendAuthKey(key);
			},
			() => {
				return signUpMutation.mutate({
					password: watch('password'),
					name: watch('name'),
					lastName: watch('lastName'),
					phoneNumber: watch('phoneNumber'),
					messageKey: watch('phoneConfirmKey'),
				});
			},
		);
	};

	useEffect(() => {
		return () => {
			//@ts-ignore
			window.VerifyWidget?.unmount();
		};
	}, []);

	return (
		<>
			{showForm && (
				<div className={s.form}>
					<Field
						label='Номер телефона'
						errorText={errors.phoneNumber?.message}
						required
						mask={'add:123'}
					>
						<InputMask
							{...register('phoneNumber', {
								required: { value: true, message: requiredMessage },
							})}
							onChange={e => setValue('phoneNumber', e.target.value)}
							mask={'+7 999 999 99 99'}
						>
							<Input
								size={'2xl'}
								placeholder='+7 999 999 99 99'
							/>
						</InputMask>
					</Field>

					<Field
						label='Имя'
						errorText={errors.name?.message}
						marginTop={5}
						required
					>
						<Input
							size={'2xl'}
							placeholder='Иван'
							{...register('name', { required: { value: true, message: requiredMessage } })}
						/>
					</Field>

					<Field
						label='Фамилия'
						errorText={errors.lastName?.message}
						marginTop={5}
						required
					>
						<Input
							size={'2xl'}
							placeholder='Иванов'
							{...register('lastName', { required: { value: true, message: requiredMessage } })}
						/>
					</Field>

					<Field
						label='Пароль'
						errorText={errors.password?.message}
						marginTop={5}
						required
					>
						<PasswordInput
							size={'2xl'}
							placeholder=''
							type='password'
							{...register('password', {
								required: { value: true, message: requiredMessage },
								minLength: { value: 9, message: getMinLengthErrorMessage(9) },
							})}
						/>
					</Field>

					<Button
						width={'full'}
						marginTop={5}
						onClick={handleSubmit(onSubmit)}
					>
						Далее
					</Button>
				</div>
			)}
			<Center id='phone'></Center>
		</>
	);
};
