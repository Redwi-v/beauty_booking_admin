import React, { Fragment, ReactElement, useMemo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Calendar, Views, DateLocalizer, momentLocalizer } from 'react-big-calendar';
import s from './schedule.module.scss';

const mLocalizer = momentLocalizer(moment);

const ColoredDateCellWrapper = ({ children }: { children: ReactElement }) =>
	React.cloneElement(React.Children.only(children), {
		style: {
			backgroundColor: 'lightblue',
		},
	});

export default function Basic({ localizer = mLocalizer, showDemoLink = true, ...props }) {
	const { components, defaultDate, max, views } = useMemo(
		() => ({
			components: {
				timeSlotWrapper: ColoredDateCellWrapper,
			},
			defaultDate: new Date(2015, 3, 1),
			//@ts-ignore
			max: dates.add(dates.endOf(new Date(2015, 17, 1), 'day'), -1, 'hours'),
			//@ts-ignore
			views: Object.keys(Views).map(k => Views[k]),
		}),
		[],
	);

	return (
		<Fragment>
			<div
				className=''
				{...props}
			>
				<Calendar
					className={s.calendar}
					defaultDate={defaultDate}
					localizer={localizer}
					max={max}
					showMultiDayTimes
					dayLayoutAlgorithm='no-overlap'
					step={60}
					views={views}
					timeslots={12}
				/>
			</div>
		</Fragment>
	);
}
Basic.propTypes = {
	localizer: PropTypes.instanceOf(DateLocalizer),
	showDemoLink: PropTypes.bool,
};
