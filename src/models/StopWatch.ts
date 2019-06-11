import { array, range, reverse } from "fp-ts/lib/Array";
import { concat } from "fp-ts/lib/function";
import { IRemainTime, remainTime } from "./RemainTime";
import { ITimerEntry } from "./TimerEntry";

enum WatchState {
  BEFORE_START,
  RUNNING,
  SUSPEND,
  FINISHED
}

export class StopWatch {
  private checkPoints: number[];
  private remainTime1: IRemainTime;
  private timeoutIds: number[] = [];
  private state: WatchState = WatchState.BEFORE_START;
  private startedAt?: Date = undefined;

  constructor(
    private timerEntry: ITimerEntry,
    private onTick: (sw: StopWatch) => void = () => {
      return;
    },
    private onFinish: (sw: StopWatch) => void = () => {
      return;
    }
  ) {
    this.remainTime1 = { milliSeconds: timerEntry.duration * 1000 };
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

  public remainTime(): IRemainTime {
    return remainTime.calc(
      this.startedAt ? Date.now() - this.startedAt.getTime() : 0,
      this.remainTime1
    );
  }
  public tick_() {
    this.timeoutIds.push(
      window.setTimeout(() => {
        this.onTick(this);
        if (remainTime.finished(this.remainTime())) {
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

  public shiftCheckPoints() {
    this.checkPoints.shift();
  }

  public firstCheckPoint() {
    return this.checkPoints[0];
  }
}

const getCheckPoints = (limit: number): number[] => {
  return reverse(
    array.filter(
      array.reduce(
        [
          range(1, 5),
          range(1, 5).map(i => i * 10),
          range(1, 15).map(i => i * 60)
        ],
        [] as number[],
        concat
      ),
      e => e < limit
    )
  );
};
