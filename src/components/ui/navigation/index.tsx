'use client'
import { FC, useEffect } from 'react';
import s from './navigation.module.scss';
import Link from 'next/link';
import { ListIcon, UsersIcon } from '@/components/images';
import { useBearStore } from '@/views/login.view/login.store';
import cssIf from '@/scripts/helpers/class.add.if';
import { AdminApi } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { Role } from '@/api/types';
import { useRouter } from 'next/navigation';

interface NavigationProps {
	className?: string;
}

const Navigation: FC<NavigationProps> = ({ className }) => {
	const { activeUser, setActiveUser } = useBearStore();

	const { isLoading, isError, data } = useQuery({
		queryFn: () => AdminApi.getProfile(),
		queryKey: ['PROFILE'],
	});

	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !data?.data.owner) router.push('/login');
	}, [isLoading, data]);

	if (isLoading) return;

	return (
		<div className={`${s.navigation} ${cssIf(!!className, className)}`}>
			{data?.data?.owner?.role === Role.ADMIN && (
				<Link
					className={s.link}
					href={'/admins'}
				>
					<UsersIcon />
					<span>Админы</span>
				</Link>
			)}

			<Link
				className={s.link}
				href={'/salons'}
			>
				<ListIcon />
				<span>Салоны</span>
			</Link>

			<Link
				className={s.link}
				href={'/profile'}
			>
				<ListIcon />
				<span>Профиль</span>
			</Link>

			<Link
				className={s.link}
				href={'/rates'}
			>
				<ListIcon />
				<span>Тарифы</span>
			</Link>

			<Link
				className={s.link}
				href={'/schedule'}
			>
				<ListIcon />
				<span>Расписание</span>
			</Link>
		</div>
	);
};
 
export default Navigation;