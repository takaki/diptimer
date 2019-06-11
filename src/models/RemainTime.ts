import printf from "printf";

export class RemainTime {
  constructor(private milliSeconds: number) {}

  get seconds() {
    return this.milliSeconds / 1000;
  }

  get finished() {
    return this.milliSeconds < 0;
  }

  public format(): string {
    return this.milliSeconds <= 0
      ? "00:00:00"
      : printf(
          "%02d:%02d:%02d",
          Math.floor(this.seconds / 3600),
          Math.floor((this.seconds % 3600) / 60),
          Math.floor(this.seconds % 60)
        );
  }

  public toLeftString(): string {
    const seconds = Math.ceil(this.milliSeconds / 1000);
    if (seconds < 10) {
      return seconds.toString();
    }

    const hour = Math.floor(seconds / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    const sec = Math.floor(seconds % 60);
    return `残り${hour > 0 ? `{hour}時間` : ""}
        ${min > 0 ? `${min}分` : ""}
        ${sec > 0 ? `${sec}秒` : ""}
        です`;
  }

  public calc(diff: number) {
    return new RemainTime(this.milliSeconds - diff);
  }
}
