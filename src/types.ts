import { IDataStore } from "./models/DataStore";

export interface IGameTimerProps {
  dataStore: IDataStore;
  setRemainTime: (s: string) => void;
  execPause: () => void;
  execGo: () => void;
  setMenuIndex: (i: number) => void;
  setFinish: () => void;
  setNextTimer: () => void;
}
