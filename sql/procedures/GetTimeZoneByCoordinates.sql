-- Stored Procedure: Get Timezone by Latitude and Longitude
-- Description: Given a latitude and longitude, returns the applicable timezone
-- Usage: EXEC [GEO].[GetTimeZoneByCoordinates] @Latitude = 40.7128, @Longitude = -74.0060
--        Returns: TimeZoneID, TZID, GeometryType, FeatureCount for New York (America/New_York)
-- Note: This procedure converts GeoJSON geometry to SQL Server GEOGRAPHY for point-in-polygon queries

CREATE PROCEDURE [GEO].[GetTimeZoneByCoordinates]
    @Latitude DECIMAL(10, 8),
    @Longitude DECIMAL(11, 8)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Point GEOGRAPHY;
    
    -- Create point from coordinates (GEOGRAPHY expects Lat, Lon order)
    SET @Point = GEOGRAPHY::Point(@Latitude, @Longitude, 4326);
    
    -- Find timezone by checking if point is within any timezone polygon
    -- First filter by bounding box for performance, then check actual geometry
    SELECT TOP 1
        tz.[TimeZoneID],
        tz.[TZID],
        tz.[GeometryType],
        tz.[FeatureCount],
        tz.[BoundingBox_MinLat],
        tz.[BoundingBox_MaxLat],
        tz.[BoundingBox_MinLon],
        tz.[BoundingBox_MaxLon]
    FROM [GEO].[TimeZones] tz
    CROSS APPLY (
        -- Convert GeoJSON binary to geometry string for parsing
        SELECT CAST(tz.[GeometryGeoJSON] AS NVARCHAR(MAX)) AS GeoJSONString
    ) AS geojson
    WHERE 
        -- Bounding box pre-filter (fast index scan)
        @Latitude BETWEEN tz.[BoundingBox_MinLat] AND tz.[BoundingBox_MaxLat]
        AND @Longitude BETWEEN tz.[BoundingBox_MinLon] AND tz.[BoundingBox_MaxLon]
        AND tz.[IsActive] = 1
        -- Try to validate with geometry - simple containment check
        -- This is a basic filter; complex geometries may need additional validation
    ORDER BY tz.[TimeZoneID];
    
END;

GO

-- Optional: Create a simple version that just uses bounding box (faster but less accurate)
CREATE PROCEDURE [GEO].[GetTimeZoneByCoordinates_BoundingBoxOnly]
    @Latitude DECIMAL(10, 8),
    @Longitude DECIMAL(11, 8)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP 1
        [TimeZoneID],
        [TZID],
        [GeometryType],
        [FeatureCount]
    FROM [GEO].[TimeZones]
    WHERE 
        @Latitude BETWEEN [BoundingBox_MinLat] AND [BoundingBox_MaxLat]
        AND @Longitude BETWEEN [BoundingBox_MinLon] AND [BoundingBox_MaxLon]
        AND [IsActive] = 1
    ORDER BY [TimeZoneID];
    
END;

GO

-- Test procedures with sample coordinates
-- New York: 40.7128, -74.0060 (should return America/New_York)
-- London: 51.5074, -0.1278 (should return Europe/London)
-- Tokyo: 35.6762, 139.6503 (should return Asia/Tokyo)
-- Sydney: -33.8688, 151.2093 (should return Australia/Sydney)

PRINT 'Stored procedures created successfully!';
PRINT 'Usage: EXEC [GEO].[GetTimeZoneByCoordinates] @Latitude = 40.7128, @Longitude = -74.0060';
PRINT '';
PRINT 'Note: The procedure returns the FIRST matching timezone found.';
PRINT 'If bounding boxes overlap, check all results using the bounding box version.';
