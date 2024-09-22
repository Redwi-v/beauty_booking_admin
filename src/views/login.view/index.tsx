'use client'
import { FC, useState } from "react";
import s from './login.view.module.scss'
import Input from "@/components/inputs/input";
import { Button } from "@/components/inputs/button";
import { buttonTypes } from '../../components/inputs/button/index';
import cssIf from "@/scripts/helpers/class.add.if";

import { SignInForm, SignUpForm } from "@/components/forms/login";

interface LoginViewProps {
  
}
 
const LoginView: FC<LoginViewProps> = () => {
	const [tab, setTab] = useState<'login' | 'signup'>('login');

	const forms = {
		login: <SignInForm />,
		signup: <SignUpForm />,
	};

	return (
		<div className={`${s.wrapper} container`}>
			<div className={s.controls}>
				<Button
					type={cssIf(tab === 'signup', buttonTypes.blue)}
					buttonParams={{
						onClick: () => setTab('signup'),
					}}
				>
					Регистрация
				</Button>

				<Button
					type={cssIf(tab === 'login', buttonTypes.blue)}
					buttonParams={{
						onClick: () => setTab('login'),
					}}
				>
					Вход
				</Button>
			</div>

			{forms[tab]}
		</div>
	);
}
 






export default LoginView;