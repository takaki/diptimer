import { lookup, range } from "fp-ts/lib/Array";
import { concat } from "fp-ts/lib/function";
import { IMenuEntry } from "./MenuEntry";
import { defaultTimerEntry, ITimerEntry } from "./TimerEntry";

export interface ITimerMenu {
  menuEntries: IMenuEntry[];
}

export const defaultTimerMenu: ITimerMenu = {
  menuEntries: concat(
    [
      {
        name: "ディプロマシー",
        timers: [
          { title: "外交フェイズ", duration: 15 * 60 },
          { title: "命令記述フェイズ", duration: 5 * 60 },
          { title: "命令解決フェイズ", duration: 10 * 60 }
        ]
      },
      {
        name: "テスト",
        timers: [
          { title: "A", duration: 5 },
          { title: "B", duration: 4 },
          { title: "C", duration: 3 }
        ]
      },
      {
        name: "テスト2",
        timers: [{ title: "A", duration: 1 }]
      }
    ],
    range(1, 15).map((i: number) => ({
      name: `${i}分`,
      timers: [{ title: `${i}分`, duration: i * 60 }]
    }))
  )
};

export const getTimerEntry = (
  menuIndex: number,
  timerIndex: number,
  self: ITimerMenu
): ITimerEntry =>
  lookup(menuIndex, self.menuEntries)
    .chain(a => lookup(timerIndex, a.timers))
    .getOrElse(defaultTimerEntry);
