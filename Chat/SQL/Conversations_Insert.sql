ALTER proc [dbo].[Conversations_Insert]
		@Id int OUT,
		@CreatedBy int,
		@UserIds [dbo].[Int_Table_Type] READONLY
as
/*
	Declare
		@_Id int,
		@_CreatedBy int = '1'

	Declare
		@_UserIds Int_Table_Type

	Insert into @_UserIds
		Values (1), (4)

	Execute [dbo].[Conversations_Insert]
		@_Id OUT,
		@_CreatedBy,
		@_UserIds

	Select *
		From [dbo].[Conversations]
		Where [Id] = @_Id

	Select *
		From [dbo].[UserConversations]
*/

BEGIN

		DECLARE @Name UNIQUEIDENTIFIER = NEWID()

		INSERT INTO 
				[dbo].[Conversations] (
					[Name],
					[CreatedBy]
			   ) VALUES (
					@Name,
					@CreatedBy
			   )

		SET @Id = SCOPE_IDENTITY()


		INSERT INTO
				[dbo].[UserConversations] (
					[ConversationId],
					[UserId]
				) 
				SELECT
					@Id,
					[Data]
				FROM
					@UserIds


END