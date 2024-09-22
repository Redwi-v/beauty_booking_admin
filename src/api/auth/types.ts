export interface ISignUpParams {

  email: string
  password: string
  name: string
  lastName: string

}

export interface ISignInParams {

  email: string,
  password: string,

}


export interface IGetSessionRes {

  id: number,
  email: string,

  iat: number
  exp: number

}
