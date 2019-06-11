import { Button } from "@material-ui/core";
import { Pause, PlayArrow } from "@material-ui/icons";
import * as React from "react";

interface IControlButtonsProps {
  label: string;
  running: boolean;
  finish: boolean;
  onPlayClick: () => void;
  onResetClick: () => void;
}

export const ControlButtons: React.FC<IControlButtonsProps> = (
  props: IControlButtonsProps
): JSX.Element => (
  <div className="control-buttons">
    {props.finish ? (
      ""
    ) : (
      <Button
        variant="contained"
        className="button"
        onClick={props.onPlayClick}
      >
        {props.running ? <Pause /> : <PlayArrow />}
        {props.label}
      </Button>
    )}
    <Button
      variant="contained"
      className="button"
      color="secondary"
      onClick={props.onResetClick}
    >
      Reset
    </Button>
  </div>
);
