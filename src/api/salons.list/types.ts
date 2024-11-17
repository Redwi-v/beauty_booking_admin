export interface ICreateSalonBody {
	name: string;
	isOpen?: boolean;
	description?: string;
	image?: File;
}

export interface IUpdateSalon extends Partial<ICreateSalonBody> {
	salonId: number;
}

export interface IGetAllParams {
	pagination?: {
		take: number;
		skip: number;
	};
	search?: string;
}

export interface ISalon {
	id: number;
	adminAccountUserId: number;
	name: string;
	logoUrl: any;
	isOpen: boolean;
	description: string;
	createdAt: string;
	updatedAt: string;
}
