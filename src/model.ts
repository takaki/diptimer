import {List, Range, Record} from 'immutable';
import {None, Option} from 'monapt';
import printf = require('printf');

export enum SWState {
    BEFORE_START, RUNNING, SUSPEND, FINISHED
}

export class StopWatch {
    leftTime: LeftTime;
    timeoutIds: Array<number>;
    swstate: SWState;
    started: Option<Date>;

    constructor(public title: string, seconds: number,
                public onTick: (sw: StopWatch) => void = () => {
                    return;
                },
                public onFinish: (sw: StopWatch) => void = () => {
                    return;
                }) {
        this.leftTime = new LeftTime(seconds * 1000);
        this.timeoutIds = [];
        this.started = None;
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
        this.leftTime = this.leftmsec();
        this.started = None;
        this.timeoutIds.forEach(id => clearTimeout(id));
        this.swstate = SWState.SUSPEND;
    }

    leftmsec(): LeftTime {
        return this.leftTime.calc(this.started.map((started: Date) => (new Date()).getTime() - started.getTime())
                                      .getOrElse(() => 0));
    }

    tick_() {
        this.timeoutIds.push(window.setTimeout(
            () => {
                this.onTick(this);
                if (this.leftmsec().finished ) {
                    this.swstate = SWState.FINISHED;
                    this.onFinish(this);
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
                              new TimerEntry({title: 'A', duration: 5}),
                              new TimerEntry({title: 'B', duration: 4}),
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
                                                                                             title: printf('%d分', i),
                                                                                             duration: i * 60
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

class LeftTime {

    constructor(private milliSeconds: number) {

    }

    get seconds() {
        return this.milliSeconds / 1000;
    }

    get finished() {
        return this.milliSeconds < 0;
    }
    timestr(): string {
        if (this.milliSeconds <= 0) {
            return '00:00:00';
        }
        const seconds = this.milliSeconds / 1000;
        return printf('%02d:%02d:%02d',
                      Math.floor(seconds / 3600),
                      Math.floor((seconds % 3600) / 60),
                      Math.floor(seconds % 60));
    }

    toLeftString_(): string {
        const seconds = Math.ceil(this.milliSeconds / 1000);
        if (seconds < 10) {
            return seconds.toString();
        } else {
            const hour = Math.floor(seconds / 3600);
            const min = Math.floor((seconds % 3600) / 60);
            const sec = Math.floor(seconds % 60);
            return `残り${(hour > 0 ? hour + '時間' : '')}
        ${(min > 0 ? min + '分' : '')}
        ${(sec > 0 ? sec + '秒' : '')}
        です`;
        }
    }

    calc(diff: number) {
        return new LeftTime(this.milliSeconds - diff);
    }
}