'use client';
import { H1, H2 } from '@/components/containers/text';
import { Button, buttonTypes } from '@/components/inputs/button';
import Input from '@/components/inputs/input';
import { FC, useState } from 'react';
import s from './addresses.page.view.module.scss';
import List from '@/components/ui/list';
import { useMutation, useQuery } from 'react-query';
import { SalonsApi } from '@/api/salons.list';
import { useParams } from 'next/navigation';
import { ISalonBranchCreate } from '@/api/salons.list/types';
import { SubmitHandler, useForm } from 'react-hook-form';
import Popup from 'reactjs-popup';
import { Store } from 'react-notifications-component';
import { notificationSettings } from '../../constants/notification.settings';
interface IAddressesPageViewProps {}

type Inputs = {
	address: string;
	city: string;
};

const AddressesPageView: FC<IAddressesPageViewProps> = props => {
	const {} = props;

	const {
		register,
		handleSubmit,
		watch,
		reset,
		setValue,
		getValues,
		formState: { errors },
	} = useForm<Inputs>();

	const [limit, setLimit] = useState(5);
	const searchParams = useParams();
	const [search, setSearch] = useState('');
	const salonId = typeof searchParams.salonId === 'string' ? searchParams.salonId : '1';

	const [popupOpen, setPopupOpen] = useState(false);
	const [activeEditItem, setActiveEditItem] = useState<null | number>(null);

	const closeModal = () => {
		setActiveEditItem(null);
		setPopupOpen(false);
		reset();
	};
	const openModal = (id?: number) => {
		if (id) {
			setActiveEditItem(id);

			const activeAddress = salonBranches?.list.find(item => item.id === id);

			setValue('address', activeAddress?.address.address || '');
			setValue('city', activeAddress?.address.city || '');
		}

		setPopupOpen(true);
	};

	const onSubmit: SubmitHandler<Inputs> = data => {
		if (activeEditItem) {
			updateBranchMutation.mutate();
			closeModal();
			return;
		}

		createBranchMutation.mutate(data);
	};

	const { data: salonBranches, refetch } = useQuery({
		queryKey: ['salonBranches', salonId, limit],
		queryFn: () => SalonsApi.getSalonBranches(salonId, search),
	});

	const createBranchMutation = useMutation({
		mutationFn: (data: ISalonBranchCreate) => SalonsApi.createSalonBranches(salonId, data),
		onSuccess: () => {
			closeModal();
			refetch();
			reset();
		},
		onError: (res: any) => {
			Store.addNotification({
				...notificationSettings,
				title: res?.response?.data?.message?.[0],
				type: 'danger',
			});
		},
	});

	const updateBranchMutation = useMutation({
		mutationFn: () => {
			return SalonsApi.updateSalonBranches(activeEditItem || 1, {
				address: getValues('address'),
				city: getValues('city'),
			});
		},
		onSuccess: () => {
			refetch();
		},
		onError: (res: any) => {
			Store.addNotification({
				...notificationSettings,
				title: res?.response?.data?.message?.[0],
				type: 'danger',
			});
		},
	});

	const deleteBranchMutation = useMutation({
		mutationFn: () => SalonsApi.deleteBranch(activeEditItem!),
		onSuccess: () => {
			setPopupOpen(false);
			refetch();
		},
	});

	const deleteItem = () => {
		deleteBranchMutation.mutate();
	};

	const items =
		salonBranches && salonBranches.list.length > 0
			? salonBranches.list.map(branch => ({
					id: branch.id,
					title: branch.address.city + ', ' + branch.address.address,
			  }))
			: [];

	return (
		<div>
			<div className={`${s.content} container`}>
				<H1 className={s.title}> Список Адресов: </H1>
				<div className={s.search_block}>
					<Input
						className={s.search}
						inputParams={{
							placeholder: 'Поиск',
							value: search,
							onChange: e => setSearch(e.target.value),
						}}
					/>
					<Button
						buttonParams={{ onClick: () => refetch() }}
						type={buttonTypes.blue}
					>
						Найти
					</Button>
				</div>
				<Button
					type={buttonTypes.blue}
					buttonParams={{ className: s.add_button, onClick: () => openModal() }}
				>
					Добавить +
				</Button>

				<List
					limit={limit}
					setLimit={setLimit}
					items={items}
					editCallBack={openModal}
				/>
			</div>

			<Popup
				open={popupOpen}
				closeOnDocumentClick
				onClose={closeModal}
			>
				<div className='modal'>
					<div className='modal_header'>
						<H2>{activeEditItem ? 'Редактировать' : 'Создать'}</H2>

						<button
							className='close_modal'
							onClick={closeModal}
						>
							<span>&times;</span>
						</button>
					</div>

					<div className={s.form}>
						<Input
							label='Город'
							inputParams={{ ...register('city') }}
							className={s.input}
						/>
						<Input
							label='Адрес'
							inputParams={{ ...register('address') }}
							className={s.input}
						/>
						<div className={s.popup_controls}>
							<Button
								type={buttonTypes.blue}
								buttonParams={{ onClick: handleSubmit(onSubmit), className: s.send_button }}
							>
								Отправить
							</Button>
							{activeEditItem && (
								<Button
									type={buttonTypes.red}
									buttonParams={{ onClick: () => deleteItem(), className: s.delete_button }}
								>
									Удалить
								</Button>
							)}
						</div>
					</div>
				</div>
			</Popup>
		</div>
	);
};

export default AddressesPageView;
