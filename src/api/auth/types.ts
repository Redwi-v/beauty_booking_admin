export interface ISignUpParams {
	password: string;
	name: string;
	lastName: string;
	phoneNumber: string;
	messageKey: string;
}

export interface ISignInParams {
	phoneNumber: string;
	password: string;
	messageKey: string;
}

export interface IGetSessionRes {
	id: number;
	phoneNumber: string;

	iat: number;
	exp: number;
}
