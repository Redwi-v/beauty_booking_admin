export interface ICreateEvent {
	start: string;
	duration: number;
	salonBranch: number;
	title: string;
	description: string;
	masterId: number;
	servicesIdArr: number[];
	clientNumber: string;
	clientName: string;
	clientLastName: string;
	clientComment: string;
}

export interface IUpdateEvent extends Partial<ICreateEvent> {}

export interface IEvent {
	id: number;
	start: string;
	duration: number;
	salonBranchId: number;
	title: string;
	description: string;
	masterId: number;
	servicesIdArr: number[];
	clientNumber: string;
	clientName: string;
	clientLastName: string;
	clientComment: string;

	salonBranch: {
		id: number;
		salonId: number;
		createdAt: string;
		updatedAt: string;
		isOpen: boolean;
		address: string;
		latitude: string;
		longitude: string;
	};

	services: {
		id: number;
		serviceTagId: number;
		name: string;
		price: number;
		duration: number;
		bookingId: number;
		eventsId: number;
	}[];

	master: {
		id: number;
		salonBranchId: number;
		rating: number;
		speciality: string;
		about: string;
		name: string;
		lastName: string;
		avatar: string;
		canChangeSchedule: boolean;
		canChangeBookingTime: boolean;
		telegramId: string;
	};
}
