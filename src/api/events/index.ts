import apiInstance from '../instance';
import { ICreateEvent, IEvent, IUpdateEvent } from './types';

export const eventsApi = {
	async create(data: ICreateEvent) {
		const res = await apiInstance.post<ICreateEvent>(`/events/`, data);
		return res.data;
	},

	async getList(salonId: number, salonBranchId?: number, masterId?: number) {
		const res = await apiInstance.get<IEvent[]>('/events/', {
			params: {
				salonId,
				salonBranchId,
				masterId,
			},
		});

		return res;
	},

	async update(id: number, data: Partial<IUpdateEvent>) {
		const res = await apiInstance.patch<IEvent>(`/events/${id}`, data);
		return res;
	},

	async delete(id: number) {
		const res = await apiInstance.delete<IEvent>(`/events/${id}`);
		return res;
	},
};
