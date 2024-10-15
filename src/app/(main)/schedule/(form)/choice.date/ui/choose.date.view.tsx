'use client'
import { Button, DatePicker, TimeListPicker, buttonTypes } from "@/shared/ui";
import { Controls } from "@/widgets/controls";
import { FC, useEffect, useState } from "react";
import moment from "moment";
import { useAppointmentStore } from "@/features/appointment/model/appointment.store";
import { useRouter } from "next/navigation";
import { useQuery } from 'react-query';
import { mastersApi } from '@/shared/api/masters';

interface ChooseDateViewProps {}

const currentDate = new Date();

currentDate.setFullYear(currentDate.getFullYear() - 1);
const MIN_DATE = new Date();

currentDate.setFullYear(currentDate.getFullYear() + 2);
const MAX_DATE = new Date(currentDate);

export const ChooseDateView: FC<ChooseDateViewProps> = () => {
	const {
		setDateAndTime,
		date: stateDate,
		time: stateTime,

		masterId,
		services,
	} = useAppointmentStore(state => state);

	const router = useRouter();

	const [date, setDate] = useState(() => (stateDate ? new Date(stateDate) : new Date()));
	const [time, setTime] = useState(stateTime || '');

	const { data: freeTime } = useQuery({
		queryKey: ['FreeTime', date, masterId, services],
		queryFn: () =>
			mastersApi.getFreeTime({
				date: date,
				masterId,
				servicesIdList: services.map(item => String(item)),
			}),
	});

	const { data: activeMaster } = useQuery({
		queryKey: ['activeMaster', masterId],
		queryFn: () => mastersApi.getOne(masterId),
		enabled: !!masterId,
	});

	useEffect(() => {
		stateDate && setDate(() => new Date(stateDate));
		stateTime && setTime(stateTime);
	}, [stateTime]);

	const clickHandler = () => {
		setDateAndTime(moment(date).format(), time);

		if (!masterId) return router.push('/choice.specialist');
		if (services.length === 0 && masterId) return router.push('/choice.service');

		router.push('/entry.confirm');
	};

	const isEndStep = !!masterId && services.length !== 0;

	return (
		<div className='container'>
			<DatePicker
				value={date}
				onChange={setDate}
				min={MIN_DATE}
				max={MAX_DATE}
				workingDays={activeMaster?.data?.workingDays || []}
			/>

			<TimeListPicker
				steps={freeTime?.data?.freeTime || []}
				time={time}
				setTime={setTime}
			/>

			<Controls>
				{isEndStep ? (
					<Button
						buttonParams={{
							disabled: !time,
							onClick: clickHandler,
						}}
						type={buttonTypes.blue}
					>
						{' '}
						Оформить запись{' '}
					</Button>
				) : (
					<>
						<Button
							buttonParams={{
								onClick: () => router.back(),
							}}
						>
							{' '}
							Назад{' '}
						</Button>

						<Button
							buttonParams={{
								disabled: !time,
								onClick: clickHandler,
							}}
							type={buttonTypes.blue}
						>
							{' '}
							Далее{' '}
						</Button>
					</>
				)}
			</Controls>
		</div>
	);
};
 