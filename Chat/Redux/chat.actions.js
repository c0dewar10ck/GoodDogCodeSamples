export const CHANGE_UNREAD_COUNT = "CHANGE_UNREAD_COUNT";
export const CREATE_HUB_PROXY = "CREATE_HUB_PROXY";

export function createHubProxy(value) {
  return { type: CREATE_HUB_PROXY, value };
}

export function changeUnreadCount(value) {
  return { type: CHANGE_UNREAD_COUNT, value };
}
