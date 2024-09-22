import { IGetListMeta } from '../types';

export interface ICreateSalonBody {
	name: string;
	isOpen?: 0 | 1;
	image?: File | null;
	description?: string;
}

export interface IUpdateSalonBody extends Partial<ICreateSalonBody> {}

export interface ISalon {
	salonId: number;
	salonOwnerAccountId: number;
	name: string;
	logoUrl?: string;
	isOpen: boolean;
	description: string;
	createdAt: Date;
	updatedAt: Date;
	_count: {
		branches: number;
		MasterAccount: number;
	};
}

export interface IGetOneSalon {}

export type IGetSalonsListRes = {
	list: Array<ISalon>;

	meta: IGetListMeta;
};

export interface ISalonBranch {
	id: number;
	salonId: number;
	address: {
		id: number;
		city: string;
		address: string;
		salonBranchId: number;
	};
}
export interface ISalonBranchCreate {
	address: string;
	city: string;
}

export interface ICreateBranchRes {
	id: number;
	salonId: number;
}

export interface IGetSalonBranchesRes {
	list: ISalonBranch[];
}
