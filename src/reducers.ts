import { ModelAction } from "./actions";
import { UPDATE_MODEL } from "./constants";
import { DataStore } from "./models/DataStore";

export function modelReducer(state: DataStore, action: ModelAction): DataStore {
    switch (action.type) {
        case UPDATE_MODEL:
            return action.dataStore;
        default:
            return state;
    }
}
