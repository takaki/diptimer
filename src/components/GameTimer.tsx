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

const noSleep = new nosleepJs();

export class GameTimer extends React.Component<IGameTimerProps> {
  public componentDidMount() {
    onChange(this.props)(this.props.dataStore.menuIndex);
  }

  public render() {
    // React.useLayoutEffect()
    return (
      <div>
        {selectMenu(onMenuSelect(this.props), this.props.dataStore)}
        <List>
          {timerListItem(this.props.dataStore)}
          <Divider />
          {timeDisplay(this.props.dataStore)}
          {controlButtons(
            onPlayClick(this.props),
            onResetClick(this.props),
            this.props.dataStore
          )}
        </List>
      </div>
    );
  }
}

const onChange = (props: IGameTimerProps) => (menuIndex: number): void => {
  const onTick = (sw: StopWatch) => {
    if (remainTime.seconds(sw.remainTime()) < sw.firstCheckPoint()) {
      const synthes = new SpeechSynthesisUtterance(
        remainTime.toLeftString(sw.remainTime())
      );
      synthes.lang = "ja-JP";
      synthes.rate = 1.2;
      speechSynthesis.speak(synthes);
      sw.shiftCheckPoints();
    }
    props.setRemainTime(remainTime.format(sw.remainTime()));
  };
  const onFinish = (sw: StopWatch) => {
    if (isTimerLeft(props.dataStore)) {
      props.setNextTimer();
      props.newStopWatch(onTick, onFinish);
      props.dataStore.sw.go();
    } else {
      const synthes = new SpeechSynthesisUtterance("終了です。");
      synthes.lang = "ja-JP";
      speechSynthesis.speak(synthes);
      props.setFinish();
    }
  };
  props.dataStore.sw.pause();
  noSleep.disable();
  props.setMenuIndex(menuIndex);
  props.newStopWatch(onTick, onFinish);
};

const onPlayClick = (props: IGameTimerProps) => (): void => {
  noSleep.enable();
  if (props.dataStore.sw.canRun()) {
    props.dataStore.sw.go();
    props.execPause();
  } else {
    props.dataStore.sw.pause();
    props.execGo();
  }
};

const onResetClick = (props: IGameTimerProps) => (): void =>
  onChange(props)(props.dataStore.menuIndex);

const onMenuSelect = (props: IGameTimerProps) => (ev: React.ChangeEvent<any>) =>
  onChange(props)(parseInt(ev.target.value, 10));

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
  onPlayClick0: () => void,
  onResetClick0: () => void,
  self: IDataStore
): JSX.Element => (
  <div className="control-buttons">
    {self.finish ? (
      ""
    ) : (
      <Button variant="contained" className="button" onClick={onPlayClick0}>
        {self.running ? <Pause /> : <PlayArrow />}
        {self.label}
      </Button>
    )}
    <Button
      variant="contained"
      className="button"
      color="secondary"
      onClick={onResetClick0}
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
  onMenuSelect0: (ev: React.ChangeEvent<any>) => void,
  self: IDataStore
): JSX.Element => (
  <Select value={self.menuIndex} onChange={onMenuSelect0}>
    {self.timerMenu.menuEntries
      .map((e: IMenuEntry) => e.name)
      .map((n, i) => (
        <MenuItem value={i} key={n}>
          {n}
        </MenuItem>
      ))}
  </Select>
);
