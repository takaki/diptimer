import { ModelAction } from "./actions";
import {
  EXEC_GO,
  EXEC_PAUSE,
  SET_FINISH,
  SET_MENU_INDEX,
  SET_NEXT_TIMER,
  SET_REMAIN_TIME,
  SET_STOP_WATCH
} from "./constants";
import {
  createStopWatch,
  defaultDataStore,
  IDataStore,
  isTimerLeft,
  nextTimer
} from "./models/DataStore";
import { StopWatch } from "./models/StopWatch";

export const modelReducer = (
  state: IDataStore = defaultDataStore,
  action: ModelAction
): IDataStore => {
  switch (action.type) {
    case SET_REMAIN_TIME:
      return { ...state, time: action.payload.remainTime };
    case EXEC_PAUSE:
      return { ...state, label: "Pause", running: true };
    case EXEC_GO:
      return { ...state, label: "Go", running: false };
    case SET_MENU_INDEX:
      return {
        ...state,
        menuIndex: action.payload.menuIndex,
        timerIndex: 0,
        finish: false,
        label: "Go",
        running: false
      };
    case SET_FINISH:
      return { ...state, finish: true };
    case SET_NEXT_TIMER:
      return nextTimer(state);
    case SET_STOP_WATCH:
      const sw = createStopWatch(
        action.payload.onTick,
        action.payload.onFinish,
        state
      );
      return {
        ...state,
        sw,
        time: sw.remainTimeString()
      };
    default:
      return state;
    // throw new Error();
  }
};
