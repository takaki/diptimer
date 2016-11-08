import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import {Enum} from 'enumify';
import React, {Component} from 'react';
import './App.css';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import {List, ListItem} from 'material-ui/List';
import ImageTimer from 'material-ui/svg-icons/image/timer';
import ImageTimerOff from 'material-ui/svg-icons/image/timer-off';
import AvPlayArrow from 'material-ui/svg-icons/av/play-arrow';
import AvPause from 'material-ui/svg-icons/av/pause';
import NoSleep from 'nosleep.js/NoSleep';
import Divider from 'material-ui/Divider';

class SWState extends Enum {
}

SWState.initEnum(['BEFORE_START', 'RUNNING', "SUSPEND", "FINISHED"]);


class StopWatch {
    constructor(title, seconds, onTick, onFinish) {
        this.title = title;
        this.seconds = seconds;
        this.onTick = onTick;
        this.onFinish = onFinish;
        this.mseconds = seconds * 1000;
        this.timeoutIds = [];
        this.checkpoint = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(i=>i * 60).concat([50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]).filter(element => element < seconds);
        // this.checkpoint = [3 * 60, 2 * 60, 60, 30, 20, 10, 5, 4, 3, 2, 1].filter(element => element < seconds);
        // this.checkpoint = [3 * 60, 2 * 60, 60, 30, 20, 10, 1].filter(element => element < seconds);
        this.swstate = SWState.BEFORE_START;

    }

    toString() {
        var totalSeconds = Math.ceil(this.left_() / 1000);
        if (totalSeconds <= 0) {
            return `00:00:00`;
        }
        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = Math.floor(totalSeconds % 60);

        return `${(hours < 10 ? "0" + hours : hours )}:${(minutes < 10 ? "0" + minutes : minutes)}:${(seconds < 10 ? "0" + seconds : seconds)}`;
    }

    toLeftString_() {
        var totalSeconds = Math.ceil(this.left_() / 1000);
        if (totalSeconds <= 10) {
            return totalSeconds;
        } else {
            var hours = Math.floor(totalSeconds / 3600);
            var minutes = Math.floor((totalSeconds % 3600) / 60);
            var seconds = Math.floor(totalSeconds % 60);
            return `あと${(hours > 0 ? hours + "時間" : "")}${(minutes > 0 ? minutes + "分" : "")}${(seconds > 0 ? seconds + "秒" : "")}です`;
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
            var synthes = new SpeechSynthesisUtterance(`${this.title}です`);
            synthes.lang = "ja-JP";
            speechSynthesis.speak(synthes);
        }
        this.started = new Date();
        this.timeoutIds.push(setTimeout(()=> this.tick_(), 100));
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
            var synthes = new SpeechSynthesisUtterance(this.toLeftString_());
            synthes.lang = "ja-JP";
            synthes.rate = 1.2;
            speechSynthesis.speak(synthes);
            this.checkpoint.shift();
        }
        this.timeoutIds.push(setTimeout(() => {
            const duration = Date.now() - this.started;
            this.onTick();
            if (duration >= this.mseconds) {
                // var synthes = new SpeechSynthesisUtterance("終了です。");
                // synthes.lang = "ja-JP";
                // speechSynthesis.speak(synthes);
                this.onFinish();
                this.swstate = SWState.FINISHED;
            } else {
                this.tick_();
            }
        }, 100))
    }
}

class GameTimer extends Component {
    constructor() {
        super();
        this.timers = [
            {title: "外交フェイズ", duration: 15 * 60},
            {title: "命令記述フェイズ", duration: 5 * 60},
            {title: "命令解決フェイズ", duration: 10 * 60},
            // {title: "A", duration: 3},
            // {title: "B", duration: 3},
            // {title: "C", duration: 3},
        ];

        this.state = {timerIndex: 0};

        this.noSleep = new NoSleep();
    }

    componentWillMount() {
        this.resetTimer();
    }

    resetTimer() {
        this.setState({
            timerIndex: 0,
        });
        this.setTimer_(0);
    }

    setTimer_(i) {
        const sw = new StopWatch(this.timers[i].title,
            this.timers[i].duration,
            () => {
                this.setState({time: this.state.sw.toString()});
            },
            () => {
                if (this.state.timerIndex + 1 < this.timers.length) {
                    this.nextTimer();
                    this.state.sw.go();
                } else {
                    var synthes = new SpeechSynthesisUtterance("終了です。");
                    synthes.lang = "ja-JP";
                    speechSynthesis.speak(synthes);
                }
            }
            )
            ;
        this.setState({
            sw: sw,
            time: sw.toString(),
            title: this.timers[i].title,
            label: "Go",
            icon: <AvPlayArrow/>,
        })
    }

    nextTimer() {
        this.setState({timerIndex: this.state.timerIndex + 1});
        this.setTimer_(this.state.timerIndex);
    }

    static timeformat_(d) {
        const m = Math.floor(d / 60);
        const s = d % 60;
        return `${m}:${(s < 10 ? "0" + s : s)}`
    }

    render() {
        return (
            <div>
                <List>
                    {this.timers.map((e, i) =>
                        <ListItem
                            disabled={true}
                            primaryText={
                                `${e.title} (${GameTimer.timeformat_(e.duration)})`
                            }
                            key={i}
                            style={{backgroundColor: i === this.state.timerIndex ? "lime" : "white"}}
                            rightIcon={i === this.state.timerIndex ? <ImageTimer/> : <ImageTimerOff/>}/>)
                    }
                    <Divider/>
                    <div disabled={true} className="timedisplay">{this.state.time}</div>
                    <Divider/>
                    <ListItem disabled={true} primaryText={
                        <div>
                            <RaisedButton label={this.state.label} icon={this.state.icon} onClick={() => {
                                this.noSleep.enable();
                                if ([SWState.BEFORE_START, SWState.SUSPEND].includes(this.state.sw.getSWState())) {
                                    this.state.sw.go();
                                    this.setState({
                                        label: "Pause",
                                        icon: <AvPause/>
                                    })
                                } else {
                                    this.state.sw.pause();
                                    this.setState({
                                        label: "Go",
                                        icon: <AvPlayArrow/>

                                    })
                                }
                            }}/>
                            <RaisedButton label="Reset" secondary={true} onClick={() => {
                                this.state.sw.pause();
                                this.noSleep.disable();
                                this.resetTimer();
                            }}/></div>}/>
                    <Divider />
                    <ListItem disabled={true} primaryText={<div>&copy; Copyright 2016 TANIGUCHI Takaki <a
                        href="https://github.com/takaki/gametimer">https://github.com/takaki/gametimer</a></div>}/>
                    <Divider />
                    <ListItem disabled={true}
                              primaryText={<img alt="https://goo.gl/jXBYUq" src="https://goo.gl/jXBYUq.qr"/> }/>
                </List>
            </div>
        )
    }
}

class App extends Component {
    render() {
        return (
            <MuiThemeProvider>
                <div className="App">
                    <GameTimer time={4}/>
                </div>
            </MuiThemeProvider>
        );
    }
}

export default App;