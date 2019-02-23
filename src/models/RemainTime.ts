import printf from "printf";

export class RemainTime {

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
        return new RemainTime(this.milliSeconds - diff);
    }
}
