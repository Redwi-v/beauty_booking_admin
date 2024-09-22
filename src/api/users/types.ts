import { Role } from '../types';

export interface IUser {
	id: number;
	email: string;
	role: string;
	SalonOwnerAccount: ISalonOwner;
}

export interface ISalonOwner {
	id: number;
	ownerId: number;
	name: string;
	lastName: string;
}

export interface IAddUserBody {
	email: string;
	password: string;
	name: string;
	lastName: string;
	role: Role;
}

export interface IUpdateUserBody extends Partial<IAddUserBody> {}
