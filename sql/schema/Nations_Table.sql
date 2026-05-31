-- ============================================================================
-- SQL Server Table: Store Nations GeoJSON Data
-- ============================================================================
-- Purpose: Stores country/nation boundaries and metadata from NATIONS.geojson
-- Source: Natural Earth ne_10m_admin_0_countries dataset
-- Features: 259 countries with MultiPolygon geometries
--
-- Schema: GEO
-- ============================================================================

-- Drop table if exists (for idempotent script)
IF OBJECT_ID('[GEO].[NationsGeoJson]', 'U') IS NOT NULL
    DROP TABLE [GEO].[NationsGeoJson];

-- Create NationsGeoJson table
CREATE TABLE [GEO].[NationsGeoJson] (
    -- Primary Key
    [NationID] INT PRIMARY KEY IDENTITY(1,1),
    
    -- Identification
    [Name] VARCHAR(100) NOT NULL,
    [ISO3166_1_Alpha2] VARCHAR(2) UNIQUE,          -- e.g., 'ID' for Indonesia
    [ISO3166_1_Alpha3] VARCHAR(3) UNIQUE,          -- e.g., 'IDN' for Indonesia
    
    -- Geometry
    [GeometryGeoJSON] VARBINARY(MAX),              -- Stored as UTF-8 encoded JSON
    [GeometryType] VARCHAR(50),                    -- MultiPolygon, Polygon, etc.
    
    -- Bounding Box
    [BoundingBox_MinLat] DECIMAL(10, 8),
    [BoundingBox_MaxLat] DECIMAL(10, 8),
    [BoundingBox_MinLon] DECIMAL(11, 8),
    [BoundingBox_MaxLon] DECIMAL(11, 8),
    
    -- Feature Count
    [FeatureCount] INT,                            -- Number of polygons in geometry
    
    -- Metadata
    [LoadedDate] DATETIME DEFAULT GETDATE(),
    [LastUpdated] DATETIME DEFAULT GETDATE(),
    [IsActive] BIT DEFAULT 1
);

-- Create indexes for fast lookups
CREATE INDEX IX_NationsGeoJson_Name ON [GEO].[NationsGeoJson]([Name]);
CREATE INDEX IX_NationsGeoJson_ISO2 ON [GEO].[NationsGeoJson]([ISO3166_1_Alpha2]);
CREATE INDEX IX_NationsGeoJson_ISO3 ON [GEO].[NationsGeoJson]([ISO3166_1_Alpha3]);
CREATE INDEX IX_NationsGeoJson_IsActive ON [GEO].[NationsGeoJson]([IsActive]);

-- Create spatial index on bounding box for location queries
CREATE INDEX IX_NationsGeoJson_BoundingBox ON [GEO].[NationsGeoJson](
    [BoundingBox_MinLat],
    [BoundingBox_MaxLat],
    [BoundingBox_MinLon],
    [BoundingBox_MaxLon]
);

-- Optional: Table for nation import logs
IF OBJECT_ID('[GEO].[NationGeoJsonImportLog]', 'U') IS NOT NULL
    DROP TABLE [GEO].[NationGeoJsonImportLog];

CREATE TABLE [GEO].[NationGeoJsonImportLog] (
    [ImportLogID] INT PRIMARY KEY IDENTITY(1,1),
    [RecordsProcessed] INT,
    [RecordsSuccessful] INT,
    [RecordsFailed] INT,
    [Status] VARCHAR(50),
    [ErrorMessage] VARCHAR(MAX),
    [ImportStartTime] DATETIME,
    [ImportEndTime] DATETIME
);

PRINT 'NationsGeoJson table created successfully!';
PRINT 'Total tables: 2 (NationsGeoJson, NationGeoJsonImportLog)';
PRINT 'Schema: GEO';
PRINT 'Ready for data import.';
