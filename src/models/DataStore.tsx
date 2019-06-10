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

export const getTimer = (
  timerMenu: ITimerMenu,
  self: IDataStore
): ITimerEntry =>
  lookup(self.menuIndex, timerMenu.menuEntries)
    .chain(a => lookup(self.timerIndex, a.timers))
    .getOrElse(defaultTimerEntry);

export const getTitle = (timerMenu: ITimerMenu, self: IDataStore): string =>
  getTimer(timerMenu, self).title;

export const getDuration = (timerMenu: ITimerMenu, self: IDataStore): number =>
  getTimer(timerMenu, self).duration;

export const getCheckPoints = (
  timerMenu: ITimerMenu,
  self: IDataStore
): number[] => {
  return reverse(
    array.filter(
      array.reduce(
        [
          range(1, 6),
          range(1, 6).map(i => i * 10),
          range(1, 15).map(i => i * 60)
        ],
        [] as number[],
        concat
      ),
      e => e < getDuration(timerMenu, self)
    )
  );
};

export const isTimerLeft = (timerMenu: ITimerMenu, self: IDataStore): boolean =>
  self.timerIndex + 1 <
  lookup(self.menuIndex, timerMenu.menuEntries)
    .map(a => a.timers.length)
    .getOrElse(0);

export const nextTimer = (self: IDataStore): IDataStore =>
  timerIndex.modify(a => a + 1)(self);

export const timerList = (
  timerMenu: ITimerMenu,
  self: IDataStore
): JSX.Element[] =>
  lookup(self.menuIndex, timerMenu.menuEntries)
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

export const timeDisplay = (self: IDataStore): JSX.Element => (
  <div className="time-display" data-is-finish={self.finish}>
    <code>{self.time}</code>
  </div>
);

export const controlButtons = (
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

export const createStopWatch = (
  timerMenu: ITimerMenu,
  onTick: (sw: StopWatch) => void,
  onFinish: (sw: StopWatch) => void,
  self: IDataStore
): StopWatch => new StopWatch(
  getTitle(timerMenu, self),
  getDuration(timerMenu, self),
  getCheckPoints(timerMenu, self),
  onTick,
  onFinish
);
