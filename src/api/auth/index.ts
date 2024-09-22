import apiInstance from '../instance';
import { IGetSessionRes, ISignInParams, ISignUpParams } from './types';

export const authApi = {
	async signUp(params: ISignUpParams) {
		await apiInstance.post('/auth/sign-up-salon-owner', params);
	},

	async signIn(params: ISignInParams) {
		await apiInstance.post('/auth/sign-in', params);
	},

	async signOut() {
		await apiInstance.post('/auth/sign-out');
	},

	getSession() {
		return apiInstance.get<IGetSessionRes>('/auth/session');
	},
};
