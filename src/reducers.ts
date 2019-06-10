import { ModelAction } from "./actions";
import {
  EXEC_GO,
  EXEC_PAUSE,
  SET_FINISH,
  SET_MENU_INDEX,
  SET_NEXT_TIMER,
  SET_REMAIN_TIME
} from "./constants";
import { defaultDataStore, IDataStore, nextTimer } from "./models/DataStore";

export function modelReducer(
  state: IDataStore = defaultDataStore,
  action: ModelAction
): IDataStore {
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
    default:
      return state;
    // throw new Error();
  }
}
