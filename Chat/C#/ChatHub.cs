using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models.Domain;
using Sabio.Models.Requests.Chat;
using Sabio.Services;
using Sabio.Services.Interfaces;
using Sabio.Web.Core.Services;
using Unity;

namespace Sabio.Web.SignalR
{
    public class ChatHub : Hub
    {
        private readonly IChatService _service;
        private readonly IUserProfileService _userProfileService;
        private readonly IAuthenticationService<int> _auth;
        private static ConcurrentDictionary<int, string> connectedUsers = new ConcurrentDictionary<int, string>();

        public ChatHub()
        {
            string conn = System.Configuration.ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
            IDataProvider dataProvider = new SqlDataProvider(conn);
            _service = new ChatService(dataProvider);
            _userProfileService = new UserProfileService(dataProvider);

            _auth = new OwinAuthenticationService();
        }

        public override Task OnConnected()
        {
            int userId = _auth.GetCurrentUserId();
            connectedUsers.AddOrUpdate(userId, Context.ConnectionId, (key, oldValue) => oldValue = Context.ConnectionId);

            //GetCurrentConversations(userId, Context.ConnectionId);
            GetUnreadMessageCount(userId, Context.ConnectionId);

            return base.OnConnected();
        }

        public void GetUnreadMessageCount(int userId, string connId)
        {
            int unreadCount = _service.GetUnreadMessageCount(userId);

            if (connId == null)
            {
                connId = Context.ConnectionId;
            }

            Clients.Client(connId).unreadMessageUpdate(unreadCount);
        }

        public void GetCurrentConversations(int userId, string connId)
        {
            List<ConversationWithMetaData> userConversations = _service.GetConversationsWithMetaData(userId);

            if (userConversations != null)
            {
                foreach (ConversationWithMetaData conversation in userConversations)
                {
                    Groups.Add(Context.ConnectionId, conversation.Name);
                }

                if (connId == null)
                {
                    connId = Context.ConnectionId;
                }

                Clients.Client(connId).sendConversationsToClient(userConversations);
            }
        }

        public void GetGroupMessages(string groupName, int conversationId)
        {
            int userId = _auth.GetCurrentUserId();
            List<Sabio.Models.Domain.Message> messages = _service.GetMessages(conversationId, userId);
            Clients.Client(Context.ConnectionId).retrieveMessages(messages, groupName);
        }

        public void GetNextPageMessages(int conversationId, int pageIndex)
        {
            int userId = _auth.GetCurrentUserId();
            List<Sabio.Models.Domain.Message> messages = _service.GetMessages(conversationId, userId, pageIndex);
            Clients.Client(Context.ConnectionId).handleNewPageOfMessages(messages, conversationId);
        }

        public void MarkAsRead(ConversationWithMetaData currentConversation, int userId)
        {
            bool readStatus = true;
            _service.MarkAsRead(currentConversation.Id, userId, readStatus);
        }

        public async Task CreateConversation(List<int> userIds, int createdBy, string message)
        {
            Conversation newConversation = _service.Create(userIds, createdBy, message);

            foreach (int userId in userIds)
            {
                string connId = null;
                connectedUsers.TryGetValue(userId, out connId);

                if (connId != null)
                {
                    await Groups.Add(connId, newConversation.Name);
                    GetCurrentConversations(userId, connId);
                }
            }

            if (newConversation != null)
            {
                Clients.Client(Context.ConnectionId).switchCurrentConversation(newConversation);
            }
        }

        public async Task JoinGroup(string groupName)
        {
            await Groups.Add(Context.ConnectionId, groupName);
            Clients.OthersInGroup(groupName).addInfoMessage(Context.ConnectionId + " joined");
        }

        public Task LeaveGroup(string groupName)
        {
            return Groups.Remove(Context.ConnectionId, groupName);
        }

        public void SendMessage(MessageAddRequest message, string groupName)
        {
            bool isSuccessful = false;
            UserProfile sender = null;

            isSuccessful = _service.Create(message);
            sender = _userProfileService.GetUser(message.UserId);

            if (isSuccessful)
            {
                Clients.Group(groupName).addChatMessageToGroup(message, groupName);
                if (sender != null)
                {
                    Clients.Group(groupName).sendNotificationToGroup(message, sender);
                }
            }
        }
    }
}