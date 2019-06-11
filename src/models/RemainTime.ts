import { Lens } from "monocle-ts";
import printf from "printf";

export interface IRemainTime {
  milliSeconds: number;
}

const milliSeconds = Lens.fromProp<IRemainTime>()("milliSeconds");

const seconds = (r: IRemainTime): number => r.milliSeconds / 1000;
const finished = (r: IRemainTime): boolean => r.milliSeconds < 0;
const format = (r: IRemainTime): string =>
  r.milliSeconds <= 0
    ? "00:00:00"
    : printf(
        "%02d:%02d:%02d",
        Math.floor(seconds(r) / 3600),
        Math.floor((seconds(r) % 3600) / 60),
        Math.floor(seconds(r) % 60)
      );

const toLeftString = (r: IRemainTime): string => {
  const left = Math.ceil(r.milliSeconds / 1000);
  if (left < 10) {
    return left.toString();
  }

  const hour = Math.floor(left / 3600);
  const min = Math.floor((left % 3600) / 60);
  const sec = Math.floor(left % 60);
  return `残り${hour > 0 ? `{hour}時間` : ""}
        ${min > 0 ? `${min}分` : ""}
        ${sec > 0 ? `${sec}秒` : ""}
        です`;
};

const calc = (diff: number, r: IRemainTime) => {
  return milliSeconds.modify(i => i - diff)(r);
};

export const remainTime = {
  calc,
  format,
  finished,
  seconds,
  toLeftString
};
