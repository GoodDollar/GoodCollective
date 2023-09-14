import moment from 'moment';

export const formatTime = (timestamp: number): string => {
  // Create a moment object from the Unix timestamp
  const m = moment.unix(timestamp);

  // Format the timestamp in your desired format, e.g., "Aug 2, 5:04pm"
  const formattedTimestamp = m.format('MMM D, h:mma');

  return formattedTimestamp;
};
