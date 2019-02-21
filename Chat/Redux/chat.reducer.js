import { CHANGE_UNREAD_COUNT, CREATE_HUB_PROXY } from "../actions/chat.actions";

const initialChatState = {
  hubProxy: null,
  unreadMessages: 0
};

const chatReducer = (state = initialChatState, action) => {
  switch (action.type) {
    case CREATE_HUB_PROXY:
      return {
        ...state,
        hubProxy: action.value
      };
    case CHANGE_UNREAD_COUNT:
      return {
        ...state,
        unreadMessages: action.value
      };
    default:
      return state;
  }
};

export default chatReducer;
