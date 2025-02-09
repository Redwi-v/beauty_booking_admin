import { IMasterAccount } from '../masters.list/types';

export interface ICreateService {
	name: string;
	price: number;
	duration: number;
	masterAccountsId: number[];
	serviceTagId: number;
}

export interface IUpdateService extends Partial<ICreateService> {}

export interface IService {
	id: number;
	serviceTagId: number;
	name: string;
	price: number;
	duration: number;
	bookingId: any;
	bookingList: any[];
	masterAccounts: IMasterAccount[];
	serviceTag: IServiceTag;
}

export interface IServiceTag {
	id: number;
	salonId: number;
	name: string;
	services: IService[];
}
