import apiInstance from '../instance';

export const payApi = {
	async pay() {
		return apiInstance.post('/payment/pay ', { returnUrl: window.location.href });
	},
};
