import { Frequency } from '../models/constants';

export const totalDurationInSeconds = (duration: number, frequency: Frequency): number => {
  if (frequency === Frequency.OneTime) {
    return 0;
  } else if (frequency === Frequency.Daily) {
    return duration * 24 * 60 * 60;
  } else if (frequency === Frequency.Weekly) {
    return duration * 7 * 24 * 60 * 60;
  }

  const now = new Date();
  let nextDate: Date;

  if (frequency === Frequency.Monthly) {
    const naiveMonth = now.getMonth() + duration;
    const month = naiveMonth % 12;
    const year = now.getFullYear() + Math.floor(naiveMonth / 12);
    nextDate = new Date(
      year,
      month,
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    );
  } else {
    // frequency === Frequency.Yearly
    nextDate = new Date(
      now.getFullYear() + duration,
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    );
  }

  const timeInMilliseconds = nextDate.getTime() - now.getTime();
  return Math.floor(timeInMilliseconds / 1000);
};
