-- SQL Server Database Tables for Timezone GeoJSON Data
-- Stores timezone boundaries and metadata from geopify time-zones GeoJSON files
-- This script can be safely re-run - it will drop and recreate all tables

-- Drop existing tables in reverse dependency order
IF OBJECT_ID('[GEO].[TimeZoneCoordinates]', 'U') IS NOT NULL
    DROP TABLE [GEO].[TimeZoneCoordinates];

IF OBJECT_ID('[GEO].[TimeZoneImportLog]', 'U') IS NOT NULL
    DROP TABLE [GEO].[TimeZoneImportLog];

IF OBJECT_ID('[GEO].[TimeZones]', 'U') IS NOT NULL
    DROP TABLE [GEO].[TimeZones];

-- Create GEO schema if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'GEO')
    EXECUTE ('CREATE SCHEMA [GEO]');

PRINT 'Dropped existing tables (if any)...';

-- Main timezones table
CREATE TABLE [GEO].[TimeZones] (
    [TimeZoneID] INT PRIMARY KEY IDENTITY(1,1),
    [TZID] VARCHAR(100) NOT NULL UNIQUE,
    [GeometryGeoJSON] VARBINARY(MAX),  -- Store as binary to avoid collation issues with UTF-8
    [GeometryType] VARCHAR(50),
    [BoundingBox_MinLat] DECIMAL(10, 8),
    [BoundingBox_MaxLat] DECIMAL(10, 8),
    [BoundingBox_MinLon] DECIMAL(11, 8),
    [BoundingBox_MaxLon] DECIMAL(11, 8),
    [FeatureCount] INT,
    [LoadedDate] DATETIME DEFAULT GETDATE(),
    [LastUpdated] DATETIME DEFAULT GETDATE(),
    [IsActive] BIT DEFAULT 1
);

-- Create index on TZID for faster lookups
CREATE INDEX IX_TimeZones_TZID ON [GEO].[TimeZones]([TZID]);
CREATE INDEX IX_TimeZones_IsActive ON [GEO].[TimeZones]([IsActive]);

-- Optional: Table for storing timezone boundary coordinates (if you want normalized storage)
-- This allows searching for specific coordinates
CREATE TABLE [GEO].[TimeZoneCoordinates] (
    [CoordinateID] BIGINT PRIMARY KEY IDENTITY(1,1),
    [TimeZoneID] INT NOT NULL,
    [SequenceOrder] INT,
    [Latitude] DECIMAL(10, 8) NOT NULL,
    [Longitude] DECIMAL(11, 8) NOT NULL,
    [RingIndex] INT,  -- For multi-ring polygons (outer ring = 0, holes > 0)
    CONSTRAINT FK_TimeZoneCoordinates_TimeZones FOREIGN KEY ([TimeZoneID]) 
        REFERENCES [GEO].[TimeZones]([TimeZoneID]) ON DELETE CASCADE
);

-- Create indexes for coordinate-based queries
CREATE INDEX IX_TimeZoneCoordinates_TimeZoneID ON [GEO].[TimeZoneCoordinates]([TimeZoneID]);
CREATE INDEX IX_TimeZoneCoordinates_LatLon ON [GEO].[TimeZoneCoordinates]([Latitude], [Longitude]);

-- Table for data import logs
CREATE TABLE [GEO].[TimeZoneImportLog] (
    [ImportLogID] INT PRIMARY KEY IDENTITY(1,1),
    [Filename] VARCHAR(255),
    [TZID] VARCHAR(100),
    [RecordsProcessed] INT,
    [Status] VARCHAR(50),
    [ErrorMessage] VARCHAR(MAX),
    [ImportStartTime] DATETIME,
    [ImportEndTime] DATETIME
);

-- Create index on import log
CREATE INDEX IX_TimeZoneImportLog_TZID ON [GEO].[TimeZoneImportLog]([TZID]);
CREATE INDEX IX_TimeZoneImportLog_Status ON [GEO].[TimeZoneImportLog]([Status]);

PRINT 'TimeZones tables created successfully!';
