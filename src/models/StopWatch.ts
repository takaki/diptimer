import { array, range, reverse } from "fp-ts/lib/Array";
import { concat } from "fp-ts/lib/function";
import { RemainTime } from "./RemainTime";
import { ITimerEntry } from "./TimerEntry";

enum WatchState {
  BEFORE_START,
  RUNNING,
  SUSPEND,
  FINISHED
}

export class StopWatch {
  public remainTime1: RemainTime;
  public checkPoints: number[];
  public timeoutIds: number[] = [];
  public state: WatchState = WatchState.BEFORE_START;
  public startedAt?: Date = undefined;

  constructor(
    public timerEntry: ITimerEntry,
    public onTick: (sw: StopWatch) => void = () => {
      return;
    },
    public onFinish: (sw: StopWatch) => void = () => {
      return;
    }
  ) {
    this.remainTime1 = new RemainTime(timerEntry.duration * 1000);
    this.checkPoints = getCheckPoints(timerEntry.duration);
  }

  public go() {
    switch (this.state) {
      case WatchState.RUNNING:
      case WatchState.FINISHED:
        return;
      case WatchState.BEFORE_START:
        const synthes = new SpeechSynthesisUtterance(
          `${this.timerEntry.title}です`
        );
        synthes.lang = "ja-JP";
        speechSynthesis.speak(synthes);
        break;
      default:
        break;
    }
    this.startedAt = new Date();
    this.timeoutIds.push(window.setTimeout(() => this.tick_(), 100));
    this.state = WatchState.RUNNING;
  }

  public pause() {
    switch (this.state) {
      case WatchState.SUSPEND:
      case WatchState.FINISHED:
        return;
    }
    this.remainTime1 = this.remainTime();
    this.startedAt = undefined;
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.state = WatchState.SUSPEND;
  }

  public remainTime(): RemainTime {
    return this.remainTime1.calc(
      this.startedAt ? Date.now() - this.startedAt.getTime() : 0
    );
  }

  public remainTimeString(): string {
    return this.remainTime().format();
  }

  public tick_() {
    this.timeoutIds.push(
      window.setTimeout(() => {
        this.onTick(this);
        if (this.remainTime().finished) {
          this.state = WatchState.FINISHED;
          this.onFinish(this);
        } else {
          this.tick_();
        }
      }, 90)
    );
  }

  public canRun() {
    return (
      this.state === WatchState.BEFORE_START ||
      this.state === WatchState.SUSPEND
    );
  }
}

const getCheckPoints = (limit: number): number[] => {
  return reverse(
    array.filter(
      array.reduce(
        [
          range(1, 6),
          range(1, 6).map(i => i * 10),
          range(1, 15).map(i => i * 60)
        ],
        [] as number[],
        concat
      ),
      e => e < limit
    )
  );
};
