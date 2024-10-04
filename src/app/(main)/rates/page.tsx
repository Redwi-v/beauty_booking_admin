'use client'
import { Button, buttonTypes } from '@/components/inputs/button';
import s from './rates.module.scss'
import { H1, H2, P } from '../../../components/containers/text/index';
import { useMutation } from 'react-query';
import { payApi } from '@/api/pay';
import { useRouter } from 'next/navigation';

export default function Page() {
	const router = useRouter();

	const payMutation = useMutation({
		mutationFn: () => payApi.pay(),
		onSuccess: data => {
			//@ts-ignore
			router.replace(data.data);
		},
	});

	return (
		<main className={`${s.main}`}>
			<div className={s.content}>
				<H1 className={s.title}>Тарифы</H1>
				<ul className={s.list}>
					<li className={s.item}>
						<span>Начальный</span>
						<span>+30 дней</span>
						<Button
							buttonParams={{ onClick: () => payMutation.mutate() }}
							type={buttonTypes.blue}
						>
							Купить 300 руб
						</Button>
					</li>
					<li className={s.item}>
						<span>Стандартный</span>
						<span>+180 дней</span>
						<Button
							buttonParams={{ onClick: () => payMutation.mutate() }}
							type={buttonTypes.blue}
						>
							Купить 600 руб
						</Button>
					</li>
					<li className={s.item}>
						<span>Профи</span>
						<span>+365 дней</span>
						<Button
							buttonParams={{ onClick: () => payMutation.mutate() }}
							type={buttonTypes.blue}
						>
							Купить 1000 руб
						</Button>
					</li>
				</ul>
			</div>
		</main>
	);
}

