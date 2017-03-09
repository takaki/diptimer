import {Record, fromJS} from "immutable";
import {Enum} from "enumify";
import NoSleep from "nosleep.js/NoSleep";

export class SWState extends Enum {
}

SWState.initEnum(['BEFORE_START', 'RUNNING', "SUSPEND", "FINISHED"]);


export class StopWatch {
    constructor(title, seconds, onTick, onFinish) {
        this.title = title;
        this.seconds = seconds;
        this.onTick = onTick;
        this.onFinish = onFinish;
        this.mseconds = seconds * 1000;
        this.timeoutIds = [];
        this.checkpoint = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(i => i * 60).concat([50, 40, 30, 20, 10, 5, 4, 3, 2, 1]).filter(element => element < seconds);
        //this.checkpoint = [3 * 60, 2 * 60, 60, 30, 20, 10, 1].filter(element => element < seconds);
        this.swstate = SWState.BEFORE_START;

    }

    toString() {
        const totalSeconds = Math.ceil(this.left_() / 1000);
        if (totalSeconds <= 0) {
            return `00:00:00`;
        }
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        return `${(hours < 10 ? "0" + hours : hours )}:${(minutes < 10 ? "0" + minutes : minutes)}:${(seconds < 10 ? "0" + seconds : seconds)}`;
    }

    toLeftString_() {
        const totalSeconds = Math.ceil(this.left_() / 1000);
        if (totalSeconds < 10) {
            return totalSeconds;
        } else {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = Math.floor(totalSeconds % 60);
            return `残り${(hours > 0 ? hours + "時間" : "")}${(minutes > 0 ? minutes + "分" : "")}${(seconds > 0 ? seconds + "秒" : "")}です`;
        }
    }

    getSWState() {
        return this.swstate
    }

    go() {
        if (this.swstate === SWState.RUNNING || this.swstate === SWState.FINISHED) {
            return;
        }
        if (this.swstate === SWState.BEFORE_START) {
            const synthes = new SpeechSynthesisUtterance(`${this.title}です`);
            synthes.lang = "ja-JP";
            speechSynthesis.speak(synthes);
        }
        this.started = new Date();
        this.timeoutIds.push(setTimeout(() => this.tick_(), 100));
        this.swstate = SWState.RUNNING;
    }

    pause() {
        if (this.swstate === SWState.SUSPEND || this.swstate === SWState.FINISHED) {
            return;
        }
        this.mseconds = this.left_();
        this.started = undefined;
        for (let id of this.timeoutIds) {
            clearTimeout(id);
        }
        this.swstate = SWState.SUSPEND;
    }

    left_() {
        return this.started ? (this.mseconds - (new Date() - this.started)) : this.mseconds;
    }

    tick_() {
        if (this.left_() / 1000 < this.checkpoint[0]) {
            const synthes = new SpeechSynthesisUtterance(this.toLeftString_());
            synthes.lang = "ja-JP";
            synthes.rate = 1.2;
            speechSynthesis.speak(synthes);
            this.checkpoint.shift();
        }
        this.timeoutIds.push(setTimeout(() => {
            const duration = Date.now() - this.started;
            this.onTick();
            if (duration >= this.mseconds) {
                this.onFinish();
                this.swstate = SWState.FINISHED;
            } else {
                this.tick_();
            }
        }, 90))
    }

    isRun() {
        return [SWState.BEFORE_START, SWState.SUSPEND].includes(this.getSWState())
    }
}


class DataStore extends Record({
    menuIndex: 0,
    timerIndex: 0,
    time: "",
    label: "Go",
    running: false,
    finish: false,
    noSleep: new NoSleep(),
    sw: new StopWatch("dummy", 0),
}) {
    static timerMenu = fromJS([{
        name: "ディプロマシー",
        timers: [
            {title: "外交フェイズ", duration: 15 * 60},
            {title: "命令記述フェイズ", duration: 5 * 60},
            {title: "命令解決フェイズ", duration: 10 * 60}
        ]
    }, {
        name: "テスト",
        timers: [
            {title: "A", duration: 3},
            {title: "B", duration: 3},
            {title: "C", duration: 3}
        ]
    }, {
        name: "テスト2",
        timers: [
            {title: "A", duration: 1},
        ]
    }].concat(
        Array.from(new Array(15).keys()).map(e => {
            const i = e + 1;
            return {
                name: `${i}分`, timers: [{title: `${i}分`, duration: i * 60}]
            }
        })));

    setMenuIndex(i) {
        return this.set('menuIndex', i).setTimerIndex(0).setFinish(false).setRunning(false);
    }

    setTimerIndex(i) {
        return this.set('timerIndex', i);
    }

    setTime(s) {
        return this.set('time', s);
    }

    setLabel(s) {
        return this.set('label', s);
    }

    setRunning(b) {
        return this.set('running', b);
    }

    setFinish(b) {
        return this.set('finish', b);
    }

    setSw(onTick, onFinish) {
        return this.set('sw', new StopWatch(this.getTitle(), this.getDuration(), onTick, onFinish));
    }

    getCurrentMenu() {
        return DataStore.timerMenu.get(this.menuIndex);
    }

    getName() {
        return DataStore.timerMenu.get(this.menuIndex).get('name');
    }

    getTimerList() {
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
        return DataStore.timerMenu.toKeyedSeq().map(e => e.get('name'));
    }

    isTimerLeft() {
        return this.timerIndex + 1 < this.getTimerList().size
    }

    nextTimer() {
        return this.setTimerIndex(this.timerIndex + 1);
    }

    toggleSwitch() {
        if (this.sw.isRun()) {
            this.sw.go();
            return this.setLabel("Pause").setRunning(true);
        } else {
            this.sw.pause();
            return this.setLabel("Go").setRunning(false);
        }

    }
}

export default  DataStore;