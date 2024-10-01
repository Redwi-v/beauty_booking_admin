export interface IGetMastersListRes {
	masters: IMaster[];

	mastersCount: number;
}
export enum weeksDays {
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
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

	workingDays: weeksDays[];
	startShift: string;
	endShift: string;

	masterService: Array<{
		id: number;
		price: number;
		time: number;
		name: string;
		tagName: string;
		salonId: number;
		bookingId: number;
	}>;

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
	speciality: string;
	salonBranchId: number;
	avatar: File;
	canChangeSchedule: boolean;
	telegramId: string;
	servicesIdArray?: number[];
	startShift: Date;
	endShift: Date;
	workingDays: string[];
}

export interface IUpdateMasterBody {
	name?: string;
	lastName?: string;
	rating?: number;
	speciality?: string;
	about?: string;
	servicesIdArray?: number[];
	telegramId?: string;
	salonBranchId?: number;
}
