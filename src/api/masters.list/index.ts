import apiInstance from '../instance';
import { ICreateMasterBody, IGetMastersParams, IMasterAccount, IUpdateMasterBody } from './types';
import { objectToForm } from '../object.to.form';

export const mastersListApi = {
	async getList(params: IGetMastersParams) {
		return apiInstance.get<{ list: IMasterAccount[]; count: number }>('/master', { params });
	},

	async create(body: ICreateMasterBody) {
		const form = objectToForm(body);

		return apiInstance.post('/master', form);
	},

	async update(id: number | string, body: IUpdateMasterBody) {
		const form = objectToForm(body);

		return apiInstance.patch(`master/${id}`, form);
	},

	async getOne(id: number | string) {
		return apiInstance.get(`master/${id}`);
	},

	async delete(idArray: number[]) {
		return apiInstance.delete('/master', { params: { idArray } });
	},
};
