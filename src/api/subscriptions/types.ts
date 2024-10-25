interface ISubscription {
	id: number;
	durationMouths: number;
	durationDays: number;
	price: number;
	title: string;
	subTitle: string;
	isStartingSubscription: boolean;
}

interface IConfirmation {
	id: string;
	status: string;
	amount: {
		value: string;
		currency: string;
	};
	description: string;
	recipient: {
		account_id: string;
		gateway_id: string;
	};
	payment_method: {
		type: string;
		id: string;
		saved: boolean;
	};
	created_at: string;
	confirmation: {
		type: string;
		return_url: string;
		confirmation_url: string;
	};
	test: boolean;
	paid: boolean;
	refundable: boolean;
	metadata: {};
}
