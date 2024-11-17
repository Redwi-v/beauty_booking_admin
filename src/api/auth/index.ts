import apiInstance from '../instance';
import { IGetSessionRes, ISignInParams, ISignUpParams } from './types';

export const authApi = {
	async signUp(params: ISignUpParams) {
		await apiInstance.post('/auth/admin/sign-up', params);
	},

	async signIn(params: ISignInParams) {
		await apiInstance.post('/auth/admin/sign-in', params);
	},

	async signOut() {
		await apiInstance.post('/auth/admin/sign-out');
	},

	getSession() {
		return apiInstance.get<IGetSessionRes>('/auth/session');
	},

	async sendAuthKey(key: string) {
		return apiInstance.post('/auth/key/send', { key });
	},
};
