ALTER PROC [dbo].[Messages_SelectPagedbyConversation]
	@ConversationId int,
	@UserId int,
	@PageIndex int,
	@PageSize int

AS
/*
	DECLARE 
		@_ConversationId int = 85, 
		@_UserId int = 1,
		@_PageIndex int = 1,
		@_PageSize int = 20

	EXEC [dbo].[Messages_SelectPagedbyConversation]
		@_ConversationId,
		@_UserId,
		@_PageIndex,
		@_PageSize
*/
BEGIN

	SELECT
		m.[Id],
		um.[UserId],
		m.[ConversationId],
		m.[Text],
		mr.[ReadStatus]
	FROM
		[dbo].[Messages] AS m
	LEFT JOIN [dbo].[UserMessages] AS um ON m.[Id] = um.[MessageId]
	LEFT JOIN [dbo].[MessageRecipients] AS mr ON m.[Id] = mr.[MessageId] AND mr.[UserId] = @UserId
	WHERE m.[ConversationId] = @ConversationId
	ORDER BY m.[DateCreated] ASC
	OFFSET @PageSize * @PageIndex ROWS
	FETCH NEXT @PageSize ROWS ONLY


END


