export function Guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// UTC time
export function getOfftime(daily_time: any): string {

  let timeOffset = 0; // seconds
  if (daily_time && typeof daily_time === 'number') {
    timeOffset = +daily_time;
  }

  // Convert to current time
  let now: Date = new Date();
  let timezoneOffset: number = now.getTimezoneOffset();
  // Local time
  timeOffset = timeOffset - timezoneOffset * 60;
  if (timeOffset < 0) {
    timeOffset = timeOffset + ONE_DAY_SECONDS;
  }

  if (timeOffset >= ONE_DAY_SECONDS) {
    timeOffset -= ONE_DAY_SECONDS;
  }

  // To time string
  let hours: number = Math.floor(timeOffset / ONE_HOUR_SECONDS);
  let minutes: number = Math.floor((timeOffset - hours * ONE_HOUR_SECONDS) / 60);

  let timeStr: string = '' + hours;
  if (hours < 10) {
    timeStr = '0' + timeStr;
  }
  if (minutes < 10) {
    timeStr += ':0';
  } else {
    timeStr += ':';
  }
  timeStr += minutes;

  return timeStr;
}

export function setOfftime(v: string) {
  if (!v || v === '') {
    return;
  }

  let values: string[] = v.split(':');
  if (!values || values.length !== 2) {
    return;
  }

  let hours: number = +values[0];
  let minutes: number = +values[1];
  // Convert to UTC time
  let now: Date = new Date();
  let timezoneOffset: number = now.getTimezoneOffset();
  let utcTimes: number = hours * ONE_HOUR_SECONDS + minutes * 60;
  utcTimes += timezoneOffset * 60;
  if (utcTimes < 0) {
    utcTimes += ONE_DAY_SECONDS;
  }

  if (utcTimes >= ONE_DAY_SECONDS) {
    utcTimes -= ONE_DAY_SECONDS;
  }

  return utcTimes;
}

export const ONE_HOUR_SECONDS = 3600;
export const ONE_DAY_SECONDS: number = 24 * ONE_HOUR_SECONDS;
export const EVENT_ALERT = "alert-message";
export const EVENT_REGISTRY_LIST_UPDATED = "registry-list-updated";
export const EVENT_OPEN_MODAL = "open-modal";
export const EVENT_MODAL_CONFIRM = "modal-confirm";
export const EVENT_VIEW_STATS = "view-stats";
export const ALERT_SUCCESS = "alert-success";
export const ALERT_DANGER = "alert-danger";
export const EVENT_CANCEL_CREATING_EDGE = "x-creating-edge";
export const EVENT_NODE_REMOVED = "x-node-removed";
export const EVENT_EDGE_REMOVED = "x-edge-removed";
export const STATUS_RUNNING = "running";
export const STATUS_SUCCESS = "finished";
export const STATUS_ERROR = "error";