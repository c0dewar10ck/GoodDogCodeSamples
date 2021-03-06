ALTER PROC [dbo].[Conversations_SelectWithMetaDataV4]
	@UserId int

AS 
/*
	DECLARE @_UserId int = 4
	EXEC [dbo].[Conversations_SelectWithMetaDataV4]
			@_UserId
*/
BEGIN



	DECLARE @ConversationIds TABLE (
		[Id] int identity(1,1),
		[Data] int );

	WITH PartedByConvoId AS (
		SELECT
			ROW_NUMBER() OVER(PARTITION BY m.[ConversationId] ORDER BY m.[DateCreated] DESC) AS rn,
			m.[ConversationId],
			m.[DateCreated]		
		FROM [dbo].[Messages] as m
		INNER JOIN [dbo].[UserConversations] AS uc ON m.[ConversationId] = uc.[ConversationId]
		WHERE uc.[UserId] = @UserId 
	) INSERT INTO @ConversationIds
		SELECT
		c.[Id]
		FROM
			[dbo].[Conversations] AS c
		JOIN PartedByConvoId AS p ON c.[Id] = p.[ConversationId]
		WHERE rn = 1
		ORDER BY p.[DateCreated] DESC

	DECLARE @Counter int = 1,
			@LastRow int = (SELECT MAX([Id]) FROM @ConversationIds),
			@MessageIds [dbo].[Int_Table_Type]

	DECLARE @TotalMessageCounts TABLE (
		[TotalMessageCount] int,
		[ConversationId] int )

	SET @LastRow = @LastRow + 1

	WHILE(@Counter < @LastRow)
		BEGIN

			INSERT INTO @MessageIds
				SELECT
					m.[Id]
				FROM
					[dbo].[Messages] AS m
				INNER JOIN @ConversationIds AS ci ON m.[ConversationId] = ci.[Data] AND ci.[Id] = @Counter
				ORDER BY m.[DateCreated] DESC
				OFFSET 0 ROWS FETCH NEXT 17 ROWS ONLY

			DECLARE @ConversationId int = (SELECT [Data] FROM @ConversationIds as ci WHERE ci.[Id] = @Counter)

			INSERT INTO @TotalMessageCounts
				SELECT
					COUNT( [Id] ),
					@ConversationId
				FROM
					[dbo].[Messages]
				WHERE [ConversationId] = @ConversationId

			SET @Counter = @Counter + 1

		END;



	SELECT
		c.[Id],
		c.[Name],
		mc.[TotalMessageCount]
	FROM
		[dbo].[Conversations] AS c
	INNER JOIN @TotalMessageCounts AS mc ON mc.[ConversationId] = c.[Id]



	SELECT
		uc.[UserId],
		uc.[ConversationId]
	FROM
		[dbo].[UserConversations] as uc
	INNER JOIN @ConversationIds AS ci ON uc.[ConversationId] = ci.[Data]



	SELECT
		m.[Id],
		um.[UserId],
		m.[ConversationId],
		m.[Text],
		mr.[ReadStatus]
	FROM
		[dbo].[Messages] AS m
	INNER JOIN @MessageIds AS mi ON mi.[Data] = m.[Id]
	LEFT JOIN [dbo].[UserMessages] AS um ON m.[Id] = um.[MessageId]
	LEFT JOIN [dbo].[MessageRecipients] AS mr ON m.[Id] = mr.[MessageId]
	ORDER BY m.[DateCreated] ASC



END


