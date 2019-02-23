import { List, Record } from "immutable";
import { TimerEntry } from "./TimerEntry";

interface IMenuEntry {
    name: string;
    timers: List<TimerEntry>;
}

const defaultMenuEntry: IMenuEntry = {
    name: "",
    timers: List(),
};

export class MenuEntry extends Record(defaultMenuEntry) implements IMenuEntry {}
