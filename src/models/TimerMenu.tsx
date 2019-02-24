import { IconButton, ListItem, ListItemSecondaryAction, ListItemText, MenuItem } from "@material-ui/core";
import { List, Range, Record } from "immutable";
import printf from "printf";
import React from "react";
import { MenuEntry } from "./MenuEntry";
import { TimerEntry } from "./TimerEntry";
import { Timer, TimerOff } from "@material-ui/icons";

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
            name: printf("%d分", i),
            timers: List.of(new TimerEntry({
                title: printf("%d分", i),
                duration: i * 60,
            })),
        }))),
};

export class TimerMenu extends Record(defaultTimerMenu) implements ITimerMenu {


    public selectItems() {
        return this.menuEntries.map((e: MenuEntry) => e.name).map((n, i) => (
            <MenuItem value={i} key={n}>{n}</MenuItem>));
    }

    public timerList(menuIndex: number, timerIndex: number) {
        return this.menuEntries.get(menuIndex)!.timers.map((e: TimerEntry, i) => (
            <ListItem
                button={true}
                disabled={true}
                className="timer-list"
                data-is-current={i === timerIndex}
                key={i}
            >
                <ListItemText>
                    {printf("%s %d:%02d", e.title, Math.floor(e.duration / 60), e.duration % 60)}
                </ListItemText>
                <ListItemSecondaryAction>
                    <IconButton aria-label="Delete">
                        {i === timerIndex ? <Timer/> : <TimerOff/>}
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        ));
    }

}