import {
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Select
} from "@material-ui/core";
import { Pause, PlayArrow, Timer, TimerOff } from "@material-ui/icons";
import { empty } from "fp-ts/lib/Array";
// @ts-ignore
// noinspection TypeScriptCheckImport,TypeScriptCheckImport
import nosleepJs from "nosleep.js";
import printf from "printf";
import * as React from "react";
import { IDataStore, isTimerLeft, timerList } from "../models/DataStore";
import { IMenuEntry } from "../models/MenuEntry";
import { remainTime } from "../models/RemainTime";
import { StopWatch } from "../models/StopWatch";
import { ITimerEntry } from "../models/TimerEntry";
import { IGameTimerProps } from "../types";

export class GameTimer extends React.Component<IGameTimerProps> {
  private noSleep = new nosleepJs();

  public componentDidMount() {
    this.onChange(this.props.dataStore.menuIndex);
  }

  public render() {
    // React.useLayoutEffect()
    return (
      <div>
        {selectMenu(this.onMenuSelect, this.props.dataStore)}
        <List>
          {timerListItem(this.props.dataStore)}
          <Divider />
          {timeDisplay(this.props.dataStore)}
          {controlButtons(
            this.onPlayClick,
            this.onResetClick,
            this.props.dataStore
          )}
        </List>
      </div>
    );
  }

  private onChange(menuIndex: number) {
    const onTick = (sw: StopWatch) => {
      if (remainTime.seconds(sw.remainTime()) < sw.checkPoints[0]) {
        const synthes = new SpeechSynthesisUtterance(
          remainTime.toLeftString(sw.remainTime())
        );
        synthes.lang = "ja-JP";
        synthes.rate = 1.2;
        speechSynthesis.speak(synthes);
        sw.checkPoints.shift();
      }
      this.props.setRemainTime(remainTime.format(sw.remainTime()));
    };
    const onFinish = (sw: StopWatch) => {
      if (isTimerLeft(this.props.dataStore)) {
        this.props.setNextTimer();
        this.props.newStopWatch(onTick, onFinish);
        this.props.dataStore.sw.go();
      } else {
        const synthes = new SpeechSynthesisUtterance("終了です。");
        synthes.lang = "ja-JP";
        speechSynthesis.speak(synthes);
        this.props.setFinish();
      }
    };
    this.props.dataStore.sw.pause();
    this.noSleep.disable();
    this.props.setMenuIndex(menuIndex);
    this.props.newStopWatch(onTick, onFinish);
  }

  private onPlayClick = () => {
    this.noSleep.enable();
    if (this.props.dataStore.sw.canRun()) {
      this.props.dataStore.sw.go();
      this.props.execPause();
    } else {
      this.props.dataStore.sw.pause();
      this.props.execGo();
    }
  };

  private onResetClick = () => this.onChange(this.props.dataStore.menuIndex);

  private onMenuSelect = (ev: React.ChangeEvent<any>) =>
    this.onChange(parseInt(ev.target.value, 10));
}

const timerListItem = (dataStore: IDataStore): JSX.Element[] =>
  timerList(dataStore)
    .map(a =>
      a.timers.map((e: ITimerEntry, i) => (
        <ListItem
          button={true}
          disabled={true}
          className="timer-list"
          data-is-current={i === dataStore.timerIndex}
          key={i}
        >
          <ListItemText>
            {printf(
              "%s %d:%02d",
              e.title,
              Math.floor(e.duration / 60),
              e.duration % 60
            )}
          </ListItemText>
          <ListItemSecondaryAction>
            <IconButton aria-label="Delete">
              {i === dataStore.timerIndex ? <Timer /> : <TimerOff />}
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))
    )
    .getOrElse(empty);

const controlButtons = (
  onPlayClick: () => void,
  onResetClick: () => void,
  self: IDataStore
): JSX.Element => (
  <div className="control-buttons">
    {self.finish ? (
      ""
    ) : (
      <Button variant="contained" className="button" onClick={onPlayClick}>
        {self.running ? <Pause /> : <PlayArrow />}
        {self.label}
      </Button>
    )}
    <Button
      variant="contained"
      className="button"
      color="secondary"
      onClick={onResetClick}
    >
      Reset
    </Button>
  </div>
);

const timeDisplay = (self: IDataStore): JSX.Element => (
  <div className="time-display" data-is-finish={self.finish}>
    <code>{self.time}</code>
  </div>
);

const selectMenu = (
  onMenuSelect: (ev: React.ChangeEvent<any>) => void,
  self: IDataStore
): JSX.Element => (
  <Select value={self.menuIndex} onChange={onMenuSelect}>
    {self.timerMenu.menuEntries
      .map((e: IMenuEntry) => e.name)
      .map((n, i) => (
        <MenuItem value={i} key={n}>
          {n}
        </MenuItem>
      ))}
  </Select>
);
