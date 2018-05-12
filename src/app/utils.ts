export function Guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

export const EVENT_ALERT = "alert-message";
export const EVENT_REGISTRY_LIST_UPDATED = "registry-list-updated";
export const ALERT_SUCCESS = "alert-success";
export const ALERT_DANGER = "alert-danger";