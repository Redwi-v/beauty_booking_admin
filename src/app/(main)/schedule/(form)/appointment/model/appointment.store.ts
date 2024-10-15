'use client';
import { SalonBranch } from '@/api/booking/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface IAppointmentStore {
	date: string | null;
	time: string | null;
	masterId: number | null;
	services: number[];

	setDateAndTime: (date: string | null, time: string | null) => void;
	setMasterId: (id: number) => void;
	toggleServices: (id: number) => void;
	clear: () => void;
	setServices: (value: []) => void;

	branch: SalonBranch | null;
	setSalonBranch: (value: SalonBranch) => void;
}

export const useAppointmentStore = create<IAppointmentStore>()(
	persist(
		(set, get) => ({
			date: get()?.date || null,
			time: get()?.time || null,

			masterId: null,

			services: [],

			branch: null,
			setSalonBranch: branch => set(state => ({ branch: branch })),

			setMasterId: id =>
				set(state => ({
					masterId: id,
				})),

			setDateAndTime: (date, time) =>
				set(state => ({
					date,
					time,
				})),
			setServices: value =>
				set(state => ({
					services: value,
				})),

			toggleServices: id =>
				set(state => {
					let activeServices = [...state.services];

					const isInclude = activeServices.includes(id);

					activeServices = isInclude
						? (activeServices = activeServices.filter(innerId => innerId !== id))
						: [...activeServices, id];

					return {
						services: activeServices,
					};
				}),

			clear: () =>
				set(state => ({
					date: null,
					time: null,

					masterId: null,

					services: [],
				})),
		}),

		{
			name: 'Appointment',
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);

interface IService {
	id: number;
	name: string;
	execution_time_s: number;
	price: number;
	branch_id: number;
	branch: string;
	masters: string[];
}
