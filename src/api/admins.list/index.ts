import axios from "axios";
import apiInstance from "../instance"
import { Cookies } from 'react-cookie';
import { IAdmin, IAdminUpdateParams, IGetList } from "./types";
const cookies = new Cookies();

export const AdminsListApi = {

  

  async getList ( limit: number, cursor?: number ) {

    const res = await apiInstance.get< IGetList >('/admins', { 

      params: {
        limit,
        cursor,
      }

    })

    return res.data

  },

  async updateAdmin ( userInfo: IAdminUpdateParams ) {

    const res = await apiInstance.put('/admins', {
      ...userInfo,
    })

    return res.data

  }

}