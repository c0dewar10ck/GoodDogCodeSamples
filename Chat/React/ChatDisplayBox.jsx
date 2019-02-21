import React, { PureComponent } from "react";
import ChatSearchBar from "./ChatSearchBar";

export default class ChatDisplayBox extends PureComponent {
  scrollPosition = null;
  scrollActive = false;

  componentDidUpdate(prevProps) {
    if (!this.scrollActive) {
      this.scrollToPosition(this.messageDisp.scrollHeight);
    }
    if (
      prevProps.parentState.currConvId !== this.props.parentState.currConvId &&
      this.props.parentState.newMessageDialog
    ) {
      this.props.handleNewConversationClick();
    }
  }

  handleScroll = e => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    const top = e.target.scrollTop <= 0;

    if (top) {
      this.props.loadMoreMessages();
    }

    if (!bottom) {
      this.scrollActive = true;
    } else {
      this.scrollActive = false;
    }
  };

  scrollToPosition = position => {
    this.messageDisp.scrollTo(0, position);
  };

  computeStyle = (message, index, originalArr) => {
    let style = {
      padding: "5px 15px",
      margin: "0px auto 3px 70px",
      maxWidth: "40%",
      backgroundColor: "#eaeffa",
      borderRadius: "0px 15px 15px 0px"
    };
    if (message.UserId === this.props.currentUser.id) {
      style = {
        ...style,
        ...{
          marginLeft: "auto",
          marginRight: "20px",
          borderRadius: "15px 0px 0px 15px",
          backgroundColor: "#1aa3ff",
          color: "white"
        }
      };
    } else {
      if (message.ReadStatus === false) {
        style = { ...style, ...{ fontWeight: "bolder" } };
      }
    }
    if (
      index === 0 ||
      (originalArr[index - 1] &&
        originalArr[index - 1].UserId !== message.UserId)
    ) {
      style = {
        ...style,
        ...{ borderTopRightRadius: "15px", borderTopLeftRadius: "15px" }
      };
    }

    return style;
  };

  shouldPhotoRender = (user, message, index, originalArr) => {
    const photo = (
      <img
        src={user.photo}
        alt="avatar"
        style={{
          margin: "-10px -60px 0px 20px",
          borderRadius: "100%",
          width: "40px",
          height: "40px"
        }}
      />
    );
    if (index === originalArr.length - 1) {
      return photo;
    } else if (
      originalArr[index + 1] &&
      originalArr[index + 1].UserId !== message.UserId
    ) {
      return photo;
    } else {
      return;
    }
  };

  mapMessages = (message, index, originalArr) => {
    if (!message) return;
    const user = { ...this.props.parentState.users[message.UserId] };
    if (index === originalArr.length - 1) {
      return (
        <div
          className="d-flex"
          style={{ alignItems: "flex-end" }}
          key={message.Id + index.toString()}
          ref={el => (this.lastMessage = el)}
        >
          {message.UserId !== this.props.currentUser.id &&
            this.shouldPhotoRender(user, message, index, originalArr)}
          <div style={this.computeStyle(message, index, originalArr)}>
            {message.Text}
          </div>
        </div>
      );
    } else {
      return (
        <div
          className="d-flex"
          style={{ alignItems: "flex-end" }}
          key={message.Id + index.toString()}
        >
          {message.UserId !== this.props.currentUser.id &&
            this.shouldPhotoRender(user, message, index, originalArr)}
          <div style={this.computeStyle(message, index, originalArr)}>
            {message.Text}
          </div>
        </div>
      );
    }
  };

  render() {
    const {
      currConvId,
      conversations,
      targetUser,
      users,
      newMessageDialog
    } = this.props.parentState;
    const currentConv = conversations[currConvId];
    const otherUser =
      currentConv && !newMessageDialog
        ? users[
            currentConv.UserIds.find(val => val !== this.props.currentUser.id)
          ]
        : Object.keys(targetUser).length > 0 && targetUser;

    const computePhoto = () => {
      if (otherUser.photo.includes("http")) {
        return otherUser.photo;
      } else {
        return "https://via.placeholder.com/64";
      }
    };

    return (
      <React.Fragment>
        <div
          style={{
            padding: "10px",
            margin: "0",
            height: "50px"
          }}
          className="d-flex"
        >
          {otherUser && (
            <img
              className="img-thumbnail rounded-circle mb-0 mr-1"
              src={computePhoto()}
              alt="Avatar"
              style={{ height: "30px", width: "30px" }}
            />
          )}
          <h4 className="mt-1 mb-0">
            {newMessageDialog
              ? Object.keys(targetUser).length > 0
                ? targetUser.name
                : "New Message"
              : otherUser
              ? otherUser.name
              : "Messages"}
          </h4>
        </div>
        <div
          style={{
            overflowY: "auto",
            height: "91%",
            width: "100%",
            padding: "30px 0",
            border: "1px solid rgba(0,0,0,0.1)"
          }}
          ref={el => {
            this.messageDisp = el;
          }}
          onScroll={this.handleScroll}
        >
          {newMessageDialog ? (
            <ChatSearchBar
              {...this.props}
              data={this.props.parentState.users}
            />
          ) : (
            currentConv && currentConv.Messages.map(this.mapMessages)
          )}
        </div>
      </React.Fragment>
    );
  }
}
