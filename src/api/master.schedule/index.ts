import apiInstance from '../instance';
import { IGetScheduleItem, IUpdateMasterSchedule } from './types';

export const masterScheduleApi = {
	async getList(masterId: number | string) {
		const res = await apiInstance.get<IGetScheduleItem[]>(`/master.schedule/${masterId}`);
		return res.data;
	},

	async updateList(masterId: number | string, data: IUpdateMasterSchedule[]) {
		const res = await apiInstance.patch(`/master.schedule/${masterId}`, {
			workingDays: data,
		});
		return res.data;
	},

	async updateOne(id: number | string, data: IUpdateMasterSchedule[]) {
		const res = await apiInstance.patch(`/master.schedule/updateOne/${id}`, {
			workingDays: data,
		});
		return res.data;
	},

	async delete(idArray: number[]) {
		const res = await apiInstance.delete(`/master.schedule`, {
			params: {
				masterId: idArray,
			},
		});
		return res.data;
	},

	async getFreeTime(masterId: number, date: string, activeEventId?: number) {
		const res = await apiInstance.get<number[]>(`/master.schedule/freetime/${masterId}`, {
			params: {
				date: date,
				activeEventId,
			},
		});
		return res.data;
	},
};
