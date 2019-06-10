import { ModelAction } from "./actions";
import {
    EXEC_GO,
    EXEC_PAUSE,
    SET_FINISH,
    SET_MENU_INDEX,
    SET_NEXT_TIMER,
    SET_REMAIN_TIME,
} from "./constants";
import { DataStore } from "./models/DataStore";

export function modelReducer(state: DataStore = new DataStore(), action: ModelAction): DataStore {
    switch (action.type) {
        case SET_REMAIN_TIME:
            return state.set("time", action.payload.remainTime);
        case EXEC_PAUSE:
            return state.merge({label: "Pause", running: true});
        case EXEC_GO:
            return state.merge({label: "Go", running: false});
        case SET_MENU_INDEX:
            return state.merge({
                menuIndex: action.payload.menuIndex,
                timerIndex: 0,
                finish: false,
                label: "Go",
                running: false,
            });
        case SET_FINISH:
            return state.set("finish", true);
        case SET_NEXT_TIMER:
            return state.nextTimer();
        default:
            return state;
        // throw new Error();
    }
}
