import React, { PureComponent } from "react";

export default class ChatConversationList extends PureComponent {
  mapConversations = conversation => {
    const messages = conversation.Messages;
    const lastMessage = !messages ? null : messages[messages.length - 1];

    const computeUnread = () => {
      let count = 0;
      messages.forEach(message => {
        if (!message) return;
        if (
          message.ReadStatus === false &&
          message.UserId !== this.props.currentUser.id
        ) {
          count++;
        }
      });
      return count;
    };

    const unread = messages && computeUnread();

    const computeStyle = () => {
      let style = {
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        padding: "10px",
        display: "flex",
        cursor: "pointer",
        position: "relative"
      };
      if (lastMessage && messages.length > 0 && unread) {
        style = {
          ...style,
          ...{
            fontWeight: "bold"
          }
        };
      }
      if (conversation.Id === this.props.parentState.currConvId) {
        style = { ...style, ...{ backgroundColor: "rgba(0,0,0,0.07)" } };
      }
      return style;
    };

    const otherUser = {
      ...this.props.parentState.users[
        conversation.UserIds.find(
          userId => userId !== this.props.currentUser.id
        )
      ]
    };

    const computeText = () => {
      if (lastMessage.Text.length >= 60) {
        return lastMessage.Text.substr(0, 59) + "...";
      } else {
        return lastMessage.Text;
      }
    };

    const computePhoto = () => {
      if (otherUser.photo && otherUser.photo.includes("http")) {
        return otherUser.photo;
      } else {
        return "https://via.placeholder.com/64";
      }
    };

    return (
      <div
        style={computeStyle()}
        key={conversation.Id}
        onClick={() => this.props.switchConversation(conversation.Id)}
      >
        <img
          className="img-thumbnail rounded-circle thumb64"
          src={computePhoto()}
          alt="Avatar"
        />
        {unread > 0 && (
          <span
            className="badge badge-danger ml-0"
            style={{
              height: "19px",
              position: "absolute",
              top: "15px",
              left: "60px"
            }}
          >
            {unread > 100 ? "100+" : unread}
          </span>
        )}
        <div className="d-flex flex-column my-auto px-3">
          <p className="mb-0" style={{ fontSize: "17px" }}>
            {otherUser.name}
          </p>
          <p className="text-muted mb-0">
            {lastMessage.UserId === this.props.currentUser.id && "You: "}
            {computeText()}
          </p>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div
        style={{
          height: "100%",
          overflowY: "auto",
          marginBottom: "10px"
        }}
      >
        {this.props.parentState.convSortOrder.map(key =>
          this.mapConversations(this.props.parentState.conversations[key])
        )}
      </div>
    );
  }
}
