-- SQL Script: Extract County Name from Location String
-- Extracts county name from format: "City, County Name County, State, Country"
-- Example: "Wauwatosa, Milwaukee County, Wisconsin, United States" -> "Milwaukee County"

-- Create function to extract county name
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
    -- Length = (position of " County") - (position of comma) - 1
    SET @CountyName = LTRIM(RTRIM(
        SUBSTRING(@LocationString, @CommaBeforeCounty + 1, @CountyPos - @CommaBeforeCounty - 1)
    ));
    
    RETURN @CountyName;
END;

GO

-- Test the function with various inputs
PRINT 'Testing County Name Extraction';
PRINT '================================================================================';
PRINT '';

-- Test Case 1: Standard format with county
SELECT 
    'Test 1: Standard format' AS TestName,
    'Wauwatosa, Milwaukee County, Wisconsin, United States' AS LocationString,
    [dbo].[ExtractCountyName]('Wauwatosa, Milwaukee County, Wisconsin, United States') AS ExtractedCounty;

PRINT '';

-- Test Case 2: Different county
SELECT 
    'Test 2: Cook County' AS TestName,
    'Chicago, Cook County, Illinois, United States' AS LocationString,
    [dbo].[ExtractCountyName]('Chicago, Cook County, Illinois, United States') AS ExtractedCounty;

PRINT '';

-- Test Case 3: Multi-word city
SELECT 
    'Test 3: Los Angeles' AS TestName,
    'Los Angeles, Los Angeles County, California, United States' AS LocationString,
    [dbo].[ExtractCountyName]('Los Angeles, Los Angeles County, California, United States') AS ExtractedCounty;

PRINT '';

-- Test Case 4: No county in string
SELECT 
    'Test 4: No county' AS TestName,
    'London, England, United Kingdom' AS LocationString,
    [dbo].[ExtractCountyName]('London, England, United Kingdom') AS ExtractedCounty;

PRINT '';

-- Example: Using in a query against a table
-- Uncomment if you have a table with location data:
/*
CREATE TABLE #LocationTest (
    LocationID INT,
    LocationString NVARCHAR(MAX)
);

INSERT INTO #LocationTest VALUES
    (1, 'Wauwatosa, Milwaukee County, Wisconsin, United States'),
    (2, 'Chicago, Cook County, Illinois, United States'),
    (3, 'New York, New York County, New York, United States'),
    (4, 'Houston, Harris County, Texas, United States'),
    (5, 'Phoenix, Maricopa County, Arizona, United States');

SELECT 
    LocationID,
    LocationString,
    [dbo].[ExtractCountyName](LocationString) AS CountyName
FROM #LocationTest
ORDER BY LocationID;

DROP TABLE #LocationTest;
*/

PRINT 'Function created successfully!';
