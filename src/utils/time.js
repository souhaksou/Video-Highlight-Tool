const formatTime = (seconds) => {
  const safeSec = Number(seconds) || 0;
  const min = Math.floor(safeSec / 60);
  const sec = Math.floor(safeSec % 60);
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

export { formatTime };