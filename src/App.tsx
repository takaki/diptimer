import * as React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import './App.css';
import {Divider, DropDownMenu, List, ListItem, MenuItem, RaisedButton} from 'material-ui';
import {AvPause, AvPlayArrow, ImageTimer, ImageTimerOff} from 'material-ui/svg-icons';
import {createStore} from 'redux';
import {createAction, handleActions} from 'redux-actions';
import {connect, Dispatch, Provider} from 'react-redux';
import DataStore, {StopWatch, TimerEntry} from './model';
import Component = React.Component;
import printf = require('printf');

injectTapEventPlugin();

interface GameTimerProps {
    store: DataStore;
    updateStore: (d: DataStore) => void;
}

class GameTimer extends Component<GameTimerProps, undefined> {

    static timeformat_(d: number) {
        const m = Math.floor(d / 60);
        const s = d % 60;
        return `${m}:${(s < 10 ? '0' + s : s)}`;
    }

    timestr(leftTime: number): string {
        if (leftTime <= 0) {
            return '00:00:00';
        }
        const hours = Math.floor(leftTime / 3600);
        const minutes = Math.floor((leftTime % 3600) / 60);
        const seconds = Math.floor(leftTime % 60);
        return printf('%02d:%02d:%02d', hours, minutes, seconds);
    }

    componentWillMount() {
        this.onChange(this.props.store.menuIndex);
    }

    onChange(menuIndex: number) {
        const onTick = (sw: StopWatch) => {
            this.props.updateStore(this.props.store.setTime(this.timestr(sw.left_() / 1000)));
        };
        const onFinish = (sw: StopWatch) => {
            if (this.props.store.isTimerLeft()) {
                const store = this.props.store.nextTimer().setSw(onTick, onFinish);
                this.props.updateStore(store);
                store.sw.go();
            } else {
                const synthes = new SpeechSynthesisUtterance('終了です。');
                synthes.lang = 'ja-JP';
                speechSynthesis.speak(synthes);
                this.props.updateStore(this.props.store.setFinish(true));
            }
        };
        this.props.store.sw.pause();
        this.props.store.noSleep.disable();
        this.props.updateStore(this.props.store.setMenuIndex(menuIndex).setSw(onTick, onFinish));
    }

    render() {
        return (
            <MuiThemeProvider>
                <div>
                    <DropDownMenu value={this.props.store.menuIndex}
                                  onChange={(event, index, value) => this.onChange(value)}>
                        {this.props.store.getNames().toKeyedSeq().map((n, i) =>
                            <MenuItem value={i} key={i} primaryText={n}/>).toArray()}
                    </DropDownMenu>
                    <List>
                        {this.props.store.getTimerList().toKeyedSeq().map((e: TimerEntry, i) => (
                            <ListItem
                                disabled={true}
                                className="timer-list"
                                primaryText={`${e.get('title')} (${GameTimer.timeformat_(e.get('duration'))})`}
                                key={i}
                                data-is-current={i === this.props.store.timerIndex}
                                rightIcon={i === this.props.store.timerIndex ? <ImageTimer/> :
                                    <ImageTimerOff/>}/>
                        )).toArray()}
                        <Divider/>
                        <div className="time-display" data-is-finish={this.props.store.finish}>
                            <code>{this.timestr(this.props.store.getTime() / 1000)} </code></div>
                        <div className="control-buttons">
                            {this.props.store.finish ? '' : (
                                <RaisedButton label={this.props.store.label}
                                              className="button"
                                              icon={this.props.store.running ? <AvPause/> :
                                                  <AvPlayArrow/> }
                                              onClick={() => {
                                                  this.props.store.noSleep.enable();
                                                  this.props.updateStore(this.props.store.toggleSwitch());
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