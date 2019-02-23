/* tslint:disable:max-classes-per-file */
import { None, Option } from "monapt";
import printf from "printf";

export enum SWState {
    BEFORE_START, RUNNING, SUSPEND, FINISHED,
}

export class StopWatch {
    public leftTime: LeftTime;
    public timeoutIds: number[];
    public swstate: SWState;
    public started: Option<Date>;

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

    public go() {
        if (this.swstate === SWState.RUNNING || this.swstate === SWState.FINISHED) {
            return;
        }
        if (this.swstate === SWState.BEFORE_START) {
            const synthes = new SpeechSynthesisUtterance(`${this.title}です`);
            synthes.lang = "ja-JP";
            speechSynthesis.speak(synthes);
        }
        this.started = Option(new Date());
        this.timeoutIds.push(window.setTimeout(() => this.tick_(), 100));
        this.swstate = SWState.RUNNING;
    }

    public pause() {
        if (this.swstate === SWState.SUSPEND || this.swstate === SWState.FINISHED) {
            return;
        }
        this.leftTime = this.leftmsec();
        this.started = None;
        this.timeoutIds.forEach((id) => clearTimeout(id));
        this.swstate = SWState.SUSPEND;
    }

    public leftmsec(): LeftTime {
        return this.leftTime.calc(this.started.map((started: Date) => (new Date()).getTime() - started.getTime())
            .getOrElse(() => 0));
    }

    public tick_() {
        this.timeoutIds.push(window.setTimeout(
            () => {
                this.onTick(this);
                if (this.leftmsec().finished) {
                    this.swstate = SWState.FINISHED;
                    this.onFinish(this);
                } else {
                    this.tick_();
                }
            },
            90));
    }

    public canRun() {
        return this.swstate === SWState.BEFORE_START || this.swstate === SWState.SUSPEND;
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

    public timestr(): string {
        if (this.milliSeconds <= 0) {
            return "00:00:00";
        }
        const seconds = this.milliSeconds / 1000;
        return printf("%02d:%02d:%02d",
            Math.floor(seconds / 3600),
            Math.floor((seconds % 3600) / 60),
            Math.floor(seconds % 60));
    }

    public toLeftString_(): string {
        const seconds = Math.ceil(this.milliSeconds / 1000);
        if (seconds < 10) {
            return seconds.toString();
        } else {
            const hour = Math.floor(seconds / 3600);
            const min = Math.floor((seconds % 3600) / 60);
            const sec = Math.floor(seconds % 60);
            return `残り${(hour > 0 ? hour + "時間" : "")}
        ${(min > 0 ? min + "分" : "")}
        ${(sec > 0 ? sec + "秒" : "")}
        です`;
        }
    }

    public calc(diff: number) {
        return new LeftTime(this.milliSeconds - diff);
    }
}
