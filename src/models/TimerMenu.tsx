import { MenuItem, Select } from "@material-ui/core";
import { List, Range, Record } from "immutable";
import * as React from "react";
import { IMenuEntry } from "./MenuEntry";
import { RemainTime } from "./RemainTime";

interface ITimerMenu {
  menuEntries: List<IMenuEntry>;
}

export const defaultTimerMenu: ITimerMenu = {
  menuEntries: List.of(
    {
      name: "ディプロマシー",
      timers: List.of(
        { title: "外交フェイズ", duration: 15 * 60 },
        { title: "命令記述フェイズ", duration: 5 * 60 },
        { title: "命令解決フェイズ", duration: 10 * 60 }
      )
    },
    {
      name: "テスト",
      timers: List.of(
        { title: "A", duration: 5 },
        { title: "B", duration: 4 },
        { title: "C", duration: 3 }
      )
    },
    {
      name: "テスト2",
      timers: List.of({ title: "A", duration: 1 })
    }
  ).concat(
    Range(1, 16).map((i: number) => ({
      name: `${i}分`,
      timers: List.of({ title: `${i}分`, duration: i * 60 })
    }))
  )
};

export class TimerMenu extends Record(defaultTimerMenu) implements ITimerMenu {
  public selectMenu(
    menuIndex: number,
    onMenuSelect: (ev: React.ChangeEvent<any>) => void
  ) {
    const selectItems = this.menuEntries
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

  public remainTimeStr(menuIndex: number): string {
    return new RemainTime(
      this.menuEntries.get(menuIndex)!.timers.get(0)!.duration * 1000
    ).format();
  }
}
