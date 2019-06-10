import { Divider, List } from "@material-ui/core";
// @ts-ignore
// noinspection TypeScriptCheckImport,TypeScriptCheckImport
import nosleepJs from "nosleep.js";
import * as React from "react";
import {
  controlButtons,
  createStopWatch,
  isTimerLeft,
  nextTimer,
  timeDisplay,
  timerList
} from "../models/DataStore";
import { StopWatch } from "../models/StopWatch";
import { defaultTimerMenu, ITimerMenu, selectMenu } from "../models/TimerMenu";
import { IGameTimerProps } from "../types";

export class GameTimer extends React.Component<IGameTimerProps> {
  public noSleep = new nosleepJs();
  public timerMenu: ITimerMenu = defaultTimerMenu;
  private sw: StopWatch = new StopWatch("dummy", 0, []);

  public componentDidMount() {
    this.onChange(this.props.dataStore!.menuIndex);
  }

  public render() {
    return (
      <div>
        {selectMenu(
          this.props.dataStore.menuIndex,
          this.onMenuSelect,
          this.timerMenu
        )}
        <List>
          {timerList(this.timerMenu, this.props.dataStore)}
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
      if (sw.remainTime().seconds < sw.checkPoints[0]) {
        const synthes = new SpeechSynthesisUtterance(
          sw.remainTime().toLeftString()
        );
        synthes.lang = "ja-JP";
        synthes.rate = 1.2;
        speechSynthesis.speak(synthes);
        sw.checkPoints.shift();
      }
      this.props.setRemainTime(sw.remainTimeString());
    };
    const onFinish = (sw: StopWatch) => {
      if (isTimerLeft(this.timerMenu, this.props.dataStore)) {
        // FIXME
        this.sw = createStopWatch(
          this.timerMenu,
          onTick,
          onFinish,
          nextTimer(this.props.dataStore)
        );
        this.sw.go();
        this.props.setNextTimer();
      } else {
        const synthes = new SpeechSynthesisUtterance("終了です。");
        synthes.lang = "ja-JP";
        speechSynthesis.speak(synthes);
        this.props.setFinish();
      }
    };
    this.sw.pause();
    this.noSleep.disable();
    // FIXME
    this.sw = createStopWatch(this.timerMenu, onTick, onFinish, {
      ...this.props.dataStore,
      menuIndex,
      timerIndex: 0
    });
    this.props.setMenuIndex(menuIndex);
    this.props.setRemainTime(this.sw.remainTimeString());
  }

  private onPlayClick = () => {
    this.noSleep.enable();
    if (this.sw.canRun()) {
      this.sw.go();
      this.props.execPause();
    } else {
      this.sw.pause();
      this.props.execGo();
    }
  };

  private onResetClick = () => {
    this.onChange(this.props.dataStore.menuIndex);
  };

  private onMenuSelect = (ev: React.ChangeEvent<any>) => {
    this.onChange(parseInt(ev.target.value, 10));
  };
}
