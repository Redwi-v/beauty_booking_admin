'use client';
import { FC, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
	Box,
	Center,
	DialogActionTrigger,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Flex,
	Heading,
	HStack,
	Icon,
	Input,
	Link as ChakraLink,
	Stack,
	Table,
	Textarea,
} from '@chakra-ui/react';
import { InputGroup } from '@/components/ui/input-group';
import { LuBox, LuPlus, LuSearch } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import {
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogFooter,
	DialogRoot,
} from '@/components/ui/dialog';
import ImageInput from '@/components/inputs/image.input';
import { Field } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { Avatar } from '@/components/ui/avatar';
import { getMinLengthErrorMessage } from '@/constants/errors';
import { SalonApi } from '@/api/salons.list';
import useDebounce from '@/scripts/hooks/use.debounce';
import {
	PaginationItems,
	PaginationNextTrigger,
	PaginationPageText,
	PaginationPrevTrigger,
	PaginationRoot,
} from '@/components/ui/pagination';
import { Checkbox } from '@/components/ui/checkbox';
import { getImagePath } from '@/scripts/helpers/getImagePath';
import { IUpdateSalon } from '@/api/salons.list/types';
import { EmptyState } from '@/components/ui/empty-state';
import { toaster } from '@/components/ui/toaster';
import {
	ActionBarContent,
	ActionBarRoot,
	ActionBarSelectionTrigger,
	ActionBarSeparator,
} from '@/components/ui/action-bar';
import Link from 'next/link';
import axios from 'axios';

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

	// STATE
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const onSubmit = (data: Inputs) => {
		addSalonMutation.mutate();
	};
	const [search, setSearch] = useState('');
	const [activePage, setActivePage] = useState(1);
	const paginationItemsCount = 5;
	const searchDebounce = useDebounce(search, 1000);


	useEffect(() => {
		setActivePage(1);
	}, [searchDebounce]);

	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [createSalonModelOpen, setCreateSalonModelOpen] = useState(false);

	// API
	const {
		data: salonsListData,
		isLoading: salonsIsLoading,
		refetch: refetchSalons,
	} = useQuery({
		queryKey: ['SALONS', searchDebounce, activePage],
		queryFn: () =>
			SalonApi.getAllSalons({
				search: searchDebounce,
				pagination: {
					take: paginationItemsCount,
					skip: activePage === 1 ? 0 : (activePage - 1) * paginationItemsCount,
				},
			}),
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
			refetchSalons();
			toaster.success({
				id: String(data.id),
				title: 'Салон Успешно обновлен',
			});
		},

		onMutate: data => {
			toaster.create({
				id: String(data.salonId),
				type: 'loading',
				title: 'Обновление салона',
			});
		},
	});

	const deleteSalonsMutation = useMutation({
		mutationFn: () => {
			const promise = SalonApi.deleteSalons(selection.map(id => +id)).catch(() => {});

			toaster.promise(promise, {
				loading: {
					title: 'Удаление записей',
				},
				success: {
					title: 'Записи успешно удалены',
				},
				error: {
					title: 'Что то пошло не так',
				},
			});

			return promise;
		},
		onSuccess: () => {
			setDeleteModalOpen(false);
			setSelection([]);
			refetchSalons();
		},
	});

	const addSalonMutation = useMutation({
		mutationFn: () => {
			const promise = SalonApi.createItem({
				name: getValues('name'),
				description: getValues('description'),
				image: selectedFile || undefined,
				isOpen: getValues('is_open'),
			});

			toaster.promise(promise, {
				loading: {
					title: 'Создание записи',
				},
				success: {
					title: 'Запись успешно создана',
				},
				error: {
					title: 'Что то пошло не так',
				},
			});

			return promise;
		},
		onSuccess: () => {
			reset();
			setCreateSalonModelOpen(false);
			refetchSalons();
		},
	});

	const [selection, setSelection] = useState<string[]>([]);

	const hasSelection = selection.length > 0;
	const indeterminate = hasSelection && selection.length < (salonsListData?.list.length || 0);

	const rows = salonsListData?.list.map(item => (
		<Table.Row
			key={item.id}
			data-selected={selection.includes(String(item.id)) ? '' : undefined}
		>
			<Table.Cell verticalAlign={'middle'}>
				<Checkbox
					colorPalette={'blue'}
					variant={'outline'}
					checked={selection.includes(String(item.id))}
					onCheckedChange={changes => {
						setSelection(prev =>
							changes.checked
								? [...prev, String(item.id)]
								: selection.filter(id => id !== String(item.id)),
						);
					}}
				/>
			</Table.Cell>
			<Table.Cell verticalAlign={'middle'}>
				<Avatar
					src={getImagePath(item.logoUrl)}
					name={item.name}
					size={'2xl'}
					shape={'rounded'}
				/>
			</Table.Cell>
			<Table.Cell
				whiteSpace={'normal'}
				verticalAlign={'middle'}
				w={150}
			>
				<Link href={`salons/${item.id}`}>{<ChakraLink>{item.name}</ChakraLink>}</Link>
			</Table.Cell>
			<Table.Cell
				verticalAlign={'middle'}
				whiteSpace={'normal'}
				display={{ base: 'none', md: 'table-cell' }}
			>
				{item.description || '- '}
			</Table.Cell>
			<Table.Cell verticalAlign={'middle'}>
				<Flex
					width={'full'}
					justifyContent={'end'}
				>
					<Switch
						onCheckedChange={e => {
							updateSalonMutation.mutate({
								salonId: item.id,
								isOpen: !item.isOpen,
							});
						}}
						checked={item.isOpen}
					/>
				</Flex>
			</Table.Cell>
		</Table.Row>
	));

	return (
		<div className='container'>
			<Heading
				size='3xl'
				fontWeight={'bold'}
				color={'blue.500'}
			>
				Список салонов:
			</Heading>

			<Flex
				alignItems={'center'}
				marginTop={2}
				gap={3}
			>
				<InputGroup
					flex='100'
					width={'full'}
					startElement={
						<Box paddingLeft={2}>
							<LuSearch />
						</Box>
					}
				>
					<Input
						value={search}
						onChange={e => setSearch(e.target.value)}
						size={'xl'}
						placeholder='Найти'
					/>
				</InputGroup>
			</Flex>

			<DialogRoot
				scrollBehavior='outside'
				placement={'top'}
				size={'xl'}
				open={createSalonModelOpen}
				onOpenChange={value => setCreateSalonModelOpen(value.open)}
			>
				<DialogTrigger asChild>
					<Button
						marginTop={3}
						width={'full'}
						size={'xl'}
					>
						Добавить <LuPlus />
					</Button>
				</DialogTrigger>
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
							Добавить салон
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
									selectedFile={selectedFile}
									setSelectedFile={setSelectedFile}
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
							Добавить
						</Button>
					</DialogFooter>
				</DialogContent>
			</DialogRoot>

			{salonsIsLoading || (salonsListData && salonsListData?.list.length > 0) ? (
				<Stack
					width='full'
					gap='5'
					paddingBottom={40}
				>
					<Table.ScrollArea borderWidth='0px'>
						<Table.Root
							size='lg'
							variant='line'
							marginTop={5}
						>
							<Table.Header>
								<Table.Row>
									<Table.ColumnHeader w='6'>
										<Checkbox
											top='1'
											aria-label='Select all rows'
											checked={indeterminate ? 'indeterminate' : selection.length > 0}
											onCheckedChange={changes => {
												setSelection(
													changes.checked && salonsListData
														? salonsListData?.list.map(item => String(item.id))
														: [],
												);
											}}
										/>
									</Table.ColumnHeader>
									<Table.ColumnHeader w={'10'}>
										<span>Лого</span>
									</Table.ColumnHeader>
									<Table.ColumnHeader
										w={'10'}
										maxW={40}
									>
										Название
									</Table.ColumnHeader>
									<Table.ColumnHeader display={{ base: 'none', md: 'table-cell' }}>
										Описание
									</Table.ColumnHeader>
									<Table.ColumnHeader textAlign={'end'}>Активен</Table.ColumnHeader>
								</Table.Row>
							</Table.Header>
							<Table.Body marginTop={5}>{rows}</Table.Body>
						</Table.Root>
					</Table.ScrollArea>

					<Center>
						<PaginationRoot
							count={salonsListData?.totalCount || 1}
							size={'md'}
							pageSize={paginationItemsCount}
							page={activePage}
							onPageChange={e => setActivePage(e.page)}
							variant='solid'
						>
							<HStack wrap='wrap'>
								<PaginationPrevTrigger />

								<Flex
									display={{ base: 'none', md: 'flex' }}
									alignItems={'center'}
									gap={2}
								>
									<PaginationItems />
								</Flex>
								<Box display={{ base: 'block', md: 'none' }}>
									<PaginationPageText />
								</Box>

								<PaginationNextTrigger />
							</HStack>
						</PaginationRoot>
					</Center>
				</Stack>
			) : searchDebounce ? (
				<EmptyState
					icon={
						<Icon
							fontSize='6xl'
							color='blue.400'
						>
							<LuBox />
						</Icon>
					}
					title='Ничего не нашли по вашему запросу'
				/>
			) : (
				<EmptyState
					icon={
						<Icon
							fontSize='6xl'
							color='blue.400'
						>
							<LuBox />
						</Icon>
					}
					title='У вас пока нет салонов'
				/>
			)}

			<ActionBarRoot open={hasSelection}>
				<ActionBarContent>
					<ActionBarSelectionTrigger>{selection.length} selected</ActionBarSelectionTrigger>
					<ActionBarSeparator />
					<Button
						size='sm'
						colorPalette={'red'}
						onClick={() => setDeleteModalOpen(true)}
					>
						Delete
					</Button>
				</ActionBarContent>
			</ActionBarRoot>

			<DialogRoot
				open={deleteModalOpen}
				onOpenChange={value => setDeleteModalOpen(value.open)}
				role='alertdialog'
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Вы уверены?</DialogTitle>
					</DialogHeader>
					<DialogFooter>
						<DialogActionTrigger asChild>
							<Button variant='outline'>Отмена</Button>
						</DialogActionTrigger>
						<Button
							onClick={() => {
								deleteSalonsMutation.mutate();
							}}
							colorPalette='red'
						>
							Удалить
						</Button>
					</DialogFooter>
					<DialogCloseTrigger />
				</DialogContent>
			</DialogRoot>
		</div>
	);
};

export default SalonsPageView;
