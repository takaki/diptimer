import injectTapEventPlugin from "react-tap-event-plugin";
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
import DataStore from "./model";
injectTapEventPlugin();


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
        this.onChange(this.props.store.menuIndex);
    }

    onChange(menuIndex) {
        const onTick = () => {
            this.props.updateStore(this.props.store.setTime(this.props.store.sw.toString()));
        };
        const onFinish = () => {
            if (this.props.store.timerIndex + 1 < this.props.store.getTimerList().size) {
                const store = this.props.store.setTimerIndex(this.props.store.timerIndex + 1).setSw(onTick, onFinish);
                this.props.updateStore(store);
                store.sw.go();
            } else {
                const synthes = new SpeechSynthesisUtterance("終了です。");
                synthes.lang = "ja-JP";
                speechSynthesis.speak(synthes);
                this.props.updateStore(this.props.store.setFinish(true));
            }
        };
        this.props.store.sw.pause();
        this.noSleep.disable();
        this.props.updateStore(this.props.store.setMenuIndex(menuIndex).setSw(onTick, onFinish));
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
                        <code>{this.props.store.getTime()} </code></div>
                    <Divider/>
                    <ListItem disabled={true}>
                        <div>
                            {
                                this.props.store.finish ? "" :
                                    <RaisedButton label={this.props.store.label}
                                                  icon={this.props.store.running ? <AvPause/> : <AvPlayArrow/> }
                                                  onClick={() => {
                                                      this.noSleep.enable();
                                                      this.props.updateStore(this.props.store.toggleSwitch());
                                                  }}/>
                            }
                            <RaisedButton label="Reset" secondary={true} onClick={() => {
                                this.onChange(this.props.store.menuIndex);
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
