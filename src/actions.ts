import { UPDATE_MODEL } from "./constants";
import { DataStore } from "./models/DataStore";

interface IUpdateModel {
    type: UPDATE_MODEL;
    dataStore: DataStore;
}

export type ModelAction = IUpdateModel;

export function updateModel(dataStore: DataStore): IUpdateModel {
    return {
        type: UPDATE_MODEL,
        dataStore,
    };
}
