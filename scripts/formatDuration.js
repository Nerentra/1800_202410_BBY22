/**
 * Takes a duration in milliseconds and returns
 * a time with appropriate units.
 * @param {Number} The duration in milliseconds.
 * @returns {String} The formatted time with units.
 */
function formatDuration(duration) {
  const units = ["s", "m", "h", "d", "y"];
  const conversions = [1000, 60, 60, 24, 365];
  for (let i = 0; i < conversions.length - 1; i++) {
    duration /= conversions[i];
    if (duration < conversions[i + 1]) {
      return Math.floor(duration) + units[i];
    }
  }
  return Math.floor(duration) + units[units.length - 1];
}
