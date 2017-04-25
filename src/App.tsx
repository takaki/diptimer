import * as React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import './App.css';
import {Divider, DropDownMenu, List, ListItem, MenuItem, RaisedButton} from 'material-ui';
import {AvPause, AvPlayArrow, ImageTimer, ImageTimerOff} from 'material-ui/svg-icons';
import {createStore} from 'redux';
import {createAction, handleActions} from 'redux-actions';
import {connect, Dispatch, Provider} from 'react-redux';
import {DataStore, StopWatch, TimerEntry} from './model';
import NoSleep from './nosleep';
import Component = React.Component;
import printf = require('printf');
import {Range} from 'immutable';

injectTapEventPlugin();

interface GameTimerProps {
    store: DataStore;
    updateStore: (d: DataStore) => void;
}

class GameTimer extends Component<GameTimerProps, undefined> {
    noSleep: NoSleep;
    sw: StopWatch;
    checkpoint: Array<number>;

    static timeformat_(d: number) {
        return printf('%d:%02d', Math.floor(d / 60), d % 60);
    }

    constructor() {
        super();
        this.noSleep = new NoSleep();
        this.sw = new StopWatch('dummy', 0);
    }

    timestr(leftTime: number): string {
        if (leftTime <= 0) {
            return '00:00:00';
        }
        return printf('%02d:%02d:%02d',
                      Math.floor(leftTime / 3600),
                      Math.floor((leftTime % 3600) / 60),
                      Math.floor(leftTime % 60));
    }

    componentWillMount() {
        this.onChange(this.props.store.menuIndex);
    }

    toLeftString_(left: number): string {
        const totalSeconds = Math.ceil(left / 1000);
        if (totalSeconds < 10) {
            return totalSeconds.toString();
        } else {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = Math.floor(totalSeconds % 60);
            return `残り${(hours > 0 ? hours + '時間' : '')}
        ${(minutes > 0 ? minutes + '分' : '')}
        ${(seconds > 0 ? seconds + '秒' : '')}
        です`;
        }
    }

    onChange(menuIndex: number) {
        const onTick = (sw: StopWatch) => {
            if (sw.leftmsec() / 1000 < this.checkpoint[0]) {
                const synthes = new SpeechSynthesisUtterance(this.toLeftString_(sw.leftmsec()));
                synthes.lang = 'ja-JP';
                synthes.rate = 1.2;
                speechSynthesis.speak(synthes);
                this.checkpoint.shift();
            }
            this.props.updateStore(this.props.store.setTime(this.timestr(sw.leftmsec() / 1000)));
        };
        const onFinish = (sw: StopWatch) => {
            if (this.props.store.isTimerLeft()) {
                const store = this.props.store.nextTimer();
                this.prepareSW(store, onTick, onFinish);
                this.props.updateStore(store);
                this.sw.go();
            } else {
                const synthes = new SpeechSynthesisUtterance('終了です。');
                synthes.lang = 'ja-JP';
                speechSynthesis.speak(synthes);
                this.props.updateStore(this.props.store.setFinish(true));
            }
        };
        this.sw.pause();
        this.noSleep.disable();
        const store = this.props.store.setMenuIndex(menuIndex).setLabel('Go').setRunning(false);
        this.prepareSW(store, onTick, onFinish);
        this.props.updateStore(store);
    }

    render() {
        return (
            <MuiThemeProvider>
                <div>
                    <DropDownMenu value={this.props.store.menuIndex}
                                  onChange={(event, index, value) => this.onChange(value)}>
                        {this.props.store.getNames().toKeyedSeq().map((n, i) => (
                            <MenuItem value={i} key={i}
                                      primaryText={n}/>)).toArray()}
                    </DropDownMenu>
                    <List>
                        {this.props.store.getTimerList().toKeyedSeq().map((e: TimerEntry, i) => (
                            <ListItem
                                disabled={true}
                                className="timer-list"
                                primaryText={printf(
                                    '%s %d:%02d', e.title, Math.floor(e.duration / 60),
                                    e.duration % 60)}
                                key={i}
                                data-is-current={i === this.props.store.timerIndex}
                                rightIcon={i === this.props.store.timerIndex ? <ImageTimer/> :
                                    <ImageTimerOff/>}/>
                        )).toArray()}
                        <Divider/>
                        <div className="time-display" data-is-finish={this.props.store.finish}>
                            <code>{this.timestr(this.sw.leftmsec() / 1000)} </code></div>
                        <div className="control-buttons">
                            {this.props.store.finish ? '' : (
                                <RaisedButton label={this.props.store.label}
                                              className="button"
                                              icon={this.props.store.running ? <AvPause/> :
                                                  <AvPlayArrow/> }
                                              onClick={() => {
                                                  this.noSleep.enable();
                                                  if (this.sw.canRun()) {
                                                      this.sw.go();
                                                      this.props.updateStore(this.props.store.setLabel('Pause')
                                                                                 .setRunning(true));
                                                  } else {
                                                      this.sw.pause();
                                                      this.props.updateStore(this.props.store.setLabel('Go')
                                                                                 .setRunning(false));
                                                  }
                                              }}/>
                            )}
                            <RaisedButton className="button" label="Reset" secondary={true} onClick={() => {
                                this.onChange(this.props.store.menuIndex);
                            }}/>
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

const initialState = new DataStore();

const updateStore = createAction('UPDATE_MODEL');

const reducer = handleActions<DataStore>(
    {
        ['UPDATE_MODEL']: (state, action) => action.payload,
    },
    initialState
);

const store = createStore(reducer);

function mapStateToProps(state: DataStore) {
    return {store: state};
}

function mapDispatchToProps(dispatch: Dispatch<DataStore>) {
    return {
        updateStore: function (m: DataStore) {
            dispatch(updateStore(m));
        }
    };
}

interface AppProps {
}

class App extends Component<AppProps, undefined> {
    render() {
        const DApp = connect(mapStateToProps, mapDispatchToProps)(GameTimer);
        return (
            <Provider store={store}>
                <DApp />
            </Provider>);
    }
}

export default App;