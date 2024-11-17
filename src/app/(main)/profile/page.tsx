'use client';
import s from './rates.module.scss';
import { H1, H2, P } from '../../../components/containers/text/index';
import { useQuery } from '@tanstack/react-query';
import { AdminApi } from '@/api';
import Image from 'next/image';
import Avatar from '@/../public/images/no_avatar.jpg';
import moment from 'moment';

export default function Page() {
	const { isLoading, isError, data } = useQuery({
		queryFn: () => AdminApi.getProfile(),
		queryKey: ['PROFILE'],
	});

	if (isLoading) return;

	return (
		<main className={`${s.main}`}>
			<div className={s.content}>
				<H1 className={s.title}>Профиль</H1>
				<div className={s.user_info}>
					<Image
						className={s.avatar}
						width={150}
						height={150}
						alt='avatar'
						src={Avatar}
					/>
					<div>
						<H2 className={s.name}>
							{data?.data.name} {data?.data.lastName}
						</H2>
						<P className={s.subscription}>Роль: {data?.data?.owner?.role}</P>
						<P className={s.subscription}>
							{data?.data?.subscription?.title}: Действут до{' '}
							<span>
								{moment(data?.data.subscriptionEndDate).locale('ru').format('DD MMMM YYYY HH:mm')}
							</span>
						</P>
					</div>
				</div>
			</div>
		</main>
	);
}
