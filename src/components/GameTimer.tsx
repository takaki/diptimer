import { Divider, List } from "@material-ui/core";
import { Pause } from "@material-ui/icons";
// @ts-ignore
import NoSleep from "nosleep.js";
import React, { Component } from "react";
import { StopWatch } from "../models/StopWatch";
import { TimerMenu } from "../models/TimerMenu";
import { IGameTimerProps } from "../types";

export class GameTimer extends Component<IGameTimerProps> {

    public noSleep: NoSleep = new NoSleep();
    public timerMenu: TimerMenu = new TimerMenu();
    private sw: StopWatch = new StopWatch("dummy", 0, []);

    public componentDidMount() {
        this.onChange(this.props.dataStore!.menuIndex);
    }

    public render() {
        return (
            <div>
                {this.timerMenu.selectMenu(this.props.dataStore.menuIndex, this.onMenuSelect)}
                <List>
                    {this.props.dataStore.timerList(this.timerMenu)}
                    <Divider/>
                    {this.props.dataStore.timeDisplay()}
                    {this.props.dataStore.controlButtons(this.onPlayClick, this.onResetClick)}
                </List>
            </div>
        );
    }

    private onChange(menuIndex: number) {
        const onTick = (sw: StopWatch) => {
            if (sw.remainTime().seconds < sw.checkPoints[0]) {
                const synthes = new SpeechSynthesisUtterance(sw.remainTime().toLeftString());
                synthes.lang = "ja-JP";
                synthes.rate = 1.2;
                speechSynthesis.speak(synthes);
                sw.checkPoints.shift();
            }
            this.props.setRemainTime(sw.remainTimeString());
        };
        const onFinish = (sw: StopWatch) => {
            if (this.props.dataStore.isTimerLeft(this.timerMenu)) {
                const store = this.props.dataStore.nextTimer();
                this.sw = store.createStopWatch(this.timerMenu, onTick, onFinish);
                this.props.updateStore(store);
                this.sw.go();
            } else {
                const synthes = new SpeechSynthesisUtterance("終了です。");
                synthes.lang = "ja-JP";
                speechSynthesis.speak(synthes);
                this.props.updateStore(this.props.dataStore.set("finish", true));
            }
        };
        this.sw.pause();
        this.noSleep.disable();
        const dataStore = this.props.dataStore.merge({
            menuIndex,
            timerIndex: 0,
            finish: false,
            label: "Go",
            running: false,
        });
        this.sw = dataStore.createStopWatch(this.timerMenu, onTick, onFinish);
        this.props.setRemainTime(this.sw.remainTimeString());
    }

    private onPlayClick = () => {
        this.noSleep.enable();
        if (this.sw.canRun()) {
            this.sw.go();
            this.props.execPause();
        } else {
            this.sw.pause();
            this.props.execGo();
        }
    }

    private onResetClick = () => {
        this.onChange(this.props.dataStore.menuIndex);
    }

    private onMenuSelect = (ev: React.ChangeEvent<HTMLSelectElement>) => {
        this.onChange(parseInt(ev.target.value, 10));
    }
}
