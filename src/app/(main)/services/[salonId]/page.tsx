import { NextPage } from 'next';
import ServicesPageView from '../../../../views/servises.page.view/index';

interface IPageProps {
	params: {
		salonId: string;
	};
}

const Page: NextPage<IPageProps> = ({ params: { salonId } }) => {
	return (
		<main>
			<ServicesPageView id={salonId} />
		</main>
	);
};
export default Page;
