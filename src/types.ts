import { DataStore } from "./models/DataStore";

export interface IGameTimerProps {
    dataStore: DataStore;
    updateStore: (d: DataStore) => void;
}
