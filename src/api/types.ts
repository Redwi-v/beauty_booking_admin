export interface IGetListMeta {
	count: number;
}

export enum Role {
	ADMIN = 'ADMIN',

	SALON_OWNER = 'SALON_OWNER',

	MASTER = 'MASTER',

	CLIENT = 'CLIENT',
}
