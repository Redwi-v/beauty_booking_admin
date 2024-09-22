import apiInstance from '../instance';
import {
	ICreateServiceBody,
	ICreateServiceRes,
	IGetServicesListParams,
	IGetServicesListRes,
	IUpdateServiceBody,
} from './types';

export const servicesListApi = {
	createService(body: ICreateServiceBody) {
		return apiInstance.post<ICreateServiceRes>('/services', body);
	},

	updateService(serviceId: string | number, body: IUpdateServiceBody) {
		return apiInstance.patch<ICreateServiceRes>(`/services/${serviceId}`, body);
	},

	getList(params: IGetServicesListParams) {
		return apiInstance.get<IGetServicesListRes>('/services', { params });
	},

	deleteService(id: string | number) {
		return apiInstance.delete<ICreateServiceRes>(`/services/${id}`);
	},

	addTag(tagName: string) {
		return apiInstance.post<{ tagName: string }>(`/services/tag/${tagName}`);
	},

	getAllTags() {
		return apiInstance.get<Array<{ tagName: string }>>('/services/tag/all');
	},

	deleteTag(tagName: string | number) {
		return apiInstance.delete(`services/tag/${tagName}`);
	},
};
