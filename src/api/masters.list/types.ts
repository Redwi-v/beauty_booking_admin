export interface IGetMastersListRes {
	masters: IMaster[];
	mastersCount: number;
}

export interface IMaster {
	id: number;
	name: string;
	lastName: string;
	userdataId: number;
	telegramId: number;
	role: string;
	salonId: number;
	salonBranchId: number;
	rating: number;
	speciality: string;
	about: any;
	avatar?: string;
	email: string;
	canChangeSchedule: boolean;

	salonBranch: {
		id: number;
		salonId: number;
		address: {
			id: number;
			city: string;
			address: string;
			salonBranchId: number;
		};
	};
}

export interface ICreateMasterBody {
	email: string;
	lastName: string;
	name: string;
	password: string;
	speciality: string;
	salonBranchId: number;
	avatar: File;
	canChangeSchedule: boolean;
	telegramId: string;
}

export interface IUpdateMasterBody {
	name?: string;
	lastName?: string;
	rating?: number;
	speciality?: string;
	about?: string;
}
