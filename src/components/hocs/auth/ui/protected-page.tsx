'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useEffect } from 'react';

export const withAuth = (WrappedComponent: any) => {
	return function WithAuth(props: any) {
		const router = useRouter();

		const { data, isLoading, isError } = useQuery({
			queryFn: authApi.getSession,
			queryKey: ['SESSION'],
			refetchOnWindowFocus: false,
		});

		const path = usePathname();

		useEffect(() => {
			if (data && !isLoading) {
				router.push('/salons');
			}
		}, [data, isLoading]);

		if (isLoading) {
			return <span>loading...</span>;
		}

		if (isError) {
			// router.push('/login');
		}

		return <WrappedComponent {...props} />;
	};
};
