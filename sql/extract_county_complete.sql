-- ============================================================================
-- SQL Function: Extract County Name from Location String
-- ============================================================================
-- Purpose: Extracts county name from a location string
-- Format: "City, County Name County, State, Country"
-- Example: "Wauwatosa, Milwaukee County, Wisconsin, United States" 
--          returns "Milwaukee County"
--
-- Usage:
--   SELECT dbo.ExtractCountyName('Wauwatosa, Milwaukee County, Wisconsin, United States')
--
-- Returns: VARCHAR(MAX) - County name or NULL if not found
-- ============================================================================

-- Drop function if it exists
IF OBJECT_ID('dbo.ExtractCountyName', 'FN') IS NOT NULL
    DROP FUNCTION dbo.ExtractCountyName;
GO

CREATE FUNCTION [dbo].[ExtractCountyName](@LocationString NVARCHAR(MAX))
RETURNS NVARCHAR(MAX)
AS
BEGIN
    DECLARE @CountyPos INT;
    DECLARE @CommaBeforeCounty INT;
    DECLARE @CountyName NVARCHAR(MAX);
    DECLARE @i INT;
    
    -- Find position of " County" in the string
    SET @CountyPos = CHARINDEX(' County', @LocationString);
    
    -- If no " County" found, return NULL
    IF @CountyPos = 0
        RETURN NULL;
    
    -- Search backwards from @CountyPos to find the preceding comma
    SET @CommaBeforeCounty = 0;
    SET @i = @CountyPos - 1;
    
    WHILE @i > 0
    BEGIN
        IF SUBSTRING(@LocationString, @i, 1) = ','
        BEGIN
            SET @CommaBeforeCounty = @i;
            BREAK;
        END
        SET @i = @i - 1;
    END
    
    -- If no preceding comma found, return NULL
    IF @CommaBeforeCounty = 0
        RETURN NULL;
    
    -- Extract county name from after the comma to before " County"
    SET @CountyName = LTRIM(RTRIM(
        SUBSTRING(@LocationString, @CommaBeforeCounty + 1, @CountyPos - @CommaBeforeCounty - 1)
    ));
    
    RETURN @CountyName;
END;
GO

PRINT 'ExtractCountyName function created successfully!';
PRINT '';
PRINT 'Test Examples:';
PRINT '==============';
