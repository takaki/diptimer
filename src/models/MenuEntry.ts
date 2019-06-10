import { ITimerEntry } from "./TimerEntry";

export interface IMenuEntry {
  name: string;
  timers: ITimerEntry[];
}

export const defaultMenuEntry: IMenuEntry = {
  name: "",
  timers: []
};
