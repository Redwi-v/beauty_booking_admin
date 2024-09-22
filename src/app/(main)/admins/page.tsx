'use client';
import { withAuth } from '@/components/hocs/auth';
import AdminsPageView from '@/views/admins.page.view';

const Page = () => {
	return (
		<main>
			<AdminsPageView />
		</main>
	);
};

export default Page;
