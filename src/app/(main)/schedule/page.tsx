'use client';
import { SalonsApi } from '@/api/salons.list';
import { FC, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import s from './schedule.module.scss';
import Image from 'next/image';
import { getImagePath } from '@/scripts/helpers/getImagePath';
import { MastersListApi } from '@/api/masters.list';

import Calendar from './(form)/Calendar';
import cssIf from '@/scripts/helpers/class.add.if';
import Link from 'next/link';

interface IPageProps {}

const Page: FC<IPageProps> = props => {
	const {} = props;

	const [activeSalonId, setActiveSalonId] = useState<null | number>(null);
	const [activeBranchId, setActiveBranchId] = useState<null | number>(null);
	const [activeMasterId, setActiveMasterId] = useState<null | number>(null);

	const { data: salons } = useQuery({
		queryKey: ['Salons'],
		queryFn: () => SalonsApi.getList(),
	});

	useEffect(() => {
		setActiveMasterId(null);
	}, [activeSalonId, activeBranchId]);

	useEffect(() => {
		if (salons && salons?.list.length !== 0) {
			const salonId = salons.list[0].salonId;
			if (salonId) setActiveSalonId(salonId);
			const activeBranchId = salons.list[0].branches?.[0]?.id;
			if (activeBranchId) setActiveBranchId(activeBranchId);
		}
	}, [salons]);

	useEffect(() => {
		if (activeSalonId) {
			const activeSalon = salons?.list.find(salon => salon.salonId === activeSalonId);
			if (activeSalon?.branches?.[0]?.id) return setActiveBranchId(activeSalon?.branches?.[0]?.id);
			setActiveBranchId(null);
		}
	}, [activeSalonId]);

	const { data: masters, refetch: refetchMasters } = useQuery({
		queryKey: ['Masters', activeSalonId, activeBranchId],
		queryFn: () => MastersListApi.getList(activeSalonId!, activeBranchId!),
		enabled: !!activeSalonId && !!activeBranchId,
	});

	const activeSalon = salons?.list.find(salon => salon.salonId === activeSalonId);

	if (salons?.list.length === 0)
		return (
			<div className={`${s.zero_salons} container`}>
				<span>У вас пока нет салонов и филиалов</span>
				<Link href={'/salons'}>Создать </Link>
			</div>
		);

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

								{activeSalonId === salon.salonId && (
									<ul className={s.branches}>
										{salon.branches?.map(branch => (
											<li key={branch.id}>
												<button
													onClick={() => setActiveBranchId(branch.id)}
													className={`${s.branch_button} ${cssIf(
														activeBranchId === branch.id,
														s.active,
													)}`}
												>
													{branch?.address?.city} {branch?.address?.address}
												</button>
											</li>
										))}
									</ul>
								)}
							</li>
						);
					})}
				</ul>
				<>
					<h2 className='h2'>Выберете мастера</h2>
					<ul className={s.list}>
						<li
							onClick={() => setActiveMasterId(null)}
							className={`${s.list_item} ${!activeMasterId && s.active}`}
						>
							Все
						</li>
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
				{activeBranchId && activeSalonId && (
					<Calendar
						masters={activeSalon ? activeSalon.MasterAccount : []}
						branchId={activeBranchId}
						salonId={activeSalonId}
						refetch={() => {
							refetchMasters();
						}}
						master={masters?.masters.find(master => master.id === activeMasterId)!}
					/>
				)}
			</div>
		</main>
	);
};

export default Page;
