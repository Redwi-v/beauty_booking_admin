'use client';
import { FC, useState } from 'react';
import s from './salons.page.view.module.scss';
import List from '@/components/ui/list';
import { useMutation, useQuery } from '@tanstack/react-query';
import Avatar from '@/../public/images/no_avatar.jpg';
import { H1, H2, P } from '../../components/containers/text/index';
import Popup from 'reactjs-popup';
import { SubmitHandler, useForm } from 'react-hook-form';
import Input from '@/components/inputs/input';
import { Button, buttonTypes } from '@/components/inputs/button';
import { useRouter } from 'next/navigation';
import { SalonsApi } from '@/api/salons.list';
import Checkbox from '@/components/inputs/checkbox';
import ImageInput from '@/components/inputs/image.input';
import { getImagePath } from '@/scripts/helpers/getImagePath';
import Textarea from '@/components/inputs/input/textarea';

interface SalonsPageViewProps {}

type Inputs = {
	name: string;
	is_open: boolean;
	description: string;
};

const SalonsPageView: FC<SalonsPageViewProps> = () => {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		getValues,
		reset,
		formState: { errors },
	} = useForm<Inputs>({
		defaultValues: {
			is_open: false,
		},
	});

	const { register: searchRegister, getValues: getSearchValues } = useForm<{
		searchValue: string;
	}>();

	const router = useRouter();

	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const onSubmit: SubmitHandler<Inputs> = data => addSalonMutation.mutate();

	const [open, setOpen] = useState(false);

	const openModal = () => {
		setOpen(true);
	};

	const closeModal = () => {
		setOpen(false);
	};

	const [limit, setLimit] = useState(5);

	const { data, refetch } = useQuery({
		queryKey: ['salonsList', limit],
		queryFn: () => SalonsApi.getList(getSearchValues('searchValue')),
	});

	const addSalonMutation = useMutation({
		mutationFn: () => {
			return SalonsApi.createItem({
				name: getValues('name'),
				description: getValues('description'),
				image: selectedFile,
				isOpen: getValues('is_open') ? 1 : 0,
			});
		},

		onSuccess: () => {
			refetch();
			reset();
			closeModal();
		},
	});

	const mappedItems =
		data?.list.map(item => ({
			title: item.name,
			avatar: item.logoUrl ? getImagePath(item.logoUrl) : Avatar,
			id: +item.salonId,
			additionalInformation: (
				<>
					<P className={s.description}>
						{item.description.split('', 120)}
						{item.description.length > 120 ? '...' : ''}
					</P>
					<P className={s.isOpen}>
						Открыт:{' '}
						{item.isOpen ? (
							<span className={s.open}>Да</span>
						) : (
							<span className={s.close}>Нет</span>
						)}
					</P>
				</>
			),
		})) || [];

	return (
		<div className='container'>
			<H1 className={s.title}> Список Салонов: </H1>
			<div className={s.search_block}>
				<Input
					className={s.search}
					inputParams={{ placeholder: 'Поиск', ...searchRegister('searchValue') }}
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
				buttonParams={{ onClick: () => openModal(), className: s.add_button }}
			>
				Добавить +
			</Button>

			<List
				haveMore={false}
				limit={limit}
				setLimit={setLimit}
				items={mappedItems}
				editCallBack={id => router.push(`/salons/${id}`)}
			/>

			<Popup
				open={open}
				closeOnDocumentClick
				onClose={closeModal}
			>
				<div className='modal'>
					<div className='modal_header'>
						<H1>{'Создать'}</H1>

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
						<div className={s.form_main}>
							<ImageInput
								selectedFile={selectedFile}
								setSelectedFile={setSelectedFile}
								className={s.image_input}
							/>
							<Input
								className={s.input}
								isRequired
								label='Название'
								inputParams={{ ...register('name') }}
							/>
						</div>

						<Textarea
							className={s.input}
							label='Описание'
							textareaParams={{ ...register('description') }}
						/>

						<Checkbox
							label='Салон открыт ?'
							checked={watch('is_open')}
							setChecked={(value: boolean) => setValue('is_open', value)}
						/>

						<Button
							type={buttonTypes.blue}
							buttonParams={{ onClick: handleSubmit(onSubmit), className: s.send_button }}
						>
							Отправить
						</Button>
					</div>
				</div>
			</Popup>
		</div>
	);
};

export default SalonsPageView;
