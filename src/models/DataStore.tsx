import { Button, IconButton, ListItem, ListItemSecondaryAction, ListItemText } from "@material-ui/core";
import { Pause, PlayArrow, Timer, TimerOff } from "@material-ui/icons";
import { List, Range, Record } from "immutable";
import printf from "printf";
import React from "react";
import { TimerEntry } from "./TimerEntry";
import { TimerMenu } from "./TimerMenu";
import { StopWatch } from "./StopWatch";

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
    finish: false,
};

export class DataStore extends Record(defaultDataStore) implements IDataStore {

    public getTimerList(timerMenu: TimerMenu): List<TimerEntry> {
        return timerMenu.menuEntries.get(this.menuIndex)!.timers;
    }

    public getTimer(timerMenu: TimerMenu) {
        return timerMenu.menuEntries.get(this.menuIndex)!.timers.get(this.timerIndex);
    }

    public getTitle(timerMenu: TimerMenu) {
        return this.getTimer(timerMenu)!.get("title");
    }

    public getDuration(timerMenu: TimerMenu) {
        return this.getTimer(timerMenu)!.get("duration");
    }

    public getCheckPoints(timerMenu: TimerMenu): number[] {
        return Range(1, 6).concat(Range(10, 60, 10)).concat(Range(60, 15 * 60, 60))
            .filter((e: number) => e < timerMenu.menuEntries.get(this.menuIndex)!.timers.get(this.timerIndex)!.duration)
            .reverse().toArray();
    }

    public isTimerLeft(timerMenu: TimerMenu) {
        return this.timerIndex + 1 < timerMenu.menuEntries.get(this.menuIndex)!.timers.size;
    }

    public nextTimer() {
        return this.set("timerIndex", this.timerIndex + 1);
    }

    public timerList(timerMenu: TimerMenu) {
        return timerMenu.menuEntries.get(this.menuIndex)!.timers.map((e: TimerEntry, i) => (
            <ListItem
                button={true}
                disabled={true}
                className="timer-list"
                data-is-current={i === this.timerIndex}
                key={i}
            >
                <ListItemText>
                    {printf("%s %d:%02d", e.title, Math.floor(e.duration / 60), e.duration % 60)}
                </ListItemText>
                <ListItemSecondaryAction>
                    <IconButton aria-label="Delete">
                        {i === this.timerIndex ? <Timer/> : <TimerOff/>}
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        ));
    }

    public timeDisplay() {
        return (
            <div className="time-display" data-is-finish={this.finish}>
                <code>
                    {this.time}
                </code>
            </div>
        );
    }

    public controlButtons(onPlayClick: () => void, onResetClick: () => void) {
        const playButton = this.finish ? "" : (
            <Button
                variant="contained"
                className="button"
                onClick={onPlayClick}
            >
                {this.running ? <Pause/> : <PlayArrow/>}
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
            </div>);
    }

    public createStopWatch(timerMenu: TimerMenu,
                           onTick: (sw: StopWatch) => void,
                           onFinish: (sw: StopWatch) => void): StopWatch {
        return new StopWatch(this.getTitle(timerMenu),
            this.getDuration(timerMenu),
            this.getCheckPoints(timerMenu),
            onTick,
            onFinish);
    }

}
