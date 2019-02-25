import { SET_REMAIN_TIME, UPDATE_MODEL } from "./constants";
import { DataStore } from "./models/DataStore";
import { RemainTime } from "./models/RemainTime";

interface IUpdateModel {
    type: UPDATE_MODEL;
    payload: {
        dataStore: DataStore;
    };
}

interface ISetRemainTime {
    type: SET_REMAIN_TIME;
    payload: {
        remainTime: string;
    };
}
export type ModelAction = IUpdateModel | ISetRemainTime;

export function updateModel(dataStore: DataStore): IUpdateModel {
    return {
        type: UPDATE_MODEL,
        payload: {
            dataStore,
        },
    };
}

export function setRemainTime(remainTime: string): ISetRemainTime {
    return {
        type: SET_REMAIN_TIME,
        payload: {
            remainTime
        },
    };
}
