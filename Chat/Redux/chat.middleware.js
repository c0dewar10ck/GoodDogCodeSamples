import $ from "jquery";
import { createHubProxy, changeUnreadCount } from "../actions/chat.actions";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import * as accountsService from "../../services/accountsService";

let _hub;
let currentUserId;

export function signalRStart(store) {
  const hubConnection = $.hubConnection();
  hubConnection
    .start()
    .done(() => console.log("Now connected, connection ID=" + hubConnection.id))
    .fail(err => console.log("Error while establishing connection :(", err));

  _hub = hubConnection.createHubProxy("ChatHub");

  _hub.on("unreadMessageUpdate", count =>
    store.dispatch(changeUnreadCount(count))
  );

  _hub.on("sendNotificationToGroup", (message, sender) => {
    const handleNewMessage = () => {
      if (
        typeof currentUserId === "number" &&
        message.UserId !== currentUserId
      ) {
        let count = store.getState().chat.unreadMessages;
        count++;
        store.dispatch(changeUnreadCount(count));
        toast(`${sender.FirstName} ${sender.LastName}: ${message.Text}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
    };
    if (!currentUserId) {
      accountsService
        .getCurrent()
        .then(resp => (currentUserId = resp.item.id))
        .then(handleNewMessage)
        .catch(err => console.error(err));
    } else {
      handleNewMessage();
    }
  });

  store.dispatch(createHubProxy(_hub));
}

const chatState = store => next => action => {
  let result = next(action);
  return result;
};

export default chatState;
