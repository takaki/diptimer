import { None, Option } from "monapt";
import { RemainTime } from "./RemainTime";

enum SWState {
    BEFORE_START, RUNNING, SUSPEND, FINISHED,
}

export class StopWatch {
    public leftTime: RemainTime;
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
        this.leftTime = new RemainTime(seconds * 1000);
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
        this.leftTime = this.remainTime();
        this.started = None;
        this.timeoutIds.forEach((id) => clearTimeout(id));
        this.swstate = SWState.SUSPEND;
    }

    public remainTime(): RemainTime {
        return this.leftTime.calc(this.started.map((started: Date) => (new Date()).getTime() - started.getTime())
            .getOrElse(() => 0));
    }

    public tick_() {
        this.timeoutIds.push(window.setTimeout(
            () => {
                this.onTick(this);
                if (this.remainTime().finished) {
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

