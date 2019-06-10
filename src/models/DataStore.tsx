import {
  Button,
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText
} from "@material-ui/core";
import { Pause, PlayArrow, Timer, TimerOff } from "@material-ui/icons";
import { array, empty, lookup, range, reverse } from "fp-ts/lib/Array";
import { concat } from "fp-ts/lib/function";
import { Lens } from "monocle-ts";
import printf from "printf";
import * as React from "react";
import { StopWatch } from "./StopWatch";
import { defaultTimerEntry, ITimerEntry } from "./TimerEntry";
import { ITimerMenu } from "./TimerMenu";

export interface IDataStore {
  menuIndex: number;
  timerIndex: number;
  time: string;
  label: string;
  running: boolean;
  finish: boolean;
}

const timerIndex = Lens.fromProp<IDataStore>()("timerIndex");

export const defaultDataStore: IDataStore = {
  menuIndex: 0,
  timerIndex: 0,
  time: "",
  label: "Go",
  running: false,
  finish: false
};

export function getTimer(timerMenu: ITimerMenu, self: IDataStore): ITimerEntry {
  return lookup(self.menuIndex, timerMenu.menuEntries)
    .chain(a => lookup(self.timerIndex, a.timers))
    .getOrElse(defaultTimerEntry);
}

export function getTitle(timerMenu: ITimerMenu, self: IDataStore) {
  return getTimer(timerMenu, self).title;
}

export function getDuration(timerMenu: ITimerMenu, self: IDataStore) {
  return getTimer(timerMenu, self).duration;
}

export function getCheckPoints(
  timerMenu: ITimerMenu,
  self: IDataStore
): number[] {
  // const z = array.foldMap(getMonoid<number>())(
  //   [[1, 2, 3], [4, 5, 6]],
  //   identity
  // );

  return reverse(
    array.filter(
      concat(
        concat(range(1, 6), range(1, 6).map(i => i * 10)),
        range(1, 15).map(i => i * 60)
      ),
      e => e < getDuration(timerMenu, self)
    )
  );
}

export function isTimerLeft(timerMenu: ITimerMenu, self: IDataStore) {
  return (
    self.timerIndex + 1 <
    lookup(self.menuIndex, timerMenu.menuEntries)
      .map(a => a.timers.length)
      .getOrElse(0)
  );
}

export function nextTimer(self: IDataStore): IDataStore {
  return timerIndex.modify(a => a + 1)(self);
}

export function timerList(
  timerMenu: ITimerMenu,
  self: IDataStore
): JSX.Element[] {
  return lookup(self.menuIndex, timerMenu.menuEntries)
    .map(a =>
      a.timers.map((e: ITimerEntry, i) => (
        <ListItem
          button={true}
          disabled={true}
          className="timer-list"
          data-is-current={i === self.timerIndex}
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
              {i === self.timerIndex ? <Timer /> : <TimerOff />}
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))
    )
    .getOrElse(empty);
}

export function timeDisplay(self: IDataStore) {
  return (
    <div className="time-display" data-is-finish={self.finish}>
      <code>{self.time}</code>
    </div>
  );
}

export function controlButtons(
  onPlayClick: () => void,
  onResetClick: () => void,
  self: IDataStore
) {
  const playButton = self.finish ? (
    ""
  ) : (
    <Button variant="contained" className="button" onClick={onPlayClick}>
      {self.running ? <Pause /> : <PlayArrow />}
      {self.label}
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

export function createStopWatch(
  timerMenu: ITimerMenu,
  onTick: (sw: StopWatch) => void,
  onFinish: (sw: StopWatch) => void,
  self: IDataStore
): StopWatch {
  return new StopWatch(
    getTitle(timerMenu, self),
    getDuration(timerMenu, self),
    getCheckPoints(timerMenu, self),
    onTick,
    onFinish
  );
}
