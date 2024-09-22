'use client';
import { withAuth } from '@/components/hocs/auth';
import Navigation from '@/components/ui/navigation';
import type { Metadata } from 'next';
import s from './main.module.scss';

const RootLayout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<div className={s.main}>
			{children}
			<Navigation className={s.navigation} />
		</div>
	);
};

export default withAuth(RootLayout);
