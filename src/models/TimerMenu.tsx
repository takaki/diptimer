import { MenuItem, Select } from "@material-ui/core";
import { List, Range, Record } from "immutable";
import React from "react";
import { MenuEntry } from "./MenuEntry";
import { TimerEntry } from "./TimerEntry";
import { RemainTime } from "./RemainTime";

interface ITimerMenu {
    menuEntries: List<MenuEntry>;
}

const defaultTimerMenu: ITimerMenu = {
    menuEntries: List.of(
        new MenuEntry({
            name: "ディプロマシー",
            timers: List.of(
                new TimerEntry({title: "外交フェイズ", duration: 15 * 60}),
                new TimerEntry({title: "命令記述フェイズ", duration: 5 * 60}),
                new TimerEntry({title: "命令解決フェイズ", duration: 10 * 60}),
            ),
        }),
        new MenuEntry({
            name: "テスト",
            timers: List.of(
                new TimerEntry({title: "A", duration: 5}),
                new TimerEntry({title: "B", duration: 4}),
                new TimerEntry({title: "C", duration: 3}),
            ),
        }),
        new MenuEntry({
            name: "テスト2",
            timers: List.of(
                new TimerEntry({title: "A", duration: 1})),
        })).concat(
        Range(1, 16).map((i: number) => new MenuEntry({
            name: `${i}分`,
            timers: List.of(new TimerEntry({
                title: `${i}分`,
                duration: i * 60,
            })),
        }))),
};

export class TimerMenu extends Record(defaultTimerMenu) implements ITimerMenu {

    public selectMenu(menuIndex: number, onMenuSelect: (ev: React.ChangeEvent<HTMLSelectElement>) => void) {
        const selectItems = this.menuEntries.map((e: MenuEntry) => e.name).map((n, i) => (
            <MenuItem value={i} key={n}>{n}</MenuItem>));
        return (
            <Select value={menuIndex} onChange={onMenuSelect}>
                {selectItems}
            </Select>);
    }

    public remainTimeStr(menuIndex: number): string {
        return new RemainTime(this.menuEntries.get(menuIndex)!.timers.get(0)!.duration * 1000).format();
    }
}
