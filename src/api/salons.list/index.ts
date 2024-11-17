import apiInstance from '../instance';
import { objectToForm } from '../object.to.form';
import { ICreateSalonBody, IGetAllParams, ISalon, IUpdateSalon } from './types';

export const SalonApi = {
	async createItem(body: ICreateSalonBody) {
		const dataForm = objectToForm(body);

		const res = await apiInstance.post<ISalon>('/salon', dataForm);

		return res.data;
	},

	async updateSalon(body: IUpdateSalon) {
		const dataForm = objectToForm(body);

		const res = await apiInstance.put<ISalon>('/salon', dataForm);

		return res.data;
	},

	async deleteSalons(salonId: number[]) {
		const res = await apiInstance.delete<ISalon>('/salon', {
			params: {
				salonsId: salonId,
			},
		});

		return res.data;
	},

	async getSalonById(salonId: number) {
		const res = await apiInstance.get<ISalon>(`/salon/${salonId}`);

		return res.data;
	},

	async getAllSalons(params: IGetAllParams) {
		const res = await apiInstance.get<{ list: ISalon[]; totalCount: number }>('/salon', {
			params: {
				skip: params.pagination?.skip,
				take: params.pagination?.take,
				search: params.search,
			},
		});

		return res.data;
	},
};
