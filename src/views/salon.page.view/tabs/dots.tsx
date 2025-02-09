'use client';
import { salonBranchApi } from '@/api/salonBranch';
import { ICreateSalonBranch, IUpdateSalonBranch } from '@/api/salonBranch/types';
import s from '../salon.page.view.module.scss';
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
	DialogCloseTrigger,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import {
	PaginationItems,
	PaginationNextTrigger,
	PaginationPageText,
	PaginationPrevTrigger,
	PaginationRoot,
} from '@/components/ui/pagination';
import { Switch } from '@/components/ui/switch';
import { toaster } from '@/components/ui/toaster';
import useDebounce from '@/scripts/hooks/use.debounce';
import {
	Box,
	Center,
	Link as ChakraLink,
	DialogBody,
	Flex,
	HStack,
	Icon,
	Input,
	Stack,
	Table,
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { LuBox, LuPointer, LuSearch } from 'react-icons/lu';
import { Map, Placemark, SearchControl } from '@pbe/react-yandex-maps';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Field } from '@/components/ui/field';
import { getMinLengthErrorMessage, requiredMessage } from '@/constants/errors';
import { useParams } from 'next/navigation';
import { InputGroup } from '@/components/ui/input-group';

interface IDotsTabProps {}

type Inputs = {
	address: string;
	id?: number;

	latitude?: number;
	longitude?: number;
};

const DotsTab: FC<IDotsTabProps> = props => {
	const {} = props;

	const { id } = useParams();

	const {
		register,
		handleSubmit,
		watch,
		getValues,
		reset,
		formState: { errors },
		setValue,
	} = useForm<Inputs>({
		defaultValues: {
			address: '',
			latitude: 55.75,
			longitude: 37.57,
		},
	});

	const [startCoordinates, setStartCoordinates] = useState([55.75, 37.57]);

	const onSubmit: SubmitHandler<Inputs> = data => {
		if (Array.isArray(id)) return;
		if (data.id) {
			return updateSalonBranchMutation.mutate({
				salonId: +id,
				address: data.address,
				latitude: String(getValues('latitude')!),
				longitude: String(getValues('longitude')!),
				id: data.id,
			});
		}

		createSalonBranchMutation.mutate({
			address: data.address,
			isOpen: false,
			salonId: +id,
			latitude: String(getValues('latitude')!),
			longitude: String(getValues('longitude')!),
		});
	};

	const [search, setSearch] = useState('');
	const [activePage, setActivePage] = useState(1);
	const paginationItemsCount = 5;
	const searchDebounce = useDebounce(search, 1000);

	const { id: salonId } = useParams();

	const {
		data: branchesListData,
		isLoading: branchesIsLoading,
		refetch: refetchBranches,
	} = useQuery({
		queryKey: ['SALON_BRANCHES_LIST', activePage, searchDebounce],
		queryFn: () =>
			salonBranchApi.getBranchesList({
				search: searchDebounce,
				pagination: {
					take: paginationItemsCount,
					skip: activePage === 1 ? 0 : (activePage - 1) * paginationItemsCount,
				},
				salonId: +salonId,
			}),
	});

	const [selection, setSelection] = useState<string[]>([]);

	const hasSelection = selection.length > 0;
	const indeterminate =
		hasSelection && selection.length < (branchesListData?.data?.list.length || 0);

	const [deleteModalOpen, setDeleteModalOpen] = useState(false);

	useEffect(() => {
		setActivePage(1);
	}, [searchDebounce]);

	const updateSalonBranchMutation = useMutation({
		mutationFn: (data: IUpdateSalonBranch) => {
			const promise = salonBranchApi.updateBranch(data.id, data);

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
		onSuccess: () => {
			refetchBranches();
		},
	});

	const deleteSalonBranchMutation = useMutation({
		mutationFn: () => {
			const promise = salonBranchApi.deleteBranches(selection.map(id => +id)!);

			toaster.promise(promise, {
				loading: {
					title: 'Удаление записи',
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
			refetchBranches();
			setSelection([]);
			setDeleteModalOpen(false);
		},
	});

	const createSalonBranchMutation = useMutation({
		mutationFn: (body: ICreateSalonBranch) => {
			const promise = salonBranchApi.createBranch(body);

			toaster.promise(promise, {
				loading: {
					title: 'Удаление записи',
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

		onSuccess() {
			reset({ address: '' });
			refetchBranches();
			setFormModalOpen(false);
		},
	});

	const [formModalOpen, setFormModalOpen] = useState(false);

	const rows = branchesListData?.data?.list.map(item => (
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
				w={200}
			>
				<button
					onClick={() => {
						setValue('address', item.address);
						setValue('id', item.id);
						setStartCoordinates([+item.latitude, +item.longitude])
						setValue('latitude', +item.latitude);
						setValue('longitude', +item.longitude);
						setFormModalOpen(true);
					}}
				>
					{<ChakraLink textAlign={'left'}>{item.address}</ChakraLink>}
				</button>
			</Table.Cell>
			<Table.Cell verticalAlign={'middle'}>
				<Flex
					width={'full'}
					justifyContent={'end'}
				>
					<Switch
						onCheckedChange={e => {
							updateSalonBranchMutation.mutate({
								id: item.id,
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

			{branchesIsLoading || (branchesListData?.data && branchesListData?.data?.list.length > 0) ? (
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
													changes.checked && branchesListData?.data
														? branchesListData?.data?.list.map(item => String(item.id))
														: [],
												);
											}}
										/>
									</Table.ColumnHeader>
									<Table.ColumnHeader
										w={'10'}
										maxW={40}
									>
										Адресс
									</Table.ColumnHeader>
									<Table.ColumnHeader textAlign={'end'}>Активен</Table.ColumnHeader>
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
							count={branchesListData?.data?.count || 1}
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
								deleteSalonBranchMutation.mutate();
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
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Добавить новую запись</DialogTitle>
					</DialogHeader>
					<DialogBody>
						<Field
							label='Адрес'
							required
							errorText={errors.address?.message}
						>
							<Input
								{...register('address', {
									minLength: { value: 3, message: getMinLengthErrorMessage(3) },
									required: { value: true, message: requiredMessage },
								})}
								placeholder='Адрес'
							/>
						</Field>
						<div className={s.map}>
							<Map
								width={'100%'}
								height={'100%'}
								options={{}}
								defaultState={{
									center: startCoordinates,
									zoom: 9,
									controls: [],
								}}
							>
								<SearchControl options={{ float: 'right' }} />
								<Placemark
									options={{ draggable: true }}
									geometry={startCoordinates}
									instanceRef={ref => {
										if (!ref) return;
										//@ts-ignore
										ref.geometry.events.add('change', e => {
											console.log('drag');

											//@ts-ignore
											const newCoords = e.get('newCoordinates');
											setValue('latitude', newCoords[0]);
											setValue('longitude', newCoords[1]);
										});
									}}
								></Placemark>
							</Map>
						</div>
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

export default DotsTab;
