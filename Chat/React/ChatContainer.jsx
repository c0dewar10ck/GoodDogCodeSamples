import React, { PureComponent } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as rs from "reactstrap";

import * as profilesServices from "../../services/services.userProfiles";
import * as actions from "../../store/actions/actions";
import ContentWrapper from "../Layout/ContentWrapper";
import ChatDisplayBox from "./ChatDisplayBox";
import ChatConversationList from "./ChatConversationList";

class ChatContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      conversations: {},
      convSortOrder: [],
      convPageIndex: {},
      currConvId: null,
      message: "",
      users: {},
      targetUser: {},
      newMessageDialog: false
    };
  }

  componentDidMount = () => {
    this.props.chat.hubProxy.on(
      "sendConversationsToClient",
      this.handleRecievedConversations
    );

    this.props.chat.hubProxy.on(
      "retrieveMessages",
      this.handleRecievedMessages
    );

    this.props.chat.hubProxy.on(
      "handleNewPageOfMessages",
      this.handleNewPageOfMessages
    );

    this.props.chat.hubProxy.on("addChatMessageToGroup", this.handleNewMessage);

    this.props.chat.hubProxy.on(
      "switchCurrentConversation",
      currentConversation => {
        this.setState({
          currConvId: currentConversation.Id
        });
      }
    );

    this.getCurrentConversations();

    profilesServices
      .getPaginated(0, 100)
      .then(this.onGetUsersSuccess)
      .catch(err => console.error(err));
  };

  componentDidUpdate = (prevProps, prevState) => {
    const {
      conversations,
      message,
      currConvId,
      convPageIndex,
      newMessageDialog
    } = this.state;
    const currentConv = conversations[currConvId];

    if (!newMessageDialog && message !== prevState.message) {
      if (
        currentConv &&
        currentConv.Messages.length > 0 &&
        currentConv.Messages[currentConv.Messages.length - 1].ReadStatus ===
          false
      ) {
        this.props.chat.hubProxy
          .invoke("markAsRead", currentConv, this.props.currentUser.id)
          .then(this.markAsRead(currConvId))
          .catch(err => console.error(err));
      }
    }

    if (
      prevState.convPageIndex[currConvId] &&
      convPageIndex[currConvId] !== prevState.convPageIndex[currConvId]
    ) {
      this.props.chat.hubProxy.invoke(
        "GetNextPageMessages",
        currConvId,
        convPageIndex[currConvId]
      );
    }
  };

  getCurrentConversations = () => {
    if (this.props.chat.hubProxy.connection.id) {
      setTimeout(() => {
        this.props.chat.hubProxy.invoke(
          "GetCurrentConversations",
          this.props.currentUser.id,
          null
        );
      }, 2000);
    } else {
      setTimeout(() => {
        this.getCurrentConversations();
      }, 1000);
    }
  };

  markAsRead = currConvId => {
    let conversations = { ...this.state.conversations };
    let messages = [...conversations[currConvId].Messages];

    this.props.chat.hubProxy.invoke(
      "GetUnreadMessageCount",
      this.props.currentUser.id,
      null
    );

    console.log(messages);

    messages.forEach((message, index) => {
      if (message && message.ReadStatus === false) {
        messages[index].ReadStatus = true;
      }
    });

    conversations[currConvId].Messages = messages;

    this.setState({
      conversations
    });
  };

  handleRecievedConversations = conversations => {
    let convSortOrder = conversations.map(conv => conv.Id);
    let currConvId = conversations[0].Id;
    let convHash = {};
    let convPageIndex = {};

    conversations.forEach(conv => {
      convHash[conv.Id] = conv;
      convPageIndex[conv.Id] = conv.TotalPages - 1;
    });

    this.setState({
      conversations: convHash,
      convSortOrder,
      convPageIndex,
      currConvId
    });
  };

  handleRecievedMessages = (messages, conversationName) => {
    let conversations = { ...this.state.conversations };

    this.state.convSortOrder.forEach(key => {
      if (conversations[key].Name === conversationName) {
        conversations[key].Messages = messages;
      }
    });

    this.setState({ conversations });
  };

  handleNewMessage = (message, groupName) => {
    let conversations = { ...this.state.conversations };

    let convSortOrder = [...this.state.convSortOrder];
    convSortOrder.forEach((key, index) => {
      if (conversations[key].Name === groupName) {
        convSortOrder.unshift(convSortOrder.splice(index, 1));
      }
    });

    convSortOrder.forEach(key => {
      if (conversations[key].Name === groupName) {
        if (!conversations[key].Messages) conversations[key].Messages = [];
        conversations[key].Messages.push(message);
      }
      return conversations[key];
    });

    this.setState({ conversations, convSortOrder });
  };

  onGetUsersSuccess = response => {
    const respArr = response.item.pagedItems;
    const hash = {};

    respArr.forEach(obj => {
      hash[obj.userId] = {
        id: obj.userId,
        name: `${obj.firstName} ${obj.lastName}`,
        photo: obj.photoUrl
      };
    });

    this.setState({
      users: hash
    });
  };

  switchConversation = convId => {
    this.setState({ currConvId: convId });
  };

  handleUserSelection = selected => {
    let exists = false;
    let conv = null;

    Object.keys(this.state.conversations).forEach(key => {
      if (this.state.conversations[key].UserIds.includes(selected.id)) {
        exists = true;
        conv = key;
        return;
      }
    });

    if (exists) {
      this.setState({
        currConvId: conv
      });
    } else {
      this.setState({
        targetUser: selected
      });
    }
  };

  handleNewConversationClick = e => {
    e && e.preventDefault();
    this.setState({
      newMessageDialog: !this.state.newMessageDialog,
      targetUser: {}
    });
  };

  sendMessage = e => {
    e.preventDefault();
    if (this.state.message === "") return;
    else if (this.state.newMessageDialog) {
      this.createNewConversation();
      return;
    }

    const newMessage = {
      conversationId: this.state.currConvId,
      userId: this.props.currentUser.id,
      text: this.state.message
    };
    const currConvName = this.state.conversations[this.state.currConvId].Name;
    this.props.chat.hubProxy
      .invoke("sendMessage", newMessage, currConvName)
      .catch(err => console.error(err));

    this.setState({ message: "" });
  };

  createNewConversation = () => {
    const users = [
      parseInt(this.props.currentUser.id, 10),
      parseInt(this.state.targetUser.id, 10)
    ];

    this.props.chat.hubProxy
      .invoke(
        "createConversation",
        users,
        this.props.currentUser.id,
        this.state.message
      )
      .then(() =>
        this.setState({ message: "", targetUser: {}, newMessageDialog: false })
      )
      .catch(err => console.error(err));
  };

  mapUsers = key => {
    const user = this.state.users[key];
    if (user.id === this.props.currentUser.id) return;
    return (
      <rs.Col
        md="6"
        style={{
          padding: "30px",
          display: "flex"
        }}
        key={user.name + key.toString()}
        onClick={() => this.handleUserSelection(user.id)}
      >
        <img
          className="img-thumbnail rounded-circle thumb64"
          src={user.photo}
          alt="Avatar"
        />
        <div className="px-2">
          <h4 className="mt-4">{user.name}</h4>
        </div>
      </rs.Col>
    );
  };

  loadMoreMessages = () => {
    if (this.state.convPageIndex[this.state.currConvId] > 0) {
      let convPageIndex = { ...this.state.convPageIndex };
      convPageIndex[this.state.currConvId] -= 1;

      this.setState({
        convPageIndex
      });
    } else if (this.state.convPageIndex[this.state.currConvId] === 0) {
      console.log("end of chat history :(");
    }
  };

  handleNewPageOfMessages = (messages, conversationId) => {
    let conversations = { ...this.state.conversations };
    let newMessages = [...conversations[conversationId].Messages];
    for (let i = newMessages.length - 1; i >= 0; i--) {
      newMessages.unshift(messages[i]);
    }
    conversations[conversationId].Messages = newMessages;
    this.setState({
      conversations
    });
  };

  render() {
    return (
      <ContentWrapper>
        <rs.Card className="card-default">
          <rs.CardBody>
            <rs.Row>
              <rs.Col lg="4">
                <div
                  style={{
                    borderBottom: "1px solid rgba(0,0,0,0.1)",
                    padding: "10px",
                    margin: "0"
                  }}
                  className="d-flex"
                >
                  <h4>Conversations</h4>
                  <a
                    href="/chat"
                    className="ml-auto"
                    onClick={e => this.handleNewConversationClick(e)}
                  >
                    {this.state.newMessageDialog ? (
                      <i class="fas fa-ban" />
                    ) : (
                      <i className="fas fa-plus" />
                    )}
                  </a>
                </div>
                <div style={{ height: "75vh" }}>
                  <ChatConversationList
                    {...this.props}
                    parentState={this.state}
                    switchConversation={this.switchConversation}
                  />
                </div>
              </rs.Col>
              <rs.Col lg="8" style={{ height: "75vh" }}>
                <ChatDisplayBox
                  {...this.props}
                  parentState={this.state}
                  handleUserSelection={this.handleUserSelection}
                  handleNewConversationClick={this.handleNewConversationClick}
                  loadMoreMessages={this.loadMoreMessages}
                />
                <div>
                  <rs.Form
                    onSubmit={e => this.sendMessage(e)}
                    style={{ marginTop: "15px" }}
                  >
                    <div className="input-group">
                      <rs.Input
                        type="text"
                        value={this.state.message}
                        onChange={e =>
                          this.setState({ message: e.target.value })
                        }
                        disabled={
                          !this.state.currConvId && !this.state.newMessageDialog
                        }
                      />
                      <rs.Button
                        className="input-group-append mt-0"
                        type="submit"
                        disabled={
                          !this.state.currConvId && !this.state.newMessageDialog
                        }
                      >
                        Send
                      </rs.Button>
                    </div>
                  </rs.Form>
                </div>
              </rs.Col>
            </rs.Row>
          </rs.CardBody>
        </rs.Card>
      </ContentWrapper>
    );
  }
}

const mapStateToProps = state => ({
  chat: state.chat
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChatContainer);
