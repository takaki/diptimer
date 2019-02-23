import { List, Range, Record } from "immutable";
import printf from "printf";
import { MenuEntry } from "./menu_entry";
import { TimerEntry } from "./timer_entry";

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

    public setMenuIndex(i: number) {
        return new DataStore(this.set("menuIndex", i)).setTimerIndex(0).setFinish(false).setRunning(false);
    }

    public setTimerIndex(i: number) {
        return new DataStore(this.set("timerIndex", i));
    }

    public setTime(s: string) {
        return new DataStore(this.set("time", s));
    }

    public setLabel(s: string) {
        return new DataStore(this.set("label", s));
    }

    public setRunning(b: boolean) {
        return new DataStore(this.set("running", b));
    }

    public setFinish(b: boolean) {
        return new DataStore(this.set("finish", b));
    }

    public getCurrentMenu() {
        return timerMenu.get(this.menuIndex);
    }

    public getName() {
        return timerMenu.get(this.menuIndex)!.get("name");
    }

    public getTimerList(): List<TimerEntry> {
        return timerMenu.get(this.menuIndex)!.get("timers");
    }

    public getTimer() {
        return timerMenu.get(this.menuIndex)!.get("timers").get(this.timerIndex);
    }

    public getTitle() {
        return this.getTimer()!.get("title");
    }

    public getDuration() {
        return this.getTimer()!.get("duration");
    }

    public getNames() {
        return timerMenu.map((e: MenuEntry) => e.name);
    }

    public isTimerLeft() {
        return this.timerIndex + 1 < this.getTimerList().size;
    }

    public nextTimer() {
        return this.setTimerIndex(this.timerIndex + 1);
    }

}

const timerMenu = List.of(
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
    })));
