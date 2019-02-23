import { Record } from "immutable";

interface ITimerEntry {
    title: string;
    duration: number;
}

const defaultTimerEntry: ITimerEntry = {
    title: "",
    duration: 0,
};

export class TimerEntry extends Record(defaultTimerEntry) implements  ITimerEntry {}
