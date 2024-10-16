'use client';
import { SalonsApi } from '@/api/salons.list';
import { FC, useEffect, useState } from 'react';
import { useQuery } from 'react-query';

import s from './schedule.module.scss';
import Image from 'next/image';
import { getImagePath } from '@/scripts/helpers/getImagePath';
import { MastersListApi } from '@/api/masters.list';

import Calendar from './(form)/Calendar';

interface IPageProps {}

const Page: FC<IPageProps> = props => {
	const {} = props;

	const [activeSalonId, setActiveSalonId] = useState<null | number>(null);
	const [activeMasterId, setActiveMasterId] = useState<null | number>(null);

	const { data: salons } = useQuery({
		queryKey: ['Salons'],
		queryFn: () => SalonsApi.getList(),
	});

	useEffect(() => {
		setActiveMasterId(null);
	}, [activeSalonId]);

	const { data: masters, refetch: refetchMasters } = useQuery({
		queryKey: ['Masters', activeSalonId],
		queryFn: () => MastersListApi.getList(activeSalonId!),
		enabled: !!activeSalonId,
		keepPreviousData: true,
	});

	return (
		<main>
			<div className='container'>
				<h2 className='h2'>Выберете салон</h2>
				<ul className={s.list}>
					{salons?.list.map(salon => {
						return (
							<li
								onClick={() => setActiveSalonId(salon.salonId)}
								className={`${s.list_item} ${salon.salonId === activeSalonId && s.active}`}
								key={salon.salonId}
							>
								<Image
									width={50}
									height={50}
									alt='salon'
									quality={100}
									objectFit='cover'
									src={salon.logoUrl ? getImagePath(salon.logoUrl) : '/images/no_avatar.jpg'}
								/>

								<div className={s.info}>
									<span>{salon.name}</span>
								</div>
							</li>
						);
					})}
				</ul>
				{activeSalonId && (
					<>
						<h2 className='h2'>Выберете мастера</h2>
						<ul className={s.list}>
							{masters &&
								masters?.masters?.map(master => {
									return (
										<li
											onClick={() => setActiveMasterId(master.id)}
											className={`${s.list_item} ${master.id === activeMasterId && s.active}`}
											key={master.id}
										>
											<Image
												width={50}
												height={50}
												alt='salon'
												src={master.avatar ? getImagePath(master.avatar) : '/images/no_avatar.jpg'}
											/>

											<div className={s.info}>
												<span>{master.name}</span>
											</div>
										</li>
									);
								})}
						</ul>
					</>
				)}
				{activeMasterId && (
					<Calendar
						refetch={refetchMasters}
						master={masters?.masters.find(master => master.id === activeMasterId)!}
					/>
				)}
			</div>
		</main>
	);
};

export default Page;
