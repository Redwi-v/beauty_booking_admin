import {
	ICreateSalonBranch,
	IGetSalonBranchesListParams,
	ISalonBranch,
	IUpdateSalonBranch,
} from './types';
import apiInstance from '../instance';
import { skip } from 'node:test';

export const salonBranchApi = {
	async createBranch(body: ICreateSalonBranch) {
		const res = await apiInstance.post('/salonBranch', body);

		return res;
	},

	async updateBranch(id: number, body: IUpdateSalonBranch) {
		const res = await apiInstance.patch<ISalonBranch>(`/salonBranch/${id}`, body);
		return res;
	},

	async deleteBranches(idArray: number[]) {
		const res = await apiInstance.delete('/salonBranch', {
			params: {
				idArray,
			},
		});

		return res;
	},

	async getBranchesList(params: IGetSalonBranchesListParams) {
		const res = await apiInstance.get<{ list: ISalonBranch[]; count: number }>('/salonBranch', {
			params: {
				take: params.pagination?.take,
				skip: params.pagination?.skip,
				search: params.search,
			},
		});

		return res;
	},

	async getBranchById(id: number) {
		const res = await apiInstance.get<ISalonBranch>(`/salonBranch/${id}`);

		return res;
	},
};
