using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models.Domain;
using Sabio.Models.Requests.Chat;
using Sabio.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sabio.Services
{
    public class ChatService : IChatService
    {
        private IDataProvider _dataProvider;
        private static int pageSize = 20;

        public ChatService(IDataProvider dataProvider)
        {
            _dataProvider = dataProvider;
        }

        public Conversation Create(List<int> userIds, int createdBy, string message)
        {
            if (userIds == null)
            {
                throw new ArgumentNullException("Parameter data is required");
            }
            string storedProc = "[dbo].[Conversations_Insert]";

            int empId = 0;
            Conversation newConversation = null;
            bool isSuccessful = false;
            _dataProvider.ExecuteNonQuery(storedProc
                , delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@CreatedBy", createdBy);

                    SqlParameter p = new SqlParameter("@UserIds", System.Data.SqlDbType.Structured);

                    if (userIds != null && userIds.Any())
                    {
                        p.Value = new Sabio.Data.IntIdTable(userIds);
                    }

                    paramCollection.Add(p);

                    SqlParameter idParameter = new SqlParameter("@Id", System.Data.SqlDbType.Int);
                    idParameter.Direction = System.Data.ParameterDirection.Output;

                    paramCollection.Add(idParameter);
                }, returnParameters: delegate (SqlParameterCollection param)
                {
                    Int32.TryParse(param["@Id"].Value.ToString(), out empId);
                });

            if (empId != 0)
            {
                newConversation = GetConversation(empId);

                MessageAddRequest messageModel = new MessageAddRequest()
                {
                    ConversationId = newConversation.Id,
                    UserId = createdBy,
                    Text = message
                };

                isSuccessful = Create(messageModel);
            }

            if (!isSuccessful)
            {
                newConversation = null;
            }

            return newConversation;
        }

        private Conversation GetConversation(int id)
        {
            Conversation conversation = null;
            string procName = "[dbo].[Conversations_SelectById]";
            _dataProvider.ExecuteCmd(procName
                   , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                   {
                       paramCollection.AddWithValue("@id", id);
                   }
                   , singleRecordMapper: delegate (IDataReader reader, short set)
                   {
                       conversation = new Conversation();

                       conversation.Id = reader.GetSafeInt32(0);
                       conversation.Name = reader.GetSafeGuid(1).ToString();
                   }
                   );
            return conversation;
        }

        public int GetUnreadMessageCount(int userId)
        {
            int unread = 0;
            string procName = "[dbo].[MessageRecipients_SelectUnreadCount]";
            _dataProvider.ExecuteCmd(procName
                , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@UserId", userId);
                }
                , singleRecordMapper: delegate (IDataReader reader, short set)
                {
                    unread = reader.GetSafeInt32(0);
                }
                );
            return unread;
        }

        public bool Create(MessageAddRequest data)
        {
            if (data == null)
            {
                throw new ArgumentNullException("Parameter data is required");
            }
            string storedProc = "[dbo].[Messages_Insert]";

            int empId = 0;
            bool isSuccessful = false;
            _dataProvider.ExecuteNonQuery(storedProc
                , delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@ConversationId", data.ConversationId);
                    paramCollection.AddWithValue("@UserId", data.UserId);
                    paramCollection.AddWithValue("@Text", data.Text);
                    paramCollection.AddWithValue("@ReadStatus", data.ReadStatus = false);

                    SqlParameter idParameter = new SqlParameter("@Id", System.Data.SqlDbType.Int);
                    idParameter.Direction = System.Data.ParameterDirection.Output;

                    paramCollection.Add(idParameter);
                }, returnParameters: delegate (SqlParameterCollection param)
                {
                    Int32.TryParse(param["@Id"].Value.ToString(), out empId);
                });

            if (empId != 0)
            {
                isSuccessful = true;
            }

            return isSuccessful;
        }

        public List<ConversationWithMetaData> GetConversations(int userId)
        {
            List<ConversationWithMetaData> conversations = null;
            string procName = "[dbo].[Conversations_SelectByUserId]";
            _dataProvider.ExecuteCmd(procName
                   , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                   {
                       paramCollection.AddWithValue("@UserId", userId);
                   }
                   , singleRecordMapper: delegate (IDataReader reader, short set)
                   {
                       ConversationWithMetaData conversation = MapConversation(reader);

                       if (conversations == null)
                       {
                           conversations = new List<ConversationWithMetaData>();
                       }

                       conversations.Add(conversation);
                   }
                   );
            return conversations;
        }

        public List<ConversationWithMetaData> GetConversationsWithMetaData(int userId)
        {
            List<ConversationWithMetaData> conversations = null;
            string procName = "[dbo].[Conversations_SelectWithMetaDataV4]";
            Dictionary<int, List<Message>> messageDict = null;
            Dictionary<int, List<int>> userDict = null;
            _dataProvider.ExecuteCmd(procName
                   , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                   {
                       paramCollection.AddWithValue("@UserId", userId);
                   }
                   , singleRecordMapper: delegate (IDataReader reader, short set)
                   {
                       switch (set)
                       {
                           case 0:
                               ConversationWithMetaData conversation = MapConversation(reader);

                               if (conversations == null)
                               {
                                   conversations = new List<ConversationWithMetaData>();
                               }

                               conversations.Add(conversation);
                               break;

                           case 1:
                               int conversationId = reader.GetInt32(1);
                               int assocUserId = reader.GetInt32(0);

                               if (userDict == null)
                               {
                                   userDict = new Dictionary<int, List<int>>();
                               }

                               if (!userDict.ContainsKey(conversationId))
                               {
                                   List<int> assocUserIds = new List<int>();
                                   assocUserIds.Add(assocUserId);

                                   userDict[conversationId] = assocUserIds;
                               }
                               else
                               {
                                   userDict[conversationId].Add(assocUserId);
                               }
                               break;

                           case 2:
                               conversationId = reader.GetInt32(2);
                               Message message = MapMessage(reader);

                               if (messageDict == null)
                               {
                                   messageDict = new Dictionary<int, List<Message>>();
                               }

                               if (!messageDict.ContainsKey(conversationId))
                               {
                                   List<Message> messages = new List<Message>();
                                   messages.Add(message);

                                   messageDict[conversationId] = messages;
                               }
                               else
                               {
                                   messageDict[conversationId].Add(message);
                               }

                               break;
                       }
                   }
                   );

            if (messageDict != null && userDict != null)
            {
                foreach (ConversationWithMetaData conversation in conversations)
                {
                    if (messageDict.ContainsKey(conversation.Id))
                    {
                        conversation.Messages = messageDict[conversation.Id];
                    }
                    if (userDict.ContainsKey(conversation.Id))
                    {
                        conversation.UserIds = userDict[conversation.Id];
                    }
                }
            }

            return conversations;
        }

        public List<Message> GetMessages(int groupId, int userId)
        {
            List<Message> messages = null;
            string procName = "[dbo].[Messages_SelectByConversation]";
            _dataProvider.ExecuteCmd(procName
                   , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                   {
                       paramCollection.AddWithValue("@ConversationId", groupId);
                       paramCollection.AddWithValue("@UserId", userId);
                   }
                   , singleRecordMapper: delegate (IDataReader reader, short set)
                   {
                       Message message = MapMessage(reader);

                       if (messages == null)
                       {
                           messages = new List<Message>();
                       }

                       messages.Add(message);
                   }
                   );
            return messages;
        }

        public List<Message> GetMessages(int groupId, int userId, int pageIndex)
        {
            List<Message> messages = null;
            string procName = "[dbo].[Messages_SelectPagedByConversation]";
            _dataProvider.ExecuteCmd(procName
                   , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                   {
                       paramCollection.AddWithValue("@ConversationId", groupId);
                       paramCollection.AddWithValue("@UserId", userId);
                       paramCollection.AddWithValue("@PageIndex", pageIndex);
                       paramCollection.AddWithValue("@PageSize", pageSize);
                   }
                   , singleRecordMapper: delegate (IDataReader reader, short set)
                   {
                       Message message = MapMessage(reader);

                       if (messages == null)
                       {
                           messages = new List<Message>();
                       }

                       messages.Add(message);
                   }
                   );
            return messages;
        }

        public bool MarkAsRead(int conversationId, int userId, bool readStatus)
        {
            string storedProc = "[dbo].[MessageRecipients_UpdateReadStatus]";

            bool isComplete = false;
            _dataProvider.ExecuteNonQuery(storedProc
                , delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@ConversationId", conversationId);
                    paramCollection.AddWithValue("@UserId", userId);
                    paramCollection.AddWithValue("@ReadStatus", readStatus);
                });

            isComplete = true;
            return isComplete;
        }

        private static ConversationWithMetaData MapConversation(IDataReader reader)
        {
            ConversationWithMetaData conversation = new ConversationWithMetaData();

            int startingIndex = 0;
            conversation.Id = reader.GetSafeInt32(startingIndex++);
            conversation.Name = reader.GetSafeGuid(startingIndex++).ToString();

            int count = reader.GetSafeInt32(startingIndex++);

            conversation.TotalPages = (int)Math.Ceiling(count / (double)pageSize);
            conversation.Messages = new List<Message>();

            return conversation;
        }

        private static Message MapMessage(IDataReader reader)
        {
            Message message = new Message();

            int startingIndex = 0;
            message.Id = reader.GetSafeInt32(startingIndex++);
            message.UserId = reader.GetSafeInt32(startingIndex++);
            message.ConversationId = reader.GetSafeInt32(startingIndex++);
            message.Text = reader.GetSafeString(startingIndex++);
            message.ReadStatus = reader.GetSafeBool(startingIndex++);

            return message;
        }
    }
}
