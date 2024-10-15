'use client';
import { FC, useEffect, useState } from 'react';
import s from './time.picker.module.scss';
import moment, { Moment } from 'moment';

interface TimeListPickerProps {
	steps: string[];
	setTime?: (time: string) => void;
	time?: string;
}

export const TimeListPicker: FC<TimeListPickerProps> = props => {
	const { steps, setTime, time } = props;

	return (
		<div className={s.time_picker}>
			<h2 className='h2'>Время записи</h2>

			<ul className={`${s.list} flex`}>
				{steps.map((stepTime, index) => (
					<li key={index}>
						<button
							onClick={() => setTime?.(stepTime)}
							className={`${s.button} ${time === stepTime && s.active}`}
						>
							{stepTime}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};

function getTimes(start: string, end: string): string[] {
	let result: string[] = [];
	let current = moment(start, 'HH:mm');

	const endTime = {
		hours: end.split(':')[0],
		minutes: end.split(':')[1],
	};

	const endMoment = moment()
		.set('hour', +endTime.hours)
		.set('minute', +endTime.minutes)
		.set('second', 0);
	console.log(current.isBefore(moment(endMoment)));

	while (current.isBefore(endMoment)) {
		result.push(current.format('HH:mm'));
		current = moment(current).add(30, 'minutes');
	}

	return result;
}
