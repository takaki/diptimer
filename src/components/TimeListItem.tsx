import {
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText
} from "@material-ui/core";
import { Timer, TimerOff } from "@material-ui/icons";
import { empty } from "fp-ts/lib/Array";
import printf from "printf";
import * as React from "react";
import { IDataStore, timerList } from "../models/DataStore";
import { ITimerEntry } from "../models/TimerEntry";

interface ITimerListItemProps {
  dataStore: IDataStore;
}

export const TimerListItem: React.FC<ITimerListItemProps> = (
  props: ITimerListItemProps
) => (
  <div>
    {timerList(props.dataStore)
      .map(a =>
        a.timers.map((e: ITimerEntry, i) => (
          <ListItem
            button={true}
            disabled={true}
            className="timer-list"
            data-is-current={i === props.dataStore.timerIndex}
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
                {i === props.dataStore.timerIndex ? <Timer /> : <TimerOff />}
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))
      )
      .getOrElse(empty)}
  </div>
);
