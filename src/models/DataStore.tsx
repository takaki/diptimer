import {
  Button,
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText
} from "@material-ui/core";
import { Pause, PlayArrow, Timer, TimerOff } from "@material-ui/icons";
import { empty, lookup } from "fp-ts/lib/Array";
import { Lens } from "monocle-ts";
import printf from "printf";
import * as React from "react";
import { StopWatch } from "./StopWatch";
import { ITimerEntry } from "./TimerEntry";
import * as TM from "./TimerMenu";

export interface IDataStore {
  menuIndex: number;
  timerIndex: number;
  timerMenu: TM.ITimerMenu;
  time: string;
  label: string;
  running: boolean;
  finish: boolean;
}

const timerIndex = Lens.fromProp<IDataStore>()("timerIndex");

export const defaultDataStore: IDataStore = {
  menuIndex: 0,
  timerIndex: 0,
  timerMenu: TM.defaultTimerMenu,
  time: "",
  label: "Go",
  running: false,
  finish: false
};

export const isTimerLeft = (self: IDataStore): boolean =>
  lookup(self.menuIndex, self.timerMenu.menuEntries)
    .map(a => self.timerIndex + 1 < a.timers.length)
    .getOrElse(false);

export const nextTimer = (self: IDataStore): IDataStore =>
  timerIndex.modify(a => a + 1)(self);

export const timerList = (self: IDataStore): JSX.Element[] =>
  lookup(self.menuIndex, self.timerMenu.menuEntries)
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
  onTick: (sw: StopWatch) => void,
  onFinish: (sw: StopWatch) => void,
  self: IDataStore
): StopWatch =>
  new StopWatch(getTitle(self), getDuration(self), onTick, onFinish);

export const selectMenu = (
  onMenuSelect: (ev: React.ChangeEvent<any>) => void,
  self: IDataStore
): JSX.Element => TM.selectMenu(self.menuIndex, onMenuSelect, self.timerMenu);

const getTimer = (self: IDataStore): ITimerEntry =>
  TM.getTimer(self.menuIndex, self.timerIndex, self.timerMenu);

const getTitle = (self: IDataStore): string => getTimer(self).title;

const getDuration = (self: IDataStore): number => getTimer(self).duration;
