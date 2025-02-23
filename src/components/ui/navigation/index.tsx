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
import {
	LuCalendar,
	LuHand,
	LuHeartHandshake,
	LuMapPin,
	LuPi,
	LuPin,
	LuUser,
} from 'react-icons/lu';
import { Icon } from '@chakra-ui/react';

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

	if (isLoading) return;

	return (
		<div className={`${s.navigation} ${cssIf(!!className, className)}`}>
			{/* {data?.data?.owner?.role === Role.ADMIN && (
				<Link
					className={s.link}
					href={'/admins'}
				>
					<LuPin />
					<span>Админы</span>
				</Link>
			)} */}

			<Link
				className={s.link}
				href={'/salons'}
			>
				<LuMapPin />
				<span>Салоны</span>
			</Link>

			<Link
				className={s.link}
				href={'/profile'}
			>
				<LuUser />
				<span>Профиль</span>
			</Link>

			<Link
				className={s.link}
				href={'/rates'}
			>
				<LuHeartHandshake />
				<span>Тарифы</span>
			</Link>

			<Link
				className={s.link}
				href={'/schedule'}
			>
				<LuCalendar />
				<span>Расписание</span>
			</Link>
		</div>
	);
};
 
export default Navigation;