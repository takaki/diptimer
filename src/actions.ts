import {
    EXEC_GO,
    EXEC_PAUSE,
    SET_FINISH,
    SET_MENU_INDEX,
    SET_NEXT_TIMER,
    SET_REMAIN_TIME,
} from "./constants";
import { DataStore } from "./models/DataStore";

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

interface ISetMenuIndex {
    type: SET_MENU_INDEX;
    payload: {
        menuIndex: number;
    };
}

interface ISetFinish {
    type: SET_FINISH;
}

interface ISetNextTimer {
    type: SET_NEXT_TIMER;
}

export type ModelAction =
    | ISetRemainTime
    | IExecPause
    | IExecGo
    | ISetMenuIndex
    | ISetFinish
    | ISetNextTimer;

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

export function setMenuIndex(menuIndex: number): ISetMenuIndex {
    return {
        type: SET_MENU_INDEX,
        payload: {
            menuIndex,
        },
    };
}

export function setFinish(): ISetFinish {
    return {
        type: SET_FINISH,
    };
}

export function setNextTimer(): ISetNextTimer {
    return {
        type: SET_NEXT_TIMER,
    };
}
