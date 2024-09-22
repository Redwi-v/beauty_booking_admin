export interface IGetList {
  result: boolean
  data: {
    prevCursor: number
    nextCursor: number
    items: Array<IAdmin>
  }
}

export interface IAdmin {

  id: number
  login: string
  password: string
  rights: number

}

export interface IAdminUpdateParams {

  id: number
  login: string
  password?: string
  rights: number

}