ALTER proc [dbo].[Messages_Insert]
		@Id int OUT,
		@ConversationId int,
		@UserId int,
		@Text nvarchar(MAX),
		@ReadStatus bit

as
/*
	Declare
		@_Id int,
		@_ConversationId int = 2,
		@_UserId int = 4,
		@_Text nvarchar(MAX) = 'you up?',
		@_ReadStatus bit = 0

	Execute [dbo].[Messages_Insert]
		@_Id OUT,
		@_ConversationId,
		@_UserId,
		@_Text,
		@_ReadStatus

	Select *
		From [dbo].[Messages]
		Where [Id] = @_Id

	Select *
		From [dbo].[UserMessages]
		Where [MessageId] = @_Id

	Select *
		From [dbo].[MessageRecipients]
		Where [MessageId] = @_Id
*/

BEGIN

		INSERT INTO 
				[dbo].[Messages] (
					[ConversationId],
					[Text]
			   ) VALUES (
					@ConversationId,
					@Text
			   )

		SET @Id = SCOPE_IDENTITY();

		INSERT INTO
				[dbo].[UserMessages] (
					[UserId],
					[MessageId]
				) VALUES (
					@UserId,
					@Id
				)


		DECLARE @RecipientIds [dbo].[Int_Table_Type]

		INSERT INTO
				@RecipientIds
		SELECT
			[UserId]
		FROM
			[dbo].[UserConversations]
		WHERE
			[ConversationId] = @ConversationId
			AND
			[UserId] != @UserId


		INSERT INTO
			[dbo].[MessageRecipients] (
				[UserId],
				[ConversationId],
				[MessageId],
				[ReadStatus]
			) 
			SELECT
				[Data],
				@ConversationId,
				@Id,
				@ReadStatus
			FROM
				@RecipientIds


END