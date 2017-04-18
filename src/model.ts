import {List, Record, Range} from 'immutable';
import {Option, None} from 'monapt';
import NoSleep from './nosleep';
import printf = require('printf');

export enum SWState {
    BEFORE_START, RUNNING, SUSPEND, FINISHED
}

export class StopWatch {
    title: string;
    mseconds: number;
    timeoutIds: Array<number>;
    checkpoint: List<number>;
    onTick: () => void;
    onFinish: () => void;
    swstate: SWState;
    started: Option<Date>;

    constructor(title: string, seconds: number,
                onTick: () => void = () => {
                    return;
                },
                onFinish: () => void = () => {
                    return;
                }) {
        this.title = title;
        this.onTick = onTick;
        this.onFinish = onFinish;
        this.mseconds = seconds * 1000;
        this.timeoutIds = [];
        this.started = None;
        this.checkpoint = Range(1, 6).concat(Range(10, 60, 10)).concat(Range(60, 15 * 60, 60))
            .filter((element: number) => element < seconds).reverse().toList();
        this.swstate = SWState.BEFORE_START;
    }

    toString(): string {
        const totalSeconds = Math.ceil(this.left_() / 1000);
        if (totalSeconds <= 0) {
            return '00:00:00';
        }
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        return printf('02d:%02d:%02d', hours, minutes, seconds);
    }

    toLeftString_(): string {
        const totalSeconds = Math.ceil(this.left_() / 1000);
        if (totalSeconds < 10) {
            return totalSeconds.toString();
        } else {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = Math.floor(totalSeconds % 60);
            return `残り${(hours > 0 ? hours + '時間' : '')}
        ${(minutes > 0 ? minutes + '分' : '')}
        ${(seconds > 0 ? seconds + '秒' : '')}
        です`;
        }
    }

    go() {
        if (this.swstate === SWState.RUNNING || this.swstate === SWState.FINISHED) {
            return;
        }
        if (this.swstate === SWState.BEFORE_START) {
            const synthes = new SpeechSynthesisUtterance(`
        ${this.title}
        です`);
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
        this.mseconds = this.left_();
        this.started = None;
        for (let id of this.timeoutIds) {
            clearTimeout(id);
        }
        this.swstate = SWState.SUSPEND;
    }

    left_(): number {
        return this.started.map((started: Date) =>
            (this.mseconds - ((new Date()).getTime() - started.getTime()))).getOrElse(() => this.mseconds);
    }

    tick_() {
        if (this.left_() / 1000 < this.checkpoint[0]) {
            const synthes = new SpeechSynthesisUtterance(this.toLeftString_());
            synthes.lang = 'ja-JP';
            synthes.rate = 1.2;
            speechSynthesis.speak(synthes);
            this.checkpoint.shift();
        }
        this.timeoutIds.push(window.setTimeout(
            () => {
                this.onTick();
                if (this.left_() <= 0) {
                    this.onFinish();
                    this.swstate = SWState.FINISHED;
                } else {
                    this.tick_();
                }
            },
            90));
    }

    isRun() {
        return this.swstate === SWState.BEFORE_START || this.swstate === SWState.SUSPEND;
    }
}

export class TimerEntry extends Record({
    title: '',
    duration: 0
}) {
    title: string;
    durataion: number;
}
class MenuEntry extends Record({
    name: '',
    timers: List()
}) {
    name: string;
    timers: List<TimerEntry>;
}

class DataStore extends Record({
    menuIndex: 0,
    timerIndex: 0,
    time: '',
    label: 'Go',
    running: false,
    finish: false,
    noSleep: new NoSleep(),
    sw: new StopWatch('dummy', 0),
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
            name: `
        ${i}
        分`,
            timers: List.of(new TimerEntry({
                title: `
        ${i}
        分`, duration: i * 60
            }))
        })));

    menuIndex: number;
    timerIndex: number;
    time: string;
    label: string;
    running: boolean;
    finish: boolean;
    noSleep: NoSleep;
    sw: StopWatch;

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

    setSw(onTick: () => void, onFinish: () => void) {
        return new DataStore(this.set('sw', new StopWatch(this.getTitle(), this.getDuration(), onTick, onFinish)));
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

    getTime() {
        return this.sw.toString();
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

    toggleSwitch() {
        if (this.sw.isRun()) {
            this.sw.go();
            return this.setLabel('Pause').setRunning(true);
        } else {
            this.sw.pause();
            return this.setLabel('Go').setRunning(false);
        }

    }
}

export default  DataStore;