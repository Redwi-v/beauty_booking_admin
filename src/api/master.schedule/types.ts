export interface IUpdateMasterSchedule {
	day: Date;
	start: string;
	end: string;
	freeTime: string[];
}

export interface IGetScheduleItem {
	id: number;
	day: string;
	masterAccountId: number;
	start: string;
	end: string;
	freeTime: string[];
	allowedRecordingTime: number[];
}
