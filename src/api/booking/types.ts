export interface IGetBookingListRes {
	id: number;
	createdAt: string;
	updatedAt: string;
	time: string;
	masterAccountId: number;
	status: string;
	clientTelegramId: string;
	clientName: string;
	clientPhone: string;
	clientComment: string;
	salonId: number;
	salonBranchId: number;
	master: Master;
	salon: Salon;
	salonBranch: SalonBranch;
	services: Service[];
}

export interface Master {
	id: number;
	name: string;
	lastName: string;
	email: string;
	salonId: number;
	salonBranchId: number;
	rating: number;
	speciality: string;
	about: string;
	avatar: any;
	canChangeSchedule: boolean;
	telegramId: string;
}

export interface Salon {
	salonId: number;
	salonOwnerAccountId: number;
	name: string;
	logoUrl: string;
	isOpen: boolean;
	description: string;
	createdAt: string;
	updatedAt: string;
}

export interface SalonBranch {
	id: number;
	salonId: number;
	masterServiceId: any;
	address: {
		address: string;
		city: string;
		id: number;
		salonBranchId: number;
	};
}

export interface Service {
	id: number;
	price: number;
	time: number;
	name: string;
	tagName: string;
	salonId: number;
	bookingId: number;
}

export interface ICreateBookingData {
	masterId: number;
	salonBranchId: number;
	salonId: number;
	clientComment?: string;
	adminComment?: string;
	clientPhone: string;
	clientName: string;
	clientTelegramId?: string;
	servicesIdArray: number[];
	time: Date;
}
