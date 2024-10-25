//login

export interface ISignInData {

  login: string
  password: string
  deviceTag: string

}

export interface ISignInResponse extends IResponseData {

  data: {

    jwt: string
    rt: string

  }

}

export interface ISignInResponseErr extends IResponseData {

  data: {

    message: string

  }

}

// other 

interface IResponseData {

  result: boolean
  data: any

}

export interface IProfileRes {
	id: number;
	ownerId: number;
	name: string;
	lastName: string;
	owner: Owner;
	subscription: ISubscription;

	subscriptionTypeId: number;
	subscriptionStartDate: Date;
	subscriptionEndDate: Date;
}

interface Owner {
	id: number;
	hash: string;
	salt: string;
	email: string;
	role: string;
}
export type ISubscription = {
	id: number;
	durationMouths: number;
	durationDays: number;
	price: number;
	title: string;
	subTitle: string;
	isStartingSubscription: boolean;
};


