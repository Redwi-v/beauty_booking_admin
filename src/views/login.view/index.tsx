'use client'
import { FC, useState } from "react";
import s from './login.view.module.scss';
import { buttonTypes } from '../../components/inputs/button/index';
import cssIf from '@/scripts/helpers/class.add.if';

import { SignInForm, SignUpForm } from '@/components/forms/login';
import { Box } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/api/auth';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface LoginViewProps {}

const LoginView: FC<LoginViewProps> = () => {
	const [tab, setTab] = useState<'login' | 'signup'>('login');

	const router = useRouter();

	const forms = {
		login: <SignInForm />,
		signup: <SignUpForm />,
	};

	const { data, isLoading, isError } = useQuery({
		queryFn: authApi.getSession,
		queryKey: ['SESSION'],
		refetchOnWindowFocus: false,
	});

	if (data?.data && !isLoading) router.push('/salons');

	return (
		<Box
			width={{ lg: 700, base: 'full' }}
			my={5}
			className={`${s.wrapper} container`}
		>
			<div className={s.controls}>
				<Button
					type={cssIf(tab === 'signup', buttonTypes.blue)}
					onClick={() => setTab('signup')}
					variant={tab === 'signup' ? 'solid' : 'subtle'}
				>
					Регистрация
				</Button>

				<Button
					type={cssIf(tab === 'login', buttonTypes.blue)}
					onClick={() => setTab('login')}
					variant={tab === 'login' ? 'solid' : 'subtle'}
				>
					Вход
				</Button>
			</div>

			<Box marginTop={10}>{forms[tab]}</Box>
		</Box>
	);
};
 






export default LoginView;