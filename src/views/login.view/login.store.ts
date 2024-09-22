import { create } from 'zustand'

interface IActiveUser {

  exp: number,
  id: number,
  login: string,
  rights: number,

}

interface BearState {

  activeUser: IActiveUser | null

  setActiveUser: (activeUser: IActiveUser) => void

}

export const useBearStore = create<BearState>()((set) => ({

  activeUser: null,
  setActiveUser: ( activeUser ) => set((state) => ({ activeUser })),

}))