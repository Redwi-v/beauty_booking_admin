import Image, { StaticImageData } from "next/image";
import { FC, ReactNode } from 'react';

import s from './list.module.scss';
import { H2 } from '@/components/containers/text';
import { PenIcon } from '@/components/images';

interface ListProps {
	items: {
		title: string;
		id: number;
		avatar?: string | StaticImageData;
		additionalInformation?: ReactNode;
	}[];

	editCallBack?: (id: number) => void;
	limit: number;
	setLimit: (value: number) => void;
	haveMore?: boolean;
}

const List: FC<ListProps> = ({ items, editCallBack, limit, setLimit, haveMore }) => {
	return (
		<div className={s.content}>
			<ul className={s.list}>
				{items.map(item => {
					const { avatar, id, title, additionalInformation } = item;

					return (
						<li className={s.item}>
							<div className={s.image}>
								{avatar && (
									<Image
										alt='preview'
										fill
										src={avatar}
									/>
								)}
							</div>

							<div className={s.info}>
								<H2 className={s.title}>{title}</H2>

								{additionalInformation}
							</div>

							<button
								onClick={() => {
									editCallBack?.(id);
								}}
								className={s.edit_button}
							>
								<PenIcon />
							</button>
						</li>
					);
				})}
			</ul>

			{/* <Pagination limit={ 10 } total={ 120 } /> */}

			{haveMore && (
				<button
					className={s.show_more}
					onClick={() => setLimit(limit + 5)}
				>
					{' '}
					Показать еще{' '}
				</button>
			)}
		</div>
	);
};

export default List;