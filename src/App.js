import injectTapEventPlugin from "react-tap-event-plugin";
import {Enum} from "enumify";
import React, {Component} from "react";
import "./App.css";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import RaisedButton from "material-ui/RaisedButton";
import {List, ListItem} from "material-ui/List";
import ImageTimer from "material-ui/svg-icons/image/timer";
import ImageTimerOff from "material-ui/svg-icons/image/timer-off";
import AvPlayArrow from "material-ui/svg-icons/av/play-arrow";
import AvPause from "material-ui/svg-icons/av/pause";
import NoSleep from "nosleep.js/NoSleep";
import Divider from "material-ui/Divider";
import MenuItem from "material-ui/MenuItem";
import DropDownMenu from "material-ui/DropDownMenu";
import {createStore} from "redux";
import {handleActions, createAction} from "redux-actions";
import {connect, Provider} from "react-redux";
import DataStore from "./model"
injectTapEventPlugin();


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
}

class GameTimer extends Component {

    static timeformat_(d) {
        const m = Math.floor(d / 60);
        const s = d % 60;
        return `${m}:${(s < 10 ? "0" + s : s)}`
    }

    constructor() {
        super();
        this.noSleep = new NoSleep();

    }

    componentWillMount() {
        this.resetTimer(this.props.store.menuIndex);
        this.makeStopWatch(this.props.store);
    }


    makeStopWatch(store) {
        this.sw = new StopWatch(store.getTitle(),
            store.getDuration(),
            () => {
                this.props.updateStore(this.props.store.setTime(this.sw.toString()));
            },
            () => {
                if (this.props.store.timerIndex + 1 < this.props.store.getTimerList().size) {
                    this.props.updateStore(this.props.store.setTimerIndex(this.props.store.timerIndex + 1));
                    this.makeStopWatch(this.props.store);
                    this.sw.go();
                } else {
                    const synthes = new SpeechSynthesisUtterance("終了です。");
                    synthes.lang = "ja-JP";
                    speechSynthesis.speak(synthes);
                    this.props.updateStore(this.props.store.setFinish(true));
                }
            }
        );
    }

    resetTimer(menuIndex) {
        const store = this.props.store.setMenuIndex(menuIndex);
        this.makeStopWatch(store);
        this.props.updateStore(store.setTime(this.sw.toString()));
    }

    onChange(value) {
        this.sw.pause();
        this.noSleep.disable();
        this.resetTimer(value);
    }

    render() {
        return (
            <div>
                <DropDownMenu value={this.props.store.menuIndex}
                              onChange={(event, index, value) => this.onChange(value)}>
                    {DataStore.timerMenu.toKeyedSeq().map((e, i) =>
                        <MenuItem value={i} key={i} primaryText={e.get('name')}/>).toArray()}
                </DropDownMenu>
                <List>
                    {this.props.store.getTimerList().toKeyedSeq().map((e, i) =>
                        <ListItem
                            disabled={true}
                            className="timer-list"
                            primaryText={
                                `${e.get('title')} (${GameTimer.timeformat_(e.get('duration'))})`
                            }
                            key={i}
                            data-is-current={i === this.props.store.timerIndex}
                            rightIcon={i === this.props.store.timerIndex ? <ImageTimer/> :
                                <ImageTimerOff/>}/>).toArray()
                    }
                    <Divider/>
                    <div className="time-display" data-is-finish={this.props.store.finish}>
                        <code>{this.props.store.time} </code></div>
                    <Divider/>
                    <ListItem disabled={true}>
                        <div>
                            {
                                this.props.store.finish ? "" :
                                    <RaisedButton label={this.props.store.label}
                                                  icon={this.props.store.running ? <AvPause/> : <AvPlayArrow/> }
                                                  onClick={() => {
                                                      this.noSleep.enable();
                                                      if ([SWState.BEFORE_START, SWState.SUSPEND].includes(this.sw.getSWState())) {
                                                          this.sw.go();
                                                          this.props.updateStore(this.props.store.setLabel("Pause").setRunning(true));
                                                      } else {
                                                          this.sw.pause();
                                                          this.props.updateStore(this.props.store.setLabel("Go").setRunning(false));
                                                      }
                                                  }}/>
                            }
                            <RaisedButton label="Reset" secondary={true} onClick={() => {
                                this.resetTimer(this.props.store.menuIndex);
                            }}/>
                        </div>
                    </ListItem>
                    <Divider />
                </List>
            </div>
        )
    }
}

const initialState = new DataStore();


const updateStore = createAction("UPDATE_MODEL");

const reducer = handleActions({
        [updateStore]: (state, action) => action.payload,
    },
    initialState
);


const store = createStore(reducer);


function mapStateToProps(state, props) {
    return {store: state}
}


function mapDispatchToProps(dispatch, props) {
    return {
        updateStore: function (m) {
            dispatch(updateStore(m))
        }
    }

}


class App extends Component {
    render() {
        const DApp = connect(mapStateToProps, mapDispatchToProps)(GameTimer);
        return (
            <MuiThemeProvider>
                <Provider store={store}>
                    <DApp time={4}/>
                </Provider>
            </MuiThemeProvider>
        );
    }
}

export default App;
