import {Record, fromJS} from "immutable";


class DataStore extends Record({
    menuIndex: 2,
    timerIndex: 0,
    time: "",
    label: "Go",
    running: false,
    finish: false
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
}

export default  DataStore;