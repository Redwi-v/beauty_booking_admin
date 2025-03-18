'use client';
import { FC } from 'react';
import FullCalendar from './(form)/Calendar';
import { Container } from '@chakra-ui/react';
import s from './schedule.module.scss'

interface IPageProps {}

const Page: FC<IPageProps> = props => {
	const {} = props;



	return (
		<main>
			<Container
				paddingTop={10}
				paddingBottom={100}
			>

					<FullCalendar />
			</Container>
		</main>
	);
};

export default Page;
