export interface ITimerEntry {
  title: string;
  duration: number;
}

export const defaultTimerEntry: ITimerEntry = {
  title: "",
  duration: 0
};
