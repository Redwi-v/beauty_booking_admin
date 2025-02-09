'use client';
import s from './rates.module.scss';
import { H1, H2, P } from '../../../components/containers/text/index';
import { useQuery } from '@tanstack/react-query';
import { AdminApi } from '@/api';
import Image from 'next/image';
import Avatar from '@/../public/images/no_avatar.jpg';
import moment from 'moment';
import 'moment/locale/ru';
import { Link } from '@chakra-ui/react';
import { LuExternalLink } from 'react-icons/lu';

export default function Page() {
	const { isLoading, isError, data } = useQuery({
		queryFn: () => AdminApi.getProfile(),
		queryKey: ['PROFILE'],
	});

	if (isLoading) return;

	const subscribeIsActive = moment().isBefore(data?.data.subscriptionEndDate);
	console.log(moment(data?.data.subscriptionStartDate).format('DD MMMM YYYY HH:mm'));

	return (
		<main className={`${s.main}`}>
			<div className={s.content}>
				<H1 className={s.title}>Профиль</H1>
				<div className={s.user_info}>
					{/* <Image
						className={s.avatar}
						width={150}
						height={150}
						alt='avatar'
						src={Avatar}
					/> */}
					<div>
						<P className={s.phoneNumber}>Телефон: {data?.data?.phoneNumber}</P>
						<P className={s.subscription}>
							{subscribeIsActive
								? `Подписка действут до: `
								: 'Подписка кочилась: '}
							{data?.data && (
								<span className={subscribeIsActive ? "" : s.red}>
									{moment(data?.data.subscriptionEndDate).locale('ru').format('DD MMMM YYYY HH:mm')}
								</span>
							)}
						</P>
							<div className={s.controls}>
								
							<Link href={"https://t.me/trener_dev"}>Служба поддержки <LuExternalLink /></Link>
							<Link className={s.red_link} href={"/login"}>Выход </Link>
							</div>
					</div>
				</div>
			</div>
		</main>
	);
}
