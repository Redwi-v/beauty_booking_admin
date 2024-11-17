import axios, { AxiosError, isAxiosError } from 'axios'
import { Store, iNotification } from 'react-notifications-component';
import { notificationSettings } from '../constants/notification.settings';

const apiInstance = axios.create({
	baseURL: process.env.API_URL,
	timeout: 10000,
	withCredentials: true,
	headers: {
		appType: 'ADMIN',
	},
});

export interface IResponseErr {
	data: {
		message: string;
	};

	message: string;
}

interface IErrNotifications extends Omit<iNotification, 'container'> {}

apiInstance.interceptors.response.use(
	res => res,
	err => {
		if (err.response.status === 401 && window.location.pathname !== '/login') {
			window.location.replace('/login');
		}

		if (isAxiosError<IResponseErr>(err)) {
			throw new AxiosError(err.message, err.code, err.config, err.request, err.response);
		}

		throw new Error(err);
	},
);

export const axiosErrHandler = (error: any, params?: IErrNotifications) => {
	if (isAxiosError<IResponseErr>(error)) {
		Store.addNotification({
			...notificationSettings,
			...params,
			type: 'danger',
			title: 'Error',
			message: error.response?.data.message || error.response?.data.data.message,
		});
	}
};

export default apiInstance