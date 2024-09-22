import apiInstance from "../instance"
import { IProfileRes, ISignInData, ISignInResponse } from './types';
import { Cookies } from 'react-cookie';
const cookies = new Cookies();

export const AdminApi = {

  signIn: async ( data: ISignInData ) => {

    const res = await apiInstance.post< ISignInResponse >('/admin/signin', data)

    return res
    

  },

  getProfile () {
    return apiInstance.get<IProfileRes>('/users/profile')
  }

}