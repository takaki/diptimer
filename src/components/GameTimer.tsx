import {
    Button,
    createMuiTheme,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    MuiThemeProvider,
    Select,
} from "@material-ui/core";
import { Pause, PlayArrow, Timer, TimerOff } from "@material-ui/icons";
import { Range } from "immutable";
// @ts-ignore
import NoSleep from "nosleep.js";
import printf from "printf";
import React, { Component } from "react";
import { DataStore } from "../models/DataStore";
import { StopWatch } from "../models/StopWatch";
import { TimerEntry } from "../models/TimerEntry";
import { IGameTimerProps } from "../types";

export class GameTimer extends Component<IGameTimerProps> {

    public noSleep: NoSleep;
    public sw: StopWatch;
    public checkpoint: number[];

    constructor(props: any) {
        super(props);
        this.noSleep = new NoSleep();
        this.sw = new StopWatch("dummy", 0);
        this.checkpoint = Array.of();

    }

    public componentWillMount() {
        this.onChange(this.props.dataStore!.menuIndex);
    }

    public onChange(menuIndex: number) {
        const onTick = (sw: StopWatch) => {
            if (sw.remainTime().seconds < this.checkpoint[0]) {
                const synthes = new SpeechSynthesisUtterance(sw.remainTime().toLeftString());
                synthes.lang = "ja-JP";
                synthes.rate = 1.2;
                speechSynthesis.speak(synthes);
                this.checkpoint.shift();
            }
            this.props.updateStore(this.props.dataStore.set("time", sw.remainTimeString()));
        };
        const onFinish = (sw: StopWatch) => {
            if (this.props.dataStore.isTimerLeft()) {
                const store = this.props.dataStore.nextTimer();
                this.prepareSW(store, onTick, onFinish);
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
        this.prepareSW(dataStore, onTick, onFinish);
        this.props.updateStore(dataStore.set("time", this.sw.remainTimeString()));
    }

    public render() {
        return (
            <div>
                <Select value={this.props.dataStore.menuIndex} onChange={this.onMenuSelect}>
                    {this.props.dataStore.getNames().map((n, i) => (<MenuItem value={i} key={n}> {n} </MenuItem>))}
                </Select>
                <List>
                    {this.props.dataStore.getTimerList().map((e: TimerEntry, i) => (
                        <ListItem
                            button={true}
                            disabled={true}
                            className="timer-list"
                            data-is-current={i === this.props.dataStore.timerIndex}
                            key={i}
                        >
                            <ListItemText>
                                {printf("%s %d:%02d", e.title, Math.floor(e.duration / 60), e.duration % 60)}
                            </ListItemText>
                            <ListItemSecondaryAction>
                                <IconButton aria-label="Delete">
                                    {i === this.props.dataStore.timerIndex ? <Timer/> : <TimerOff/>}
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                    <Divider/>

                    <div className="time-display" data-is-finish={this.props.dataStore.finish}>
                        <code>
                            {this.props.dataStore.time}
                        </code>
                    </div>
                    <div className="control-buttons">
                        {this.props.dataStore.finish ? "" : (
                            <Button
                                variant="contained"
                                className="button"
                                onClick={this.onPlayClick}
                            >
                                {this.props.dataStore.running ? <Pause/> : <PlayArrow/>}
                                {this.props.dataStore.label}
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            className="button"
                            color="secondary"
                            onClick={this.onResetClick}
                        >
                            Reset
                        </Button>
                    </div>
                </List>
            </div>
        );
    }

    private prepareSW(store: DataStore, onTick: (sw: StopWatch) => void, onFinish: (sw: StopWatch) => void) {
        this.sw = new StopWatch(store.getTitle(), store.getDuration(), onTick, onFinish);
        this.checkpoint = store.getCheckPoints();
    }

    private onPlayClick = () => {
        this.noSleep.enable();
        if (this.sw.canRun()) {
            this.sw.go();
            this.props.updateStore(this.props.dataStore.merge({label: "Pause", running: true}));
        } else {
            this.sw.pause();
            this.props.updateStore(this.props.dataStore.merge({label: "Go", running: false}));
        }
    }

    private onResetClick = () => {
        this.onChange(this.props.dataStore.menuIndex);
    }

    private onMenuSelect = (ev: React.ChangeEvent<HTMLSelectElement>) => {
        this.onChange(parseInt(ev.target.value, 10));
    }
}
