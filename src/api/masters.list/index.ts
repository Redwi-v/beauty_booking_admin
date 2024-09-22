import apiInstance from "../instance"
import { ICreateMasterBody, IGetMastersListRes, IMaster, IUpdateMasterBody } from './types';

export const MastersListApi = {
	async getList(salonId: number | string, search?: string) {
		const res = await apiInstance.get<IGetMastersListRes>(`/master`, {
			params: {
				salonId,
				search,
			},
		});

		return res.data;
	},

	async create(body: ICreateMasterBody) {
		const res = await apiInstance.post<IMaster>(`/master`, body);
		return res.data;
	},

	async getOne(id: number | string) {
		const res = await apiInstance.get<IMaster>(`/master/${id}`);
		return res.data;
	},

	async update(id: number | string, body: IUpdateMasterBody) {
		const res = await apiInstance.patch<IMaster>(`/master/${id}`, body);
		return res.data;
	},

	async delete(id: number) {
		const res = await apiInstance.delete<IMaster>(`/master/${id}`);
		return res.data;
	},
};