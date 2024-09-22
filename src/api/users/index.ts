import apiInstance from '../instance';
import { IAddUserBody, IUpdateUserBody, IUser } from './types';
import { Cookies } from 'react-cookie';

export const UsersApi = {
	getUsersList() {
		return apiInstance.get<{ list: IUser[] }>('/users/list');
	},

	addUser(body: IAddUserBody) {
		return apiInstance.post('/users/add', body);
	},

	update(id: number, body: IUpdateUserBody) {
		return apiInstance.patch(`/users/${id}`, body);
	},

	delete(id: number) {
		return apiInstance.delete(`/users/${id}`);
	},
};
