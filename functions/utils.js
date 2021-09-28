// get current time fixed on utf format
exports.getCurrentTimeFixed = function getCurrentTimeFixed() {
  var now = new Date();
  var utc_timestamp = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds()
  );
  return (utc_timestamp - (utc_timestamp % 1000)) / 1000;
};
