export interface ICreateSalonBranch {
	salonId: number;
	address: string;
	latitude: string;
	longitude: string;
	isOpen: boolean;
}

export interface IUpdateSalonBranch extends Partial<ICreateSalonBranch> {
	id: number;
}

export interface ISalonBranch {
	id: number;
	salonId: number;
	createdAt: string;
	updatedAt: string;
	isOpen: boolean;
	address: string;
	latitude: string;
	longitude: string;
}

export interface IGetSalonBranchesRes {
	list: ISalonBranch[];
	count: string;
}

export interface IGetSalonBranchesListParams {
	pagination?: {
		take: number;
		skip: number;
	};

	search?: string;
}
