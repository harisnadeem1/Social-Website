export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);

  const options = {
    month: 'short',       // e.g., "Jun"
    day: 'numeric',       // e.g., "29"
    hour: '2-digit',
    minute: '2-digit',
    hour12: false         // 24-hour format
  };

  return date.toLocaleString('en-US', options); // e.g., "Jun 29, 14:14"
};
