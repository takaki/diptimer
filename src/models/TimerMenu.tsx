import { MenuItem, Select } from "@material-ui/core";
import { lookup, range } from "fp-ts/lib/Array";
import { concat } from "fp-ts/lib/function";
import * as React from "react";
import { IMenuEntry } from "./MenuEntry";
import { RemainTime } from "./RemainTime";

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

export function selectMenu(
  menuIndex: number,
  onMenuSelect: (ev: React.ChangeEvent<any>) => void,
  self: ITimerMenu
): JSX.Element {
  const selectItems = self.menuEntries
    .map((e: IMenuEntry) => e.name)
    .map((n, i) => (
      <MenuItem value={i} key={n}>
        {n}
      </MenuItem>
    ));
  return (
    <Select value={menuIndex} onChange={onMenuSelect}>
      {selectItems}
    </Select>
  );
}

export function remainTimeStr(menuIndex: number, self: ITimerMenu): string {
  return new RemainTime(
    lookup(menuIndex, self.menuEntries)
      .chain(a => lookup(0, a.timers))
      .map(a => a.duration * 1000)
      .getOrElse(0)
  ).format();
}
