const { DateTime } = require('luxon');

// Default timezone
const DEFAULT_TIMEZONE = 'utc';

// Get start of the month (IST)
function getStartOfMonth(date, timezone = DEFAULT_TIMEZONE) {
  return DateTime.fromJSDate(date, { zone: timezone }).startOf('month').toJSDate();
}

// Get end of the month (IST)
function getEndOfMonth(date, timezone = DEFAULT_TIMEZONE) {
  return DateTime.fromJSDate(date, { zone: timezone }).endOf('month').toJSDate();
}

function getStartOfWeek(date, zone = DEFAULT_TIMEZONE) {
  return DateTime.fromJSDate(date, { zone })
    .startOf('week')   // ISO week starts Monday; use .minus({ days: 1 }).startOf('week') if you want Sunday
    .toJSDate();
}

function getEndOfWeek(date, zone = DEFAULT_TIMEZONE) {
  return DateTime.fromJSDate(date, { zone })
    .endOf('week')
    .toJSDate();
}

module.exports = {
  getStartOfMonth,
  getEndOfMonth,
  getStartOfWeek, 
  getEndOfWeek
};