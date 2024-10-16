import apiInstance from '../instance';
import { ICreateBookingData, IGetBookingListRes } from './types';

export const bookingApi = {
	getListById(telegramId: string | number) {
		return apiInstance.get<IGetBookingListRes[]>('/booking', { params: { telegramId } });
	},

	create(data: ICreateBookingData) {
		return apiInstance.post('/booking', data);
	},

	update(id: number, data: Partial<ICreateBookingData>) {
		return apiInstance.patch(`/booking/${id}`, data);
	},

	delete(id: number) {
		return apiInstance.delete(`/booking/${id}`);
	},
};
