import { lookup } from "fp-ts/lib/Array";
import { Option } from "fp-ts/lib/Option";
import { Lens } from "monocle-ts";
import { IMenuEntry } from "./MenuEntry";
import { StopWatch } from "./StopWatch";
import * as TM from "./TimerMenu";
import { defaultTimerEntry } from "./TimerEntry";

export interface IDataStore {
  menuIndex: number;
  timerIndex: number;
  timerMenu: TM.ITimerMenu;
  time: string;
  label: string;
  running: boolean;
  finish: boolean;
  sw: StopWatch;
}

const timerIndex = Lens.fromProp<IDataStore>()("timerIndex");

export const defaultDataStore: IDataStore = {
  menuIndex: 0,
  timerIndex: 0,
  timerMenu: TM.defaultTimerMenu,
  time: "",
  label: "Go",
  running: false,
  finish: false,
  sw: new StopWatch(defaultTimerEntry)
};

export const isTimerLeft = (self: IDataStore): boolean =>
  lookup(self.menuIndex, self.timerMenu.menuEntries)
    .map(a => self.timerIndex + 1 < a.timers.length)
    .getOrElse(false);

export const nextTimer = (self: IDataStore): IDataStore =>
  timerIndex.modify(a => a + 1)(self);

export const timerList = (self: IDataStore): Option<IMenuEntry> =>
  lookup(self.menuIndex, self.timerMenu.menuEntries);

export const createStopWatch = (
  onTick: (sw: StopWatch) => void,
  onFinish: (sw: StopWatch) => void,
  self: IDataStore
): StopWatch =>
  new StopWatch(
    TM.getTimerEntry(self.menuIndex, self.timerIndex, self.timerMenu),
    onTick,
    onFinish
  );
