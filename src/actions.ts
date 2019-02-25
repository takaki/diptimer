import { EXEC_GO, EXEC_PAUSE, SET_REMAIN_TIME, UPDATE_MODEL } from "./constants";
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

interface IExecPause {
    type: EXEC_PAUSE;
}

interface IExecGo {
    type: EXEC_GO;
}

export type ModelAction = IUpdateModel | ISetRemainTime | IExecPause | IExecGo;

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
            remainTime,
        },
    };
}

export function execPause(): IExecPause {
    return {
        type: EXEC_PAUSE,
    };
}

export function execGo(): IExecGo {
    return {
        type: EXEC_GO,
    };
}
