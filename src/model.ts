import {List, Range, Record} from 'immutable';
import {None, Option} from 'monapt';
import printf = require('printf');

export enum SWState {
    BEFORE_START, RUNNING, SUSPEND, FINISHED
}

export class StopWatch {
    title: string;
    mseconds: number;
    timeoutIds: Array<number>;
    checkpoint: Array<number>;
    onTick: (sw: StopWatch) => void;
    onFinish: (sw: StopWatch) => void;
    swstate: SWState;
    started: Option<Date>;

    constructor(title: string, seconds: number,
                onTick: (sw: StopWatch) => void = () => {
                    return;
                },
                onFinish: (sw: StopWatch) => void = () => {
                    return;
                }) {
        this.title = title;
        this.onTick = onTick;
        this.onFinish = onFinish;
        this.mseconds = seconds * 1000;
        this.timeoutIds = [];
        this.started = None;
        this.checkpoint = Range(1, 6).concat(Range(10, 60, 10)).concat(Range(60, 15 * 60, 60))
            .filter((element: number) => element < seconds).reverse().toArray();
        this.swstate = SWState.BEFORE_START;
    }

    go() {
        if (this.swstate === SWState.RUNNING || this.swstate === SWState.FINISHED) {
            return;
        }
        if (this.swstate === SWState.BEFORE_START) {
            const synthes = new SpeechSynthesisUtterance(`${this.title}です`);
            synthes.lang = 'ja-JP';
            speechSynthesis.speak(synthes);
        }
        this.started = Option(new Date());
        this.timeoutIds.push(window.setTimeout(() => this.tick_(), 100));
        this.swstate = SWState.RUNNING;
    }

    pause() {
        if (this.swstate === SWState.SUSPEND || this.swstate === SWState.FINISHED) {
            return;
        }
        this.mseconds = this.leftmsec();
        this.started = None;
        this.timeoutIds.forEach(id => clearTimeout(id));
        this.swstate = SWState.SUSPEND;
    }

    leftmsec(): number {
        return this.started.map((started: Date) =>
            (this.mseconds - ((new Date()).getTime() - started.getTime()))).getOrElse(() => this.mseconds);
    }

    tick_() {
        this.timeoutIds.push(window.setTimeout(
            () => {
                this.onTick(this);
                if (this.leftmsec() <= 0) {
                    this.onFinish(this);
                    this.swstate = SWState.FINISHED;
                } else {
                    this.tick_();
                }
            },
            90));
    }

    canRun() {
        return this.swstate === SWState.BEFORE_START || this.swstate === SWState.SUSPEND;
    }
}

export class TimerEntry extends Record({
    title: '',
    duration: 0
}) {
    title: string;
    duration: number;
}
class MenuEntry extends Record({
    name: '',
    timers: List()
}) {
    name: string;
    timers: List<TimerEntry>;
}

export class DataStore extends Record({
    menuIndex: 0,
    timerIndex: 0,
    time: '',
    label: 'Go',
    running: false,
    finish: false,
}) {
    static timerMenu = List.of(
        new MenuEntry({
            name: 'ディプロマシー',
            timers: List.of(
                new TimerEntry({title: '外交フェイズ', duration: 15 * 60}),
                new TimerEntry({title: '命令記述フェイズ', duration: 5 * 60}),
                new TimerEntry({title: '命令解決フェイズ', duration: 10 * 60})
            )
        }),
        new MenuEntry({
            name: 'テスト',
            timers: List.of(
                new TimerEntry({title: 'A', duration: 3}),
                new TimerEntry({title: 'B', duration: 3}),
                new TimerEntry({title: 'C', duration: 3})
            )
        }),
        new MenuEntry({
            name: 'テスト2',
            timers: List.of(
                new TimerEntry({title: 'A', duration: 1}))
        })).concat(
        Range(1, 16).map((i: number) => new MenuEntry({
            name: printf('%d分', i),
            timers: List.of(new TimerEntry({
                title: printf('%d分', i), duration: i * 60
            }))
        })));

    menuIndex: number;
    timerIndex: number;
    time: string;
    label: string;
    running: boolean;
    finish: boolean;

    setMenuIndex(i: number) {
        return new DataStore(this.set('menuIndex', i)).setTimerIndex(0).setFinish(false).setRunning(false);
    }

    setTimerIndex(i: number) {
        return new DataStore(this.set('timerIndex', i));
    }

    setTime(s: string) {
        return new DataStore(this.set('time', s));
    }

    setLabel(s: string) {
        return new DataStore(this.set('label', s));
    }

    setRunning(b: boolean) {
        return new DataStore(this.set('running', b));
    }

    setFinish(b: boolean) {
        return new DataStore(this.set('finish', b));
    }

    getCurrentMenu() {
        return DataStore.timerMenu.get(this.menuIndex);
    }

    getName() {
        return DataStore.timerMenu.get(this.menuIndex).get('name');
    }

    getTimerList(): List<TimerEntry> {
        return DataStore.timerMenu.get(this.menuIndex).get('timers');
    }

    getTimer() {
        return DataStore.timerMenu.get(this.menuIndex).get('timers').get(this.timerIndex);
    }

    getTitle() {
        return this.getTimer().get('title');
    }

    getDuration() {
        return this.getTimer().get('duration');
    }

    getNames() {
        return DataStore.timerMenu.map((e: MenuEntry) => e.name);
    }

    isTimerLeft() {
        return this.timerIndex + 1 < this.getTimerList().size;
    }

    nextTimer() {
        return this.setTimerIndex(this.timerIndex + 1);
    }

}
