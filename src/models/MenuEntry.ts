import { List } from "immutable";
import { ITimerEntry } from "./TimerEntry";

export interface IMenuEntry {
  name: string;
  timers: List<ITimerEntry>;
}

export const defaultMenuEntry: IMenuEntry = {
  name: "",
  timers: List()
};
