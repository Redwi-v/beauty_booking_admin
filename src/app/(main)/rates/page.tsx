'use client'
import { Button, buttonTypes } from '@/components/inputs/button';
import s from './rates.module.scss'
import { H1, H2, P } from '../../../components/containers/text/index';
import { useMutation, useQuery } from '@tanstack/react-query';
import { payApi } from '@/api/pay';
import { useRouter } from 'next/navigation';
import { subscriptionsApi } from '@/api/subscriptions';
import { AdminApi } from '@/api';
import cssIf from '@/scripts/helpers/class.add.if';

export default function Page() {
	const router = useRouter();

	const { data: subscribesTypes } = useQuery({
		queryKey: ['SUBSCRIBES_TYPES'],
		queryFn: () => subscriptionsApi.getSubscriptionsList(),
	});

	const { isLoading, isError, data } = useQuery({
		queryFn: () => AdminApi.getProfile(),
		queryKey: ['PROFILE'],
	});

	const buySubscribeMutation = useMutation({
		mutationFn: (id: number) => subscriptionsApi.buySubscriptions(id),
		onSuccess: data => {
			router.replace(data.data.confirmation.confirmation_url);
		},
	});

	return (
		<main className={`${s.main}`}>
			<div className={s.content}>
				<H1 className={s.title}>Тарифы</H1>
				<ul className={s.list}>
					{subscribesTypes &&
						subscribesTypes.data.map(item => (
							<li
								key={item.id}
								className={`${s.subscribe} ${cssIf(
									data?.data.subscriptionTypeId === item.id,
									s.active,
								)}`}
							>
								<H1 className={` ${s.title}`}>{item.title}</H1>
								<P className={` ${s.sub_title}`}>{item.subTitle}</P>

								<Button
									type={buttonTypes.blue}
									buttonParams={{
										onClick: () => {
											if (item.id === data?.data.subscriptionTypeId) return;
											buySubscribeMutation.mutate(item.id);
										},
									}}
								>
									<P className={` ${s.price}`}>{item.price} руб</P>
									{item.id === data?.data.subscriptionTypeId ? 'Активна' : 'Подписаться'}
								</Button>
							</li>
						))}
				</ul>
			</div>
		</main>
	);
}

