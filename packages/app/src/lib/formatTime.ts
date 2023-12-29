import moment from 'moment';

export const formatTime = (timestamp: number): string => {
  return moment.unix(timestamp).format('MMM D, h:mma');
};
