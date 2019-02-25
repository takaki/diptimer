import { ModelAction } from "./actions";
import { SET_REMAIN_TIME, UPDATE_MODEL } from "./constants";
import { DataStore } from "./models/DataStore";

export function modelReducer(state: DataStore, action: ModelAction): DataStore {
    switch (action.type) {
        case UPDATE_MODEL:
            return action.payload.dataStore;
        case SET_REMAIN_TIME:
            return state.set("time", action.payload.remainTime);
        default:
            return state;
    }
}
