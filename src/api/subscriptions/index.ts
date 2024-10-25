import apiInstance from '../instance';

export const subscriptionsApi = {
	async getSubscriptionsList() {
		return apiInstance.get<ISubscription[]>('/subscription');
	},

	async buySubscriptions(id: number) {
		return apiInstance.post<IConfirmation>(`/subscription/payment/buy/${id}`, {
			returnUrl: window.location.href,
		});
	},
};
