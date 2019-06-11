import * as React from "react";

interface ITimeDisplayProps {
  finish: boolean;
  time: string;
}

export const TimeDisplay: React.FC<ITimeDisplayProps> = (
  props: ITimeDisplayProps
): JSX.Element => (
  <div className="time-display" data-is-finish={props.finish}>
    <code>{props.time}</code>
  </div>
);