import moment from 'moment';

export const formatTime = (timestamp: number): string => {
  return moment.unix(timestamp).format('MMMM D, YYYY');
};
