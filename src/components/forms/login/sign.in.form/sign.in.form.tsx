'use client';

import { FC, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { SubmitHandler, useForm } from 'react-hook-form';

import s from '../login.forms.module.scss';
import { useRouter } from 'next/navigation';
import { ISignInParams } from '@/api/auth/types';
import { authApi } from '@/api/auth';
import { Store } from 'react-notifications-component';
import { notificationSettings } from '@/constants/notification.settings';
import { requiredMessage } from '@/constants/errors';
import { Field } from '@/components/ui/field';
import { Center, Input } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import InputMask from 'react-input-mask';
import { PasswordInput } from '@/components/ui/password-input';

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
			router.push('/salons');
		},
	});

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<ISignInParams>();

	const onSubmit: SubmitHandler<ISignInParams> = data => {
		confirmPhone();
		setShowForm(false);
	};

	const [showForm, setShowForm] = useState(true);

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
				setValue('messageKey', key);
				authApi.sendAuthKey(key);
			},
			() => {
				return signInMutation.mutate({
					password: watch('password'),
					phoneNumber: watch('phoneNumber'),
					messageKey: watch('messageKey'),
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
						className={s.input}
						errorText={errors.password?.message}
						label='Пароль'
						required
					>
						<PasswordInput
							size={'2xl'}
							{...register('password', { required: { value: true, message: requiredMessage } })}
						></PasswordInput>
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
