import MastersPageView from '@/views/masters.page.view';

export default async function Page({ params }: { params: any }) {
	return (
		<main>
			<MastersPageView salonId={params.salonId} />
		</main>
	);
}
