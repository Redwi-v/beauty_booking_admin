'use client';
import { FC, useEffect, useRef, useState } from 'react';
import s from './salon.page.view.module.scss';
import { useMutation, useQuery } from 'react-query';
import { SalonsApi } from '@/api/salons.list';
import Avatar from '@/../public/images/no_avatar.jpg';
import Image from 'next/image';
import { H1, H2, P } from '@/components/containers/text';
import { PenIcon, StarIcon } from '@/components/images';
import { Button, buttonTypes } from '@/components/inputs/button';
import { useRouter } from 'next/navigation';
import Popup from 'reactjs-popup';
import Input from '@/components/inputs/input';
import Checkbox from '@/components/inputs/checkbox';
import { useForm } from 'react-hook-form';
import cssIf from '@/scripts/helpers/class.add.if';
import Textarea from '@/components/inputs/input/textarea';
import { getImagePath } from '@/scripts/helpers/getImagePath';
import Link from 'next/link';

interface SalonPageViewProps {
	id: number;
}
type Inputs = {
	name: string;
	is_open: boolean;
	description: string;
};

const SalonPageView: FC<SalonPageViewProps> = ({ id }) => {
	const { data, refetch } = useQuery({
		queryKey: ['SalonItem'],
		queryFn: () => SalonsApi.getOne(id),
	});

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		getValues,
		reset,
		formState: { errors },
	} = useForm<Inputs>();

	useEffect(() => {
		if (!data) return;

		setValue('description', data.description);
		setValue('is_open', data.isOpen);
		setValue('name', data.name);
	}, [data]);

	const closeModal = () => { 
		setOpen(false);
	};

	const [open, setOpen] = useState(false);

	const router = useRouter();

	useEffect(() => {
		setValue('name', data?.name || '');
		setValue('is_open', data?.isOpen || false);
	}, [data]);

	const [image, setImage] = useState();
	const imageRef = useRef(null);

	const { result, uploader } = useDisplayImage();

	const updateSalonMutation = useMutation({
		mutationFn: () =>
			SalonsApi.update(id, {
				description: getValues('description'),
				image: image,
				isOpen: getValues('is_open') ? 1 : 0,
				name: getValues('name'),
			}),
		onSuccess() {
			closeModal();
			refetch();
		},
	});

	return (
		<main className={`${s.main}`}>
			<div className={s.header}>
				<Image
					alt='salon image'
					fill
					src={data?.logoUrl ? getImagePath(data?.logoUrl) : Avatar}
				/>
				<button
					onClick={() => setOpen(true)}
					className={s.edit}
				>
					<PenIcon />
				</button>

				<span className={`${s.is_open} ${cssIf(!!data?.isOpen, s.active)}`}>
					{data?.isOpen ? 'Открыт' : 'Закрыт'}
				</span>
			</div>

			<div className={`${s.header_info} ${s.main_info} container`}>
				<H1 className={s.name}>{data?.name}</H1>

				<div className={s.stars}>
					<StarIcon />
					<StarIcon />
					<StarIcon />
					<StarIcon />
					<StarIcon />
				</div>
			</div>

			<div className={`${s.additional_information} container`}>
				<H2>Описание:</H2>
				<P small>{data?.description}</P>
				<div className={s.app_link}>
					<H2>Ссылка:</H2>
					<Link
						href={`${process.env.TELEGRAM_APP_URL}?startapp=${id}`}
					>{`${process.env.TELEGRAM_APP_URL}?startapp=${id}`}</Link>
				</div>
				<div className={s.controls}>
					<Button
						type={buttonTypes.blue}
						buttonParams={{ onClick: () => router.push(`/masters/${id}`) }}
					>
						Мастера
					</Button>
					<Button
						type={buttonTypes.blue}
						buttonParams={{ onClick: () => router.push(`/services/${id}`) }}
					>
						Услуги
					</Button>
					<Button
						type={buttonTypes.blue}
						buttonParams={{ onClick: () => router.push(`/addresses/${id}`) }}
					>
						Адреса
					</Button>
				</div>
			</div>

			<Popup
				open={open}
				closeOnDocumentClick
				onClose={closeModal}
			>
				<div className='modal'>
					<div className='modal_header'>
						<H2>Редактировать: {data?.name}</H2>

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
						<label className={s.image_input}>
							<input
								type='file'
								onChange={(e: any) => {
									setImage(e.target.files[0]);
									uploader(e);
								}}
							/>
							<Image
								fill
								className={s.image_preview}
								ref={imageRef}
								src={result ? result : data?.logoUrl ? getImagePath(data?.logoUrl) : Avatar}
								alt=''
							/>
						</label>

						<Input
							className={s.input}
							isRequired
							label='Название'
							inputParams={{ ...register('name') }}
						/>
						<Textarea
							className={s.input}
							label='Описание'
							textareaParams={{ ...register('description') }}
						/>
						<Checkbox
							label='Салон Открыт?'
							checked={watch('is_open')}
							setChecked={(value: boolean) => setValue('is_open', value)}
						/>
						<Button
							type={buttonTypes.blue}
							buttonParams={{
								className: s.send_button,
								onClick: () => updateSalonMutation.mutate(),
							}}
						>
							Сохранить
						</Button>
					</div>
				</div>
			</Popup>
		</main>
	);
};

function useDisplayImage() {
	const [result, setResult] = useState('');

	function uploader(e: any) {
		const imageFile = e.target.files[0];

		const reader = new FileReader();
		reader.addEventListener('load', e => {
			//@ts-ignore
			setResult(e.target.result);
		});

		reader.readAsDataURL(imageFile);
	}

	return { result, uploader };
}

export default SalonPageView;
