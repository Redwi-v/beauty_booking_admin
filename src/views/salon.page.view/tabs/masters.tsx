import { mastersListApi } from '@/api/masters.list';
import { ICreateMasterBody, IUpdateMasterBody } from '@/api/masters.list/types';
import { salonBranchApi } from '@/api/salonBranch';
import ImageInput from '@/components/inputs/image.input';
import {
	ActionBarContent,
	ActionBarRoot,
	ActionBarSelectionTrigger,
	ActionBarSeparator,
} from '@/components/ui/action-bar';
import { Avatar } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DialogActionTrigger,
	DialogBackdrop,
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { InputGroup } from '@/components/ui/input-group';
import {
	PaginationItems,
	PaginationNextTrigger,
	PaginationPageText,
	PaginationPrevTrigger,
	PaginationRoot,
} from '@/components/ui/pagination';
import {
	SelectContent,
	SelectItem,
	SelectLabel,
	SelectRoot,
	SelectTrigger,
	SelectValueText,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toaster } from '@/components/ui/toaster';
import { getMinLengthErrorMessage, requiredMessage } from '@/constants/errors';
import { getImagePath } from '@/scripts/helpers/getImagePath';
import useDebounce from '@/scripts/hooks/use.debounce';
import {
	Box,
	Flex,
	Input,
	Stack,
	Table,
	Button,
	Center,
	HStack,
	Icon,
	IconButton,
	Textarea,
	createListCollection,
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FC, useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { LuBox, LuCalendar, LuPen, LuSearch } from 'react-icons/lu';
import { number } from 'yup';
interface IMastersTabProps {}

type Inputs = {
	name: string;
	lastName: string;
	speciality: string;
	about: string;
	canChangeSchedule: boolean;
	canChangeBookingTime: boolean;
	telegramId: number;
	salonBranchId: string;

	id: number;
};

const MastersTab: FC<IMastersTabProps> = props => {
	const {} = props;

	const {
		register,
		handleSubmit,
		watch,
		reset,
		setValue,
		setError,
		control,

		formState: { errors },
	} = useForm<Inputs>();
	const onSubmit: SubmitHandler<Inputs> = data => {
		if (!data.salonBranchId) return setError('salonBranchId', { message: requiredMessage });

		const { id, salonBranchId, ...clearData } = data;

		if (id) {
			updateMasterMutation.mutate({
				id: +id,
				data: {
					salonBranchId: +salonBranchId,
					...clearData,
					avatar: selectedFile,
				},
			});
			return;
		}

		createMasterMutation.mutate({
			...clearData,
			avatar: selectedFile,
			salonBranchId: +salonBranchId,
		});
	};

	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [createModalIsOpen, setCreateModalOpen] = useState(false);

	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const [search, setSearch] = useState('');
	const [activePage, setActivePage] = useState(1);
	const paginationItemsCount = 10;
	const searchDebounce = useDebounce(search, 1000);

	useEffect(() => {
		setActivePage(1);
	}, [searchDebounce]);

	const {
		data: mastersList,
		isLoading: mastersIsLoading,
		refetch: refetchMastersList,
	} = useQuery({
		queryKey: ['MASTERS_DATA'],
		queryFn: () => mastersListApi.getList({}),
	});

	const {
		data: salonsBranchesData,
		isSuccess: branchesDataSuccess,
		isLoading: branchesDataIsLoading,
	} = useQuery({
		queryKey: ['SALON_BRANCH'],
		queryFn: () => salonBranchApi.getBranchesList({}),
	});

	useEffect(() => {
		if (!branchesDataIsLoading && branchesDataSuccess && salonsBranchesData?.data)
			setValue('salonBranchId', String(salonsBranchesData.data.list[0].id));
	}, [branchesDataSuccess, branchesDataIsLoading]);

	const createMasterMutation = useMutation({
		mutationFn: (data: ICreateMasterBody) => {
			const promise = mastersListApi.create(data);

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
			setCreateModalOpen(false);
			refetchMastersList();
			setSelectedFile(null);
		},
	});

	const updateMasterMutation = useMutation({
		mutationFn: (params: { id: number; data: IUpdateMasterBody }) => {
			const promise = mastersListApi.update(params.id, params.data);
			toaster.promise(promise, {
				loading: {
					title: 'Обновление записи',
				},
				success: {
					title: 'Запись успешно обновлена',
				},
				error: {
					title: 'Что то пошло не так',
				},
			});

			return promise;
		},
	});

	const [selection, setSelection] = useState<string[]>([]);

	const hasSelection = selection.length > 0;
	const indeterminate = hasSelection && selection.length < (mastersList?.data.list.length || 0);

	const rows = mastersList?.data?.list.map(item => (
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
					src={item.avatar ? getImagePath(item.avatar) : ''}
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
				{item.name} {item.lastName}
			</Table.Cell>
			<Table.Cell
				verticalAlign={'middle'}
				whiteSpace={'normal'}
				display={{ base: 'none', md: 'table-cell' }}
			>
				{item.about || '- '}
			</Table.Cell>
			<Table.Cell verticalAlign={'middle'}>
				<Flex
					width={'full'}
					justifyContent={'end'}
					gap={2}
				>
					<IconButton>
						<LuCalendar />
					</IconButton>
					<IconButton
						onClick={() => {
							setValue('id', item.id);
							setValue('about', item.about);
							setValue('canChangeBookingTime', item.canChangeBookingTime);
							setValue('canChangeSchedule', item.canChangeSchedule);
							setValue('lastName', item.lastName);
							setValue('name', item.name);
							setValue('salonBranchId', String(item.salonBranchId));
							setValue('speciality', item.speciality);
							setValue('telegramId', +item.telegramId);
							setCreateModalOpen(true);
						}}
					>
						<LuPen />
					</IconButton>
				</Flex>
			</Table.Cell>
		</Table.Row>
	));

	console.log(watch('salonBranchId'));

	const contentRef = useRef<HTMLDivElement>(null);

	const salonsBranchesSelect = createListCollection({
		items: salonsBranchesData?.data
			? salonsBranchesData?.data.list.map(item => ({ value: String(item.id), label: item.address }))
			: [],
	});

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

			{mastersIsLoading || (mastersList?.data && mastersList?.data?.list.length > 0) ? (
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
													changes.checked && mastersList?.data
														? mastersList?.data?.list.map(item => String(item.id))
														: [],
												);
											}}
										/>
									</Table.ColumnHeader>
									<Table.ColumnHeader
										w={'10'}
										maxW={40}
									>
										Фотография
									</Table.ColumnHeader>
									<Table.ColumnHeader>ФИО</Table.ColumnHeader>
									<Table.ColumnHeader display={{ base: 'none', md: 'table-cell' }}>
										о мастере
									</Table.ColumnHeader>
									<Table.ColumnHeader textAlign={'end'}>Действия</Table.ColumnHeader>
								</Table.Row>
							</Table.Header>
							<Table.Body marginTop={5}>{rows}</Table.Body>
						</Table.Root>
					</Table.ScrollArea>

					<Button
						onClick={() => {
							reset();
							setCreateModalOpen(true);
						}}
						w={'full'}
					>
						Добавить запись
					</Button>
					<Center>
						<PaginationRoot
							count={mastersList?.data?.count || 1}
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
								setCreateModalOpen(true);
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
								// deleteSalonsMutation.mutate();
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
				scrollBehavior='outside'
				placement={'top'}
				size={'xl'}
				open={createModalIsOpen}
				onOpenChange={value => setCreateModalOpen(value.open)}
			>
				<DialogContent
					margin={5}
					padding={{ base: 2, md: 10 }}
					rounded={10}
					ref={contentRef}
				>
					<DialogHeader>
						<DialogTitle
							fontSize={'3xl'}
							color={'blue.500'}
						>
							{watch('id') ? 'Обновить Мастера' : 'Добавить мастера'}
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
									startPreview={
										watch('id')
											? getImagePath(
													mastersList?.data.list.find(item => +watch('id') === +item.id)?.avatar ||
														null,
												)
											: undefined
									}
								/>
							</Center>
							<Flex
								flexDirection={'column'}
								width={'full'}
							>
								<Field
									label='Имя'
									required
									mt={5}
									errorText={errors.name?.message}
								>
									<Input
										{...register('name', {
											minLength: { value: 3, message: getMinLengthErrorMessage(3) },
											required: { value: true, message: requiredMessage },
										})}
										placeholder='Имя мастера'
									/>
								</Field>

								<Field
									label='Фамилия'
									required
									mt={5}
									errorText={errors.lastName?.message}
								>
									<Input
										{...register('lastName', {
											minLength: { value: 3, message: getMinLengthErrorMessage(3) },
											required: { value: true, message: requiredMessage },
										})}
										placeholder='Фамилия'
									/>
								</Field>

								<Field
									label='О мастере'
									mt={5}
									errorText={errors.about?.message}
								>
									<Textarea
										size='lg'
										{...register('about')}
										placeholder='Информация о мастере'
									/>
								</Field>

								<Field
									label='Telegram ID'
									required
									mt={5}
									errorText={errors.telegramId?.message}
								>
									<Input
										{...register('telegramId', {
											required: { value: true, message: requiredMessage },
										})}
										placeholder='telegram id'
									/>
								</Field>

								<Field
									label='Специальность'
									required
									mt={5}
									errorText={errors.telegramId?.message}
								>
									<Input
										{...register('speciality', {
											minLength: { value: 3, message: getMinLengthErrorMessage(3) },
											required: { value: true, message: requiredMessage },
										})}
										placeholder='Специальность мастера'
									/>
								</Field>

								<Field errorText={errors.salonBranchId?.message}>
									<SelectRoot
										collection={salonsBranchesSelect}
										mt={5}
										defaultValue={[watch('salonBranchId')]}
										value={[watch('salonBranchId')]}
										onValueChange={e => {
											setValue('salonBranchId', e.value[0]);
										}}
									>
										<SelectLabel>Выберете адрес работы</SelectLabel>
										<SelectTrigger clearable>
											<SelectValueText placeholder='Адрес ' />
										</SelectTrigger>
										<SelectContent portalRef={contentRef}>
											{salonsBranchesSelect.items.map(item => (
												<SelectItem
													item={item}
													key={item.value}
												>
													{item.label}
												</SelectItem>
											))}
										</SelectContent>
									</SelectRoot>
								</Field>

								<Switch
									colorPalette={'blue'}
									marginTop={4}
									checked={watch('canChangeSchedule')}
									onCheckedChange={e => setValue('canChangeSchedule', e.checked)}
								>
									Разрешено редактировать свое расписание
								</Switch>

								<Switch
									colorPalette={'blue'}
									marginTop={4}
									checked={watch('canChangeBookingTime')}
									onCheckedChange={e => setValue('canChangeBookingTime', e.checked)}
								>
									Разрешено менять записи
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
							{watch('id') ? 'Обновить' : 'Добавить'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</DialogRoot>
		</>
	);
};

export default MastersTab;
