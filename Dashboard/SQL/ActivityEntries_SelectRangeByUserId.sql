ALTER PROC [dbo].[ActivityEntries_SelectRangeByUserIdV3]
					@UserId int,
					@Start datetime2(7),
					@End datetime2(7),
					@TimeZoneOffset int
AS
/*
	DECLARE @UserId INT = 1, @Start datetime2(7) = '2019-01-30', @End datetime2(7) = GETDATE(), @Offset int = 480

	EXEC [dbo].[ActivityEntries_SelectRangebyUserIdV2] @UserId, @Start, @End, @Offset
*/
BEGIN


	SELECT
		SUM([TimeElapsed]) as TotalTime,
		SUM([DistanceTravelled]) as TotalDistance,
		CONVERT(date, dateadd(minute, -@TimeZoneOffset, [DateCreated])) as WalkingDate
	FROM
		[dbo].[ActivityEntries]
	WHERE
		[UserId] = @UserId
		AND
		[DateCreated] 
			BETWEEN @Start
			AND @End
	GROUP BY CONVERT(date, dateadd(minute, -@TimeZoneOffset, [DateCreated]))


END