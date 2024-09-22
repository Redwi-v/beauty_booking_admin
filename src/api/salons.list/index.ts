import apiInstance from '../instance';
import { objectToForm } from '../object.to.form';
import {
	ICreateBranchRes,
	ICreateSalonBody,
	IGetSalonBranchesRes,
	IGetSalonsListRes,
	ISalon,
	ISalonBranchCreate,
	IUpdateSalonBody,
} from './types';

export const SalonsApi = {
	async createItem(body: ICreateSalonBody) {
		const dataForm = objectToForm(body);

		const res = await apiInstance.post<ISalon>('/salons', dataForm);

		return res.data;
	},

	async getList(search?: string) {
		const res = await apiInstance.get<IGetSalonsListRes>(`/salons`, {
			params: { search },
		});

		return res.data;
	},

	async getOne(id: number) {
		const res = await apiInstance.get<ISalon>(`/salons/${id}`);

		return res.data;
	},

	async update(id: number, body: IUpdateSalonBody) {
		const dataForm = objectToForm(body);

		const res = await apiInstance.patch<IGetSalonsListRes>(`/salons/${id}`, dataForm);

		return res.data;
	},

	async delete(id: number) {
		const res = await apiInstance.delete<IGetSalonsListRes>(`/salons/${id}`);

		return res.data;
	},

	async getSalonBranches(salonId: string, search?: string) {
		return (
			await apiInstance.get<IGetSalonBranchesRes>('/salon-branch/findSalonBranches', {
				params: { salonId },
			})
		).data;
	},

	async createSalonBranches(salonId: string, salonBranchParams: ISalonBranchCreate) {
		return (
			await apiInstance.post<ICreateBranchRes>('/salon-branch', {
				address: salonBranchParams,
				salon: {
					salonId: +salonId,
				},
			})
		).data;
	},
	async updateSalonBranches(salonId: number, salonBranchParams: ISalonBranchCreate) {
		return (
			await apiInstance.put<ICreateBranchRes>(`/salon-branch/${salonId}`, {
				address: salonBranchParams,
			})
		).data;
	},

	async deleteBranch(branchId: number) {
		return (await apiInstance.delete(`/salon-branch/${branchId}`)).data;
	},
};
