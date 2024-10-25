'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/auth';

export const withAuth = (WrappedComponent: any) => {
	return function WithAuth(props: any) {
		const router = useRouter();

		const { isLoading, isError } = useQuery({
			queryFn: authApi.getSession,
			queryKey: ['SESSION'],
		});

		const path = usePathname();

		console.log(path);

		if (isLoading) {
			return <span>loading...</span>;
		}

		if (isError) {
			// router.push('/login');
		}

		return <WrappedComponent {...props} />;
	};
};
