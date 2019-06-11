import { ModelAction } from "./actions";
import {
  EXEC_GO,
  EXEC_PAUSE,
  NEW_STOP_WATCH,
  SET_FINISH,
  SET_MENU_INDEX,
  SET_NEXT_TIMER,
  SET_REMAIN_TIME
} from "./constants";
import {
  createStopWatch,
  defaultDataStore,
  IDataStore,
  nextTimer
} from "./models/DataStore";
import { remainTime } from "./models/RemainTime";

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
    case NEW_STOP_WATCH:
      const sw = createStopWatch(
        action.payload.onTick,
        action.payload.onFinish,
        state
      );
      return {
        ...state,
        sw,
        time: remainTime.format(sw.remainTime())
      };
    default:
      return state;
    // throw new Error();
  }
};
