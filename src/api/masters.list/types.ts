export interface ICreateMasterBody {
	telegramId: number;
	salonBranchId: number;
	speciality: string;
	about: string;
	avatar?: File | null;
	canChangeSchedule: boolean;
	canChangeBookingTime: boolean;
	name: string;
	lastName: string;
}

export interface IMasterAccount {
	id: number;
	salonBranchId: number;
	rating: number;
	speciality: string;
	about: string;
	name: string;
	lastName: string;
	avatar: string | null;
	canChangeSchedule: boolean;
	canChangeBookingTime: boolean;
	telegramId: string;
	Booking: any[];
	masterService: any[];
	workingsDays: any[];
}

export interface IUpdateMasterBody extends Partial<ICreateMasterBody> {}

export interface IGetMastersParams {
	skip?: number;
	take?: number;
	search?: string;
	salonBranchId?: number;
	salonId: number;
}
