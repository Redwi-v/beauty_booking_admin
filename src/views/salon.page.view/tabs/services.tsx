import { servicesListApi, servicesTagsApi } from '@/api/services.list';
import {
	ActionBarContent,
	ActionBarRoot,
	ActionBarSelectionTrigger,
	ActionBarSeparator,
} from '@/components/ui/action-bar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

import { toaster } from '@/components/ui/toaster';
import { EmptyState } from '@/components/ui/empty-state';
import { InputGroup } from '@/components/ui/input-group';
import {
	PaginationItems,
	PaginationNextTrigger,
	PaginationPageText,
	PaginationPrevTrigger,
	PaginationRoot,
} from '@/components/ui/pagination';
import useDebounce from '@/scripts/hooks/use.debounce';
import {
	Box,
	Center,
	createListCollection,
	Flex,
	HStack,
	Icon,
	IconButton,
	Input,
	Stack,
	Table,
	Text,
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { FC, useEffect, useRef, useState } from 'react';
import { Field } from '@/components/ui/field';

import { SubmitHandler, useForm } from 'react-hook-form';
import { LuBox, LuCrosshair, LuDelete, LuPen, LuSearch, LuX } from 'react-icons/lu';
import { useHookFormMask } from 'use-mask-input';
import {
	PopoverArrow,
	PopoverBody,
	PopoverContent,
	PopoverRoot,
	PopoverTitle,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	SelectContent,
	SelectItem,
	SelectItemGroup,
	SelectLabel,
	SelectRoot,
	SelectTrigger,
	SelectValueText,
} from '@/components/ui/select';
import { INTERCEPTION_ROUTE_REWRITE_MANIFEST } from 'next/dist/shared/lib/constants';
import { log } from 'console';
import { mastersListApi } from '@/api/masters.list';
import moment from 'moment';
interface IServicesTabProps {}

interface Inputs {
	serviceId?: string;
	search: string;
	duration: string;
	name: string;
	price: string;
	serviceTag: number;
	masterAccountsId: string[];
	selectedTag: number;

	newTagValue: string;
}

const ServicesTab: FC<IServicesTabProps> = props => {
	const {} = props;

	const {
		register,
		handleSubmit,
		watch,
		reset,
		setValue,
		setError,
		control,
		clearErrors,
		getValues,

		formState: { errors },
	} = useForm<Inputs>({
		reValidateMode: 'onSubmit',
	});

	const registerWithMask = useHookFormMask(register);

	const onSubmit: SubmitHandler<Inputs> = data => {
		if (!data.selectedTag) {
			setError('selectedTag', { message: 'Поле обязательно' });
			return;
		}

		if ( data.serviceId ) {
			return updateServiceMutation.mutate()
		}

		addServiceMutation.mutate();
	};

	const [search, setSearch] = useState('');
	const searchDebounce = useDebounce(search, 1000);
	const { id } = useParams();

	const {
		data: servicesData,
		isLoading: servicesIsLoading,
		refetch: refetchServicesData,
	} = useQuery({
		queryKey: ['SERVICES', searchDebounce],
		queryFn: () =>
			servicesListApi.getlist({
				search: search,
				salonId: +id!,
			}),
	});

	const { data: servicesTagsData, refetch: refetchServicesTags } = useQuery({
		queryKey: ['SERVICES-TAGS', searchDebounce],
		queryFn: () =>
			servicesTagsApi.get({
				salonId: +id!,
				pagination: {
					skip: 0,
					take: 1000,
				},
			}),
	});

	const onCreateNewTag = () => createNewTagMutation.mutate();

	const createNewTagMutation = useMutation({
		mutationFn: () => {
			const promise = servicesTagsApi.createServiceTag({
				name: getValues('newTagValue'),
				salonId: +id!,
			});

			toaster.promise(promise, {
				loading: {
					title: 'Добавление',
				},
				success: {
					title: 'Запись успешно Добавлена',
				},
				error: {
					title: 'Что то пошло не так',
				},
			});

			return promise;
		},
		onSuccess: () => {
			refetchServicesTags();
		},
	});

	const addServiceMutation = useMutation({
		mutationFn: async () => {
			const promise = servicesListApi.createService({
				duration: +getValues('duration').split(':')[0] * 60 + +getValues('duration').split(':')[1],
				name: getValues('name'),
				price: parseInt(getValues('price')),
				serviceTagId: getValues('selectedTag'),
				masterAccountsId: getValues('masterAccountsId').map(id => +id),
			});

			toaster.promise(promise, {
				loading: {
					title: 'Добавление',
				},
				success: {
					title: 'Запись успешно Добавлена',
				},
				error: {
					title: 'Что то пошло не так',
				},
			});

			return promise;
		},

		onSuccess: () => {
			refetchServicesData();
		},
	});

	const deleteServiceMutation = useMutation({
		mutationFn: () => {
			const promise = servicesListApi.deleteList({ idArr: selection.map(id => +id) });

			toaster.promise(promise, {
				loading: {
					title: 'Удаление',
				},
				success: {
					title: 'Запись успешно Удалена',
				},
				error: {
					title: 'Что то пошло не так',
				},
			});

			return promise;
		},
		onSuccess: () => {
			refetchServicesData();
			setDeleteModalOpen(false);
			setSelection([]);
		},
	});

	const updateServiceMutation = useMutation({
		mutationFn: () => {

			console.log('====================================');
			console.log(watch('selectedTag'));
			console.log('====================================');

			const promise = servicesListApi.update(+watch('serviceId')!, {
				duration: +watch('duration').split(':')[0] * 60 + +watch('duration').split(':')[1],
				masterAccountsId: watch('masterAccountsId').map(id => +id),
				name: watch('name'),
				price: parseInt(watch('price')),
				serviceTagId: watch('selectedTag'),
			});

			toaster.promise(promise, {
				loading: {
					title: 'Удаление',
				},
				success: {
					title: 'Запись успешно О',
				},
				error: {
					title: 'Что то пошло не так',
				},
			});

			return promise;
		}
	})

	const [selection, setSelection] = useState<string[]>([]);

	const paginationItemsCount = 5;

	const hasSelection = selection.length > 0;
	const indeterminate = hasSelection && selection.length < (servicesData?.data?.list?.length || 0);
	const [formModalOpen, setFormModalOpen] = useState(false);
	const [activePage, setActivePage] = useState(1);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);


	

	const rows = servicesData?.data?.list.map(item => (
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
			<Table.Cell
				whiteSpace={'normal'}
				verticalAlign={'middle'}
				w={150}
			>
				{item.name}
			</Table.Cell>
			<Table.Cell
				verticalAlign={'middle'}
				whiteSpace={'normal'}
				display={{ base: 'none', md: 'table-cell' }}
			>
				{item.serviceTag.name}
			</Table.Cell>
			<Table.Cell verticalAlign={'middle'}>
				<Flex
					width={'full'}
					justifyContent={'end'}
					gap={2}
				>
					<IconButton
						onClick={() => {
							setFormModalOpen(true);
							setValue('duration', moment().set({hours: 0, minutes: item.duration}).format('HH:mm'))
							setValue('masterAccountsId', item.masterAccounts.map(master => String(master.id)))
							setValue('name', item.name)
							setValue('price', String(item.price))
							setValue('serviceId', String(item.id))
							setValue('selectedTag',item.serviceTagId)
						}}
					>
						<LuPen />
					</IconButton>
				</Flex>
			</Table.Cell>
		</Table.Row>
	));

	const selectTagsItems = createListCollection({
		items: servicesTagsData
			? servicesTagsData?.data.map(item => ({
					value: String(item.id),
					label: item.name,
				}))
			: [],
	});

	const { data: mastersData } = useQuery({
		queryKey: ['MASTER'],
		queryFn: () => mastersListApi.getList({ salonId: +id! }),
	});

	const selectMastersCollection = createListCollection({
		items: mastersData
			? mastersData?.data.list.map(item => ({
					value: String(item.id),
					label: item.name,
				}))
			: [],
	});

	const contentRef = useRef<HTMLDivElement>(null);

	return (
		<>
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

			{servicesIsLoading || (servicesData?.data && servicesData?.data?.list?.length > 0) ? (
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
													changes.checked && servicesData?.data
														? servicesData?.data?.list.map(item => String(item.id))
														: [],
												);
											}}
										/>
									</Table.ColumnHeader>
									<Table.ColumnHeader
										w={'10'}
										maxW={40}
									>
										Название
									</Table.ColumnHeader>
									<Table.ColumnHeader>Тег</Table.ColumnHeader>
									<Table.ColumnHeader textAlign={'end'}>Редактировать</Table.ColumnHeader>
								</Table.Row>
							</Table.Header>
							<Table.Body marginTop={5}>{rows}</Table.Body>
						</Table.Root>
					</Table.ScrollArea>

					<Button
						onClick={() => {
							reset();
							setFormModalOpen(true);
						}}
						w={'full'}
					>
						Добавить запись
					</Button>
					<Center>
						<PaginationRoot
							count={servicesData?.data?.count || 1}
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
					children={
						<Button
							onClick={() => {
								reset();
								setFormModalOpen(true);
							}}
							w={'full'}
						>
							Добавить запись
						</Button>
					}
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
								deleteServiceMutation.mutate();
							}}
							colorPalette='red'
						>
							Удалить
						</Button>
					</DialogFooter>
					<DialogCloseTrigger />
				</DialogContent>
			</DialogRoot>

			<DialogRoot
				open={formModalOpen}
				onOpenChange={value => setFormModalOpen(value.open)}
				role='alertdialog'
			>
				<DialogContent ref={contentRef}>
					<DialogHeader>
						<DialogTitle>Добавить новую запись</DialogTitle>
					</DialogHeader>
					<DialogBody>
						<Field
							required
							errorText={errors.name?.message}
							label='Название'
						>
							<Input
								{...register('name', { required: { value: true, message: 'Поля обязательное' } })}
							/>
						</Field>

						<Flex gap={4}>
							<Field
								required
								errorText={errors.name?.message}
								label='Длительность'
								mt={4}
							>
								<Input
									{...registerWithMask('duration', 'datetime', {
										inputFormat: 'HH:MM',
										required: { value: true, message: 'Поля обязательное' },
									})}
								/>
							</Field>

							<Field
								required
								errorText={errors.name?.message}
								label='Стоимость'
								mt={4}
								textAlign={'left'}
							>
								<Input
									textAlign={'left'}
									{...registerWithMask('price', 'integer', {
										mask: '999999 ₽',
										required: { value: true, message: 'Поля обязательное' },
										rightAlign: true,
									})}
								/>
							</Field>
						</Flex>

						<Flex
							mt={4}
							direction={'column'}
							gap={2}
						>
							<Field errorText={errors.selectedTag?.message}>
								<SelectRoot
									collection={selectTagsItems}
									value={[String(watch('selectedTag'))]}
									onValueChange={e => {
										setValue('selectedTag', +e.value[0]);
										clearErrors('selectedTag');
									}}
								>
									<SelectLabel>Тег (Категория)</SelectLabel>
									<SelectTrigger>
										<SelectValueText placeholder='Выберете категорию' />
									</SelectTrigger>
									<SelectContent portalRef={contentRef}>
										{selectTagsItems.items.map(movie => (
											<Flex gap={2}>
												<SelectItem
													item={movie}
													key={movie.value}
													cursor={'pointer'}
												>
													{movie.label}
												</SelectItem>
												<IconButton
													colorPalette={'red'}
													size={'xs'}
													margin={1}
												>
													<LuX />
												</IconButton>
											</Flex>
										))}
									</SelectContent>
								</SelectRoot>
							</Field>
							<PopoverRoot>
								<PopoverTrigger asChild>
									<Button
										size='md'
										variant='outline'
										w={'full'}
									>
										Добавть тег
									</Button>
								</PopoverTrigger>
								<PopoverContent portalRef={contentRef}>
									<PopoverArrow />
									<PopoverBody>
										<Field label='Добавить тег'>
											<Input {...register('newTagValue')} />
										</Field>

										<Button
											size={'xs'}
											mt={3}
											colorPalette={'green'}
											onClick={onCreateNewTag}
										>
											Сохранить
										</Button>
									</PopoverBody>
								</PopoverContent>
							</PopoverRoot>
						</Flex>

						<SelectRoot
							multiple
							collection={selectMastersCollection}
							mt={10}
							value={watch('masterAccountsId')}
							onValueChange={e => {
								setValue('masterAccountsId', e.value);
								clearErrors('selectedTag');
							}}
						>
							<SelectLabel>Мастера</SelectLabel>
							<SelectTrigger>
								<SelectValueText placeholder='Выберете мастеров' />
							</SelectTrigger>
							<SelectContent portalRef={contentRef}>
								{selectMastersCollection.items.map(movie => (
									<Flex gap={2}>
										<SelectItem
											item={movie}
											key={movie.value}
											cursor={'pointer'}
										>
											{movie.label}
										</SelectItem>
									</Flex>
								))}
							</SelectContent>
						</SelectRoot>
					</DialogBody>
					<DialogFooter>
						<Button
							colorPalette={'blue'}
							w={'full'}
							onClick={handleSubmit(onSubmit)}
						>
							Сохранить
						</Button>
					</DialogFooter>
					<DialogCloseTrigger />
				</DialogContent>
			</DialogRoot>
		</>
	);
};

export default ServicesTab;
