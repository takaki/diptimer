import { Divider, List } from "@material-ui/core";
// @ts-ignore
// noinspection TypeScriptCheckImport,TypeScriptCheckImport
import nosleepJs from "nosleep.js";
import * as React from "react";
import { isTimerLeft } from "../models/DataStore";
import { remainTime } from "../models/RemainTime";
import { StopWatch } from "../models/StopWatch";
import { IGameTimerProps } from "../types";
import { ControlButtons } from "./ControlButtons";
import { SelectMenu } from "./SelectMenu";
import { TimeDisplay } from "./TimeDisplay";
import { TimerListItem } from "./TimeListItem";

const noSleep = new nosleepJs();

export const GameTimer: React.FC<IGameTimerProps> = (
  props: IGameTimerProps
) => {
  // eslint-disable-next-line
  React.useEffect(() => onChange(props)(props.dataStore.menuIndex), []);
  return (
    <div>
      <SelectMenu
        menuEntries={props.dataStore.timerMenu.menuEntries}
        menuIndex={props.dataStore.menuIndex}
        onMenuSelect={onMenuSelect(props)}
      />
      <List>
        <TimerListItem dataStore={props.dataStore} />
        <Divider />
        <TimeDisplay
          finish={props.dataStore.finish}
          time={props.dataStore.time}
        />
        <ControlButtons
          finish={props.dataStore.finish}
          label={props.dataStore.label}
          running={props.dataStore.running}
          onPlayClick={onPlayClick(props)}
          onResetClick={onResetClick(props)}
        />
      </List>
    </div>
  );
};

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
