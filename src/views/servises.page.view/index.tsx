'use client';
import { FC, useEffect, useState } from 'react';
import s from './masters.page.view.module.scss';
import List from '@/components/ui/list';
import { useMutation, useQuery } from 'react-query';
import Avatar from '@/../public/images/no_avatar.jpg';
import { H1, H2, P } from '../../components/containers/text/index';
import Popup from 'reactjs-popup';
import { SubmitHandler, useForm } from 'react-hook-form';
import Input from '@/components/inputs/input';
import { Button, buttonTypes } from '@/components/inputs/button';
import { axiosErrHandler, IResponseErr } from '@/api/instance';
import { servicesListApi } from '@/api/services.list';
import { ICreateServiceBody, ICreateServiceRes } from '@/api/services.list/types';
import { useParams, useSearchParams } from 'next/navigation';
import moment from 'moment';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { Store } from 'react-notifications-component';
import { notificationSettings } from '@/constants/notification.settings';

interface ServicesPageViewProps {
	id: string;
}

type Inputs = ICreateServiceBody;

const ServicesPageView: FC<ServicesPageViewProps> = ({ id: salonId }) => {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors },
	} = useForm<Inputs>({});

	const {
		register: searchRegister,
		watch: searchWatch,
		setValue: setSearchValue,
	} = useForm<{ search: string }>();

	const [open, setOpen] = useState(false);
	const [activeItem, setActiveItem] = useState<null | { tagName: string; serviceId: number }>(null);
	const [search, setSearch] = useState('');

	const [limit, setLimit] = useState(5);

	const { data, refetch } = useQuery({
		queryKey: ['servicesList', limit],
		queryFn: () => servicesListApi.getList({ search }),
		keepPreviousData: true,
	});

	const createTagMutation = useMutation({
		mutationFn: (tag: string) => servicesListApi.addTag(tag),
		onSuccess: () => refetch(),
	});
	const deleteTagMutation = useMutation({
		mutationFn: (tagName: string) => servicesListApi.deleteTag(tagName),
		onSuccess: () => refetch(),
		onError: err => {
			axiosErrHandler(err);
		},
	});

	const addItemMutation = useMutation({
		mutationFn: (serviceData: ICreateServiceBody) => servicesListApi.createService(serviceData),
		onSuccess(variables) {
			reset();
			closeModal();
			refetch();
		},
		onError(error) {
			axiosErrHandler(error, { title: 'Ошибка' });
		},
	});

	const updateItemMutation = useMutation({
		mutationFn: (serviceData: ICreateServiceBody) =>
			servicesListApi.updateService(activeItem?.serviceId!, serviceData),
		onSuccess(variables) {
			reset();
			closeModal();
			refetch();
		},
		onError(error) {
			axiosErrHandler(error, { title: 'Ошибка' });
		},
	});

	const deleteServiceMutation = useMutation({
		mutationFn: () => servicesListApi.deleteService(activeItem?.serviceId!),
		onSuccess(variables) {
			reset();
			closeModal();
			refetch();
		},
		onError(error) {
			axiosErrHandler(error, { title: 'Ошибка' });
		},
	});

	const onSubmit: SubmitHandler<Inputs> = data => {
		const mutateData: ICreateServiceBody = {
			name: data.name,
			price: +data.price,
			time: data.time,
			salonId: +salonId,
			tagName: data.tagName,
		};

		if (activeItem) return updateItemMutation.mutate(mutateData);

		addItemMutation.mutate(mutateData);
	};

	const openModal = (id: number | null, tagName?: string) => {
		setOpen(true);
		reset();

		if (!id || !tagName) {
			setActiveItem(null);
			return;
		}

		setActiveItem({ serviceId: +id, tagName });

		const activeItem = data?.data.list
			.find(tagItem => tagItem.tagName === tagName)
			?.services.find(serviceItem => serviceItem.id === id);

		if (!activeItem) return;

		setValue('name', activeItem.name);
		setValue('price', activeItem.price);
		setValue('time', activeItem.time);
		setValue('tagName', activeItem.tagName);
	};

	const closeModal = () => {
		setActiveItem(null);
		setOpen(false);
	};

	useEffect(() => {
		refetch();
	}, [search]);

	return (
		<div className='container'>
			<H1 className={s.title}> Список Услуг: </H1>
			<div className={s.search_block}>
				<Input
					className={s.search}
					inputParams={{
						placeholder: 'Поиск',
						...searchRegister('search'),
					}}
				/>
				<Button
					buttonParams={{
						onClick: () => {
							setSearch(searchWatch('search'));
						},
					}}
					type={buttonTypes.blue}
				>
					Найти
				</Button>
			</div>
			<Button
				type={buttonTypes.blue}
				buttonParams={{ onClick: () => openModal(null), className: s.add_button }}
			>
				Добавить +
			</Button>
			{data?.data.list.map(item => {
				console.log(item);

				const mappedItems = item?.services
					? item?.services
							.filter(item => item.name.includes(search))
							.map(item => ({
								title: item.name,
								avatar: Avatar,
								id: +item.id,
								additionalInformation: (
									<>
										<P>Id: {item.id}</P>
										<P>Цена: {item.price}</P>
										<P>
											Время: {moment().set('hours', 0).set('minutes', item.time).format('HH:mm')} ч
										</P>
									</>
								),
							}))
					: [];

				if (item.services.length === 0) return;
				return (
					<div>
						<H2 className={s.tag_title}>{item.tagName}</H2>
						<List
							// haveMore={data?.data.nextCursor ? data?.data.nextCursor > 0 : false}
							limit={limit}
							setLimit={setLimit}
							items={mappedItems}
							editCallBack={id => openModal(id, item.tagName)}
						/>
					</div>
				);
			})}
			<Popup
				open={open}
				closeOnDocumentClick
				onClose={closeModal}
			>
				<div className='modal'>
					<div className='modal_header'>
						<H2>{activeItem ? 'Редактировать' : 'Создать'}</H2>

						<button
							className='close_modal'
							onClick={() => {
								setOpen(false);
							}}
						>
							<span>&times;</span>
						</button>
					</div>

					<div className={s.form}>
						<Input
							className={s.input}
							isRequired
							label='Название Услуги'
							inputParams={{ ...register('name') }}
						/>
						<Input
							className={s.input}
							isRequired
							label='Цена'
							inputParams={{ ...register('price'), type: 'number', placeholder: '2000' }}
						/>
						<Input
							className={s.input}
							isRequired
							label='Время мин'
							inputParams={{ ...register('time'), type: 'number', placeholder: '120' }}
						/>
						<H2 className='mb-10'>Выберете категорию</H2>
						<CreatableSelect
							onChange={data => {
								if (!data) return;
								setValue('tagName', data?.value);
							}}
							value={{ value: watch('tagName'), label: <>{watch('tagName')}</> }}
							onCreateOption={value => {
								createTagMutation.mutate(value);
							}}
							options={
								data?.data
									? data.data.list.map(branch => {
											return {
												value: branch.tagName,
												label: (
													<div className={s.select_item}>
														<span>{branch.tagName}</span>
														<button
															onClick={e => {
																e.stopPropagation();
																deleteTagMutation.mutate(branch.tagName);
															}}
														>
															X
														</button>
													</div>
												),
											};
									  })
									: []
							}
						/>

						<div className={s.controls}>
							<Button
								type={buttonTypes.blue}
								buttonParams={{ onClick: handleSubmit(onSubmit), className: s.send_button }}
							>
								Отправить
							</Button>
							{activeItem && (
								<Button
									type={buttonTypes.red}
									buttonParams={{
										onClick: () => deleteServiceMutation.mutate(),
										className: s.send_button,
									}}
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

export default ServicesPageView;
