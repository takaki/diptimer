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
import { StopWatch } from "../models/model";
import { TimerEntry } from "../models/TimerEntry";
import { IGameTimerProps } from "../types";

const theme = createMuiTheme();

export class GameTimer extends Component<IGameTimerProps> {

    public static timeformat_(d: number) {
        return printf("%d:%02d", Math.floor(d / 60), d % 60);
    }

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
            if (sw.leftmsec().seconds < this.checkpoint[0]) {
                const synthes = new SpeechSynthesisUtterance(sw.leftmsec().toLeftString_());
                synthes.lang = "ja-JP";
                synthes.rate = 1.2;
                speechSynthesis.speak(synthes);
                this.checkpoint.shift();
            }
            this.props.updateStore(this.props.dataStore.setTime(sw.leftmsec().timestr()));
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
                this.props.updateStore(this.props.dataStore.setFinish(true));
            }
        };
        this.sw.pause();
        this.noSleep.disable();
        const dataStore = this.props.dataStore.setMenuIndex(menuIndex).setLabel("Go").setRunning(false);
        this.prepareSW(dataStore, onTick, onFinish);
        this.props.updateStore(dataStore);
    }

    public render() {
        return (
            <MuiThemeProvider theme={theme}>
                <div>
                    <Select
                        value={this.props.dataStore.menuIndex}
                        onChange={(ev) => {
                            this.onChange(parseInt(ev.target.value, 10));
                        }}
                    >
                        {
                            this.props.dataStore.getNames().map((n, i) => (
                                <MenuItem value={i} key={n}>
                                    {n}
                                </MenuItem>
                            ))}
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
                                {this.sw.leftmsec().timestr()} </code></div>
                        <div className="control-buttons">
                            {this.props.dataStore.finish ? "" : (
                                <Button
                                    variant="contained"
                                    className="button"
                                    onClick={() => {
                                        this.noSleep.enable();
                                        if (this.sw.canRun()) {
                                            this.sw.go();
                                            this.props.updateStore(this.props.dataStore.setLabel("Pause")
                                                .setRunning(true));
                                        } else {
                                            this.sw.pause();
                                            this.props.updateStore(this.props.dataStore.setLabel("Go")
                                                .setRunning(false));
                                        }
                                    }}>
                                    {this.props.dataStore.running ? <Pause/> : <PlayArrow/>}
                                    {this.props.dataStore.label}
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                className="button"
                                color="secondary"
                                onClick={() => {
                                    this.onChange(this.props.dataStore.menuIndex);
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </List>
                </div>
            </MuiThemeProvider>
        );
    }

    private prepareSW(store: DataStore, onTick: (sw: StopWatch) => void, onFinish: (sw: StopWatch) => void) {
        this.sw = new StopWatch(store.getTitle(), store.getDuration(), onTick, onFinish);
        this.checkpoint = Range(1, 6).concat(Range(10, 60, 10)).concat(Range(60, 15 * 60, 60))
            .filter((element: number) => element < store.getDuration()).reverse().toArray();
    }
}
