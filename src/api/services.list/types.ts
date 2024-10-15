export interface ICreateServiceBody {
	tagName: string;
	price: number;
	time: number;
	name: string;
	salonId: number;
}

export interface IUpdateServiceBody extends Partial<Omit<ICreateServiceBody, 'salonId'>> {}

export interface ICreateServiceRes extends ICreateServiceBody {
	id: number;
}

export interface IGetServicesListParams {
	tagName?: string;
	search?: string;
	masterId?: number;
}

export interface IGetServicesListRes {
	list: Array<{
		tagName: string;
		services: Array<{
			id: number;
			price: number;
			time: number;
			tagName: string;
			salonId: number;
			name: string;
		}>;
	}>;
}
