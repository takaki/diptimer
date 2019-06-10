import {
  EXEC_GO,
  EXEC_PAUSE,
  SET_FINISH,
  SET_MENU_INDEX,
  SET_NEXT_TIMER,
  SET_REMAIN_TIME
} from "./constants";

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

export const setRemainTime = (remainTime: string): ISetRemainTime => ({
  type: SET_REMAIN_TIME,
  payload: {
    remainTime
  }
});

export const execPause = (): IExecPause => ({
  type: EXEC_PAUSE
});

export const execGo = (): IExecGo => ({
  type: EXEC_GO
});

export const setMenuIndex = (menuIndex: number): ISetMenuIndex => ({
  type: SET_MENU_INDEX,
  payload: {
    menuIndex
  }
});

export const setFinish = (): ISetFinish => ({
  type: SET_FINISH
});

export const setNextTimer = (): ISetNextTimer => ({
  type: SET_NEXT_TIMER
});
