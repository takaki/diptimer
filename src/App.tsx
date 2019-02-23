/* tslint:disable:jsx-no-multiline-js */
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
import { connect, Provider } from "react-redux";
import { createStore, Dispatch } from "redux";
import "./App.css";
import { DataStore } from "./model/data_store";
import { StopWatch } from "./model/model";
import { TimerEntry } from "./model/timer_entry";

const theme = createMuiTheme();

class GameTimer extends Component<IProps> {

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
        const store = this.props.dataStore.setMenuIndex(menuIndex).setLabel("Go").setRunning(false);
        this.prepareSW(store, onTick, onFinish);
        this.props.updateStore(store);
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

// constants
const UPDATE_MODEL = "UPDATE_MODEL";
type UPDATE_MODEL = typeof UPDATE_MODEL;

// actions
interface IUpdateModel {
    type: UPDATE_MODEL;
    dataStore: DataStore;
}

type ModelAction = IUpdateModel;

function updateModel(dataStore: DataStore): IUpdateModel {
    return {
        type: UPDATE_MODEL,
        dataStore,
    };
}

// reducer
function modelReducer(state: DataStore, action: ModelAction): DataStore {
    switch (action.type) {
        case UPDATE_MODEL:
            return action.dataStore;
        default:
            return state;
    }
}

// container
interface IProps {
    dataStore: DataStore;
    updateStore: (d: DataStore) => void;
}

function mapStateToProps(state: DataStore) {
    return {dataStore: state};
}

function mapDispatchToProps(dispatch: Dispatch<ModelAction>) {
    return {
        updateStore: (dataStore: DataStore) => dispatch(updateModel(dataStore)),
    };
}

// @ts-ignore
const store = createStore<DataStore>(modelReducer, new DataStore());

const DApp = connect(mapStateToProps, mapDispatchToProps)(GameTimer);

// tslint:disable-next-line
class App extends Component {
    public render() {
        return (
            <Provider store={store}>
                <DApp/>
            </Provider>);
    }
}

export default App;
