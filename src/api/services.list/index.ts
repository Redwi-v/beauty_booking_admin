import apiInstance from '../instance';
import { ICreateService, IService, IServiceTag } from './types';

export const servicesListApi = {
	createService(body: ICreateService) {
		return apiInstance.post<IService>('/services', body);
	},

	getlist(params: {
		pagination?: { skip: number; take: number };
		search?: string;
		tagId?: number;
		salonId: number;
	}) {
		return apiInstance.get<{ list: IService[]; count: number }>('/services/', {
			params: params,
		});
	},

	update(id: number, body: IService) {
		return apiInstance.patch<IService>(`/services/${id}`, body);
	},

	getOne(id: number) {
		return apiInstance.get<IService>(`/services/${id}`);
	},

	deleteList(params: { idArr: number[] }) {
		return apiInstance.delete<{ count: number }>('/services', {
			params: {
				deleteArray: params.idArr,
			},
		});
	},
};

export const servicesTagsApi = {
	createServiceTag(body: { salonId: number; name: string }) {
		return apiInstance.post<IServiceTag>('/service-tags', body);
	},

	get(params: {
		pagination?: { skip: number; take: number };
		search?: string;
		takeServices?: boolean;
		salonId: number;
	}) {
		const { salonId, pagination, search, takeServices } = params;

		return apiInstance.get<IServiceTag[]>('/service-tags', {
			params: {
				salonId,
				takeServices,
				search,
				...pagination,
			},
		});
	},

	findOne(id: number) {
		return apiInstance.get<IServiceTag>(`/service-tags/${id}`);
	},

	delete(id: number) {
		return apiInstance.delete<IServiceTag>(`/service-tags/${id}`);
	},
};