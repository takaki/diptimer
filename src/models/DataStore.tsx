import {
  Button,
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText
} from "@material-ui/core";
import { Pause, PlayArrow, Timer, TimerOff } from "@material-ui/icons";
import { empty, lookup } from "fp-ts/lib/Array";
import { Range, Record } from "immutable";
import printf from "printf";
import * as React from "react";
import { StopWatch } from "./StopWatch";
import { defaultTimerEntry, ITimerEntry } from "./TimerEntry";
import { ITimerMenu } from "./TimerMenu";

interface IDataStore {
  menuIndex: number;
  timerIndex: number;
  time: string;
  label: string;
  running: boolean;
  finish: boolean;
}

const defaultDataStore: IDataStore = {
  menuIndex: 0,
  timerIndex: 0,
  time: "",
  label: "Go",
  running: false,
  finish: false
};

export class DataStore extends Record(defaultDataStore) implements IDataStore {
  public getTimer(timerMenu: ITimerMenu): ITimerEntry {
    return lookup(this.menuIndex, timerMenu.menuEntries)
      .chain(a => lookup(this.timerIndex, a.timers))
      .getOrElse(defaultTimerEntry);
  }

  public getTitle(timerMenu: ITimerMenu) {
    return this.getTimer(timerMenu).title;
  }

  public getDuration(timerMenu: ITimerMenu) {
    return this.getTimer(timerMenu).duration;
  }

  public getCheckPoints(timerMenu: ITimerMenu): number[] {
    return Range(1, 6)
      .concat(Range(10, 60, 10))
      .concat(Range(60, 15 * 60, 60))
      .filter((e: number) => e < this.getDuration(timerMenu))
      .reverse()
      .toArray();
  }

  public isTimerLeft(timerMenu: ITimerMenu) {
    return (
      this.timerIndex + 1 <
      lookup(this.menuIndex, timerMenu.menuEntries)
        .map(a => a.timers.length)
        .getOrElse(0)
    );
  }

  public nextTimer() {
    return this.set("timerIndex", this.timerIndex + 1);
  }

  public timerList(timerMenu: ITimerMenu): JSX.Element[] {
    return lookup(this.menuIndex, timerMenu.menuEntries)
      .map(a =>
        a.timers.map((e: ITimerEntry, i) => (
          <ListItem
            button={true}
            disabled={true}
            className="timer-list"
            data-is-current={i === this.timerIndex}
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
                {i === this.timerIndex ? <Timer /> : <TimerOff />}
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))
      )
      .getOrElse(empty);
  }

  public timeDisplay() {
    return (
      <div className="time-display" data-is-finish={this.finish}>
        <code>{this.time}</code>
      </div>
    );
  }

  public controlButtons(onPlayClick: () => void, onResetClick: () => void) {
    const playButton = this.finish ? (
      ""
    ) : (
      <Button variant="contained" className="button" onClick={onPlayClick}>
        {this.running ? <Pause /> : <PlayArrow />}
        {this.label}
      </Button>
    );
    return (
      <div className="control-buttons">
        {playButton}
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
  }

  public createStopWatch(
    timerMenu: ITimerMenu,
    onTick: (sw: StopWatch) => void,
    onFinish: (sw: StopWatch) => void
  ): StopWatch {
    return new StopWatch(
      this.getTitle(timerMenu),
      this.getDuration(timerMenu),
      this.getCheckPoints(timerMenu),
      onTick,
      onFinish
    );
  }
}
