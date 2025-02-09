'use client';
import { FC, useEffect, useState } from 'react';
import s from './salon.page.view.module.scss';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { SalonApi } from '@/api/salons.list';
import { Avatar } from '@/components/ui/avatar';
import { Box, Center, Flex, Heading, Input, Tabs, Text, Textarea, QrCode } from '@chakra-ui/react';
import { Rating } from '@/components/ui/rating';
import {
	LuAperture,
	LuFolder,
	LuHeartHandshake,
	LuHome,
	LuMap,
	LuMapPin,
	LuPlus,
	LuSettings,
	LuStar,
	LuUser,
} from 'react-icons/lu';
import { getImagePath } from '@/scripts/helpers/getImagePath';
import { Button } from '@/components/ui/button';
import {
	DialogActionTrigger,
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from '@/components/ui/dialog';
import ImageInput from '@/components/inputs/image.input';
import { Field } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { getMinLengthErrorMessage } from '@/constants/errors';
import { IUpdateSalon } from '@/api/salons.list/types';
import { toaster } from '@/components/ui/toaster';
import DotsTab from './tabs/dots';
import MastersTab from './tabs/masters';
import ServicesTab from './tabs/services';
import { ClipboardButton, ClipboardRoot } from '@/components/ui/clipboard';
import Image from 'next/image';
import { LogoIcon } from '@/components/images';

interface SalonPageViewProps {
	id: number;
}
type Inputs = {
	name: string;
	is_open: boolean;
	description: string;
};

const SalonPageView: FC<SalonPageViewProps> = ({ id }) => {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		getValues,
		reset,
		formState: { errors },
	} = useForm<Inputs>();

	const {
		data: salonData,
		refetch,
		isSuccess,
	} = useQuery({
		queryKey: ['SALON_ITEM', id],
		queryFn: () => SalonApi.getSalonById(id),
	});

	const updateSalonMutation = useMutation({
		mutationFn: (data: IUpdateSalon) => {
			return SalonApi.updateSalon(data).catch(() => {
				toaster.error({
					id: String(data.salonId),
					title: 'Что то пошло не так',
				});
			});
		},
		onSuccess: data => {
			if (!data) return;
			refetch();
			toaster.success({
				id: String(data.id),
				title: 'Салон Успешно обновлен',
			});
			setUpdateSalonModal(false);
		},

		onMutate: data => {
			toaster.create({
				id: String(data.salonId),
				type: 'loading',
				title: 'Обновление салона',
			});
		},
	});

	useEffect(() => {
		if (isSuccess) {
			setValue('description', salonData.description);
			setValue('name', salonData.name);
			setValue('is_open', salonData.isOpen);
		}
	}, [isSuccess]);

	const onSubmit = (data: Inputs) => {
		updateSalonMutation.mutate({ ...data, salonId: salonData?.id!, image: file || undefined });
	};

	const [updateSalonModal, setUpdateSalonModal] = useState(false);
	const [file, setFile] = useState<null | File>(null);
	const [salonLinkDialog, setSalonLinkDialog] = useState(false);

	return (
		<main className={`${s.main}`}>
			<DialogRoot
				scrollBehavior='outside'
				placement={'top'}
				size={'xl'}
				open={updateSalonModal}
				onOpenChange={value => setUpdateSalonModal(value.open)}
			>
				<DialogContent
					margin={5}
					padding={{ base: 2, md: 10 }}
					rounded={10}
				>
					<DialogHeader>
						<DialogTitle
							fontSize={'3xl'}
							color={'blue.500'}
						>
							Обновить {salonData?.name}
						</DialogTitle>
						<DialogCloseTrigger />
					</DialogHeader>
					<DialogBody marginTop={8}>
						<Flex
							gap={10}
							flexDirection={{ base: 'column', md: 'row' }}
						>
							<Center alignItems={'start'}>
								<ImageInput
									startPreview={getImagePath(salonData?.logoUrl)}
									selectedFile={file}
									setSelectedFile={setFile}
								/>
							</Center>
							<Flex
								flexDirection={'column'}
								width={'full'}
							>
								<Field
									label='Название'
									required
									errorText={errors.name?.message}
								>
									<Input
										{...register('name', {
											minLength: { value: 3, message: getMinLengthErrorMessage(3) },
										})}
										placeholder='Креативное название салона'
									/>
								</Field>

								<Field
									marginTop={4}
									label='Описание'
								>
									<Textarea
										h={200}
										size='lg'
										{...register('description')}
										placeholder='Чтонибудь о вашем бизнасе'
									/>
								</Field>
								<Switch
									colorPalette={'blue'}
									marginTop={4}
									checked={watch('is_open')}
									onCheckedChange={e => setValue('is_open', e.checked)}
								>
									Салон Активен
								</Switch>
							</Flex>
						</Flex>
					</DialogBody>
					<DialogFooter>
						<Button
							onClick={handleSubmit(onSubmit)}
							colorPalette={'blue'}
							marginTop={6}
							size={'xl'}
							width={'full'}
						>
							Обновить данные
						</Button>
					</DialogFooter>
				</DialogContent>
			</DialogRoot>

			<DialogRoot
				open={salonLinkDialog}
				onOpenChange={e => setSalonLinkDialog(e.open)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Ссылки на салон </DialogTitle>
					</DialogHeader>
					<DialogBody>
						<ClipboardRoot
							value={
								process.env.WEB_APP_URL && salonData?.id
									? process.env.WEB_APP_URL + '/' + salonData?.id
									: ''
							}
						>
							<ClipboardButton />
						</ClipboardRoot>

						<QrCode.Root size={'xl'} marginTop={10} value='https://www.google.com'>
							<QrCode.Frame>
								<QrCode.Pattern />
							</QrCode.Frame>
							<QrCode.DownloadTrigger
								asChild
								fileName='qr-code.png'
								mimeType='image/png'
							>
								<Button
									variant='outline'
									size='xs'
									mt='3'
								>
									Download
								</Button>
							</QrCode.DownloadTrigger>
						</QrCode.Root>
					</DialogBody>
					<DialogFooter>
						<DialogActionTrigger asChild>
							<Button variant='outline'>Закрыть</Button>
						</DialogActionTrigger>
					</DialogFooter>
					<DialogCloseTrigger />
				</DialogContent>
			</DialogRoot>

			<Button
				size={'lg'}
				position={'absolute'}
				right={5}
				top={5}
				variant={'ghost'}
				onClick={() => setUpdateSalonModal(true)}
			>
				<LuSettings />
			</Button>
			<div className='container'>
				<div className={s.profile}>
					<Center>
						<Flex
							alignItems={'center'}
							flexDirection={'column'}
						>
							<Avatar
								size={'full'}
								w={40}
								h={40}
								src={getImagePath(salonData?.logoUrl)}
								name={salonData?.name}
								fontSize={20}
							/>
							<Rating
								marginTop={2}
								colorPalette='yellow'
								readOnly
								fontSize={42}
								defaultValue={5}
							/>
							<Box>
								<Heading
									textAlign={'center'}
									size={'3xl'}
									color={'blue.500'}
									maxW={450}
									margin={'auto'}
								>
									<button onClick={() => setSalonLinkDialog(true)}>{salonData?.name}</button>
								</Heading>
								<Text
									maxW={700}
									textAlign={'center'}
									marginTop={2}
									fontSize={17}
								>
									{salonData?.description}
								</Text>
							</Box>
						</Flex>
					</Center>
				</div>

				<Box marginTop={10}>
					<Tabs.Root
						defaultValue='dots'
						variant={'enclosed'}
						size={{ base: 'sm', md: 'lg' }}
						lazyMount
						unmountOnExit
					>
						<Box overflow={'auto'}>
							<Tabs.List>
								<Tabs.Trigger value='dots'>
									<LuMapPin />
									Точки
								</Tabs.Trigger>
								<Tabs.Trigger value='masters'>
									<LuUser />
									Сотрудники
								</Tabs.Trigger>
								<Tabs.Trigger value='services'>
									<LuHeartHandshake />
									Услуги
								</Tabs.Trigger>
							</Tabs.List>
						</Box>
						<Tabs.Content value='dots'>
							<DotsTab />
						</Tabs.Content>
						<Tabs.Content value='masters'>
							<MastersTab />
						</Tabs.Content>
						<Tabs.Content value='services'>
							<ServicesTab />
						</Tabs.Content>
					</Tabs.Root>
				</Box>
			</div>
		</main>
	);
};

export default SalonPageView;
