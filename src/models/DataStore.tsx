import { List, Range, Record } from "immutable";
import React from "react";
import { TimerEntry } from "./TimerEntry";
import { TimerMenu } from "./TimerMenu";


interface IDataStore {
    menuIndex: number;
    timerIndex: number;
    time: string;
    label: string;
    running: boolean;
    finish: boolean;
}

const defaultDataStore: IDataStore = {
    menuIndex: 0,
    timerIndex: 0,
    time: "",
    label: "Go",
    running: false,
    finish: false,
};

export class DataStore extends Record(defaultDataStore) implements IDataStore {

    public getTimerList(timerMenu: TimerMenu): List<TimerEntry> {
        return timerMenu.menuEntries.get(this.menuIndex)!.timers;
    }

    public getTimer(timerMenu: TimerMenu) {
        return timerMenu.menuEntries.get(this.menuIndex)!.timers.get(this.timerIndex);
    }

    public getTitle(timerMenu: TimerMenu) {
        return this.getTimer(timerMenu)!.get("title");
    }

    public getDuration(timerMenu: TimerMenu) {
        return this.getTimer(timerMenu)!.get("duration");
    }

    public getCheckPoints(timerMenu: TimerMenu): number[] {
        return Range(1, 6).concat(Range(10, 60, 10)).concat(Range(60, 15 * 60, 60))
            .filter((e: number) => e < timerMenu.menuEntries.get(this.menuIndex)!.timers.get(this.timerIndex)!.duration)
            .reverse().toArray();
    }

    public isTimerLeft(timerMenu: TimerMenu) {
        return this.timerIndex + 1 < timerMenu.menuEntries.get(this.menuIndex)!.timers.size;
    }

    public nextTimer() {
        return this.set("timerIndex", this.timerIndex + 1);
    }

}
