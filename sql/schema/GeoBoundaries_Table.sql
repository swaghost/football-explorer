-- GeoBoundaries Table Schema
-- Supports multi-level administrative hierarchies (Country -> State -> County)
-- Allows tracking of parent administrative levels for each boundary

CREATE TABLE [GEO].[GeoBoundaries] (
    [GeoBoundaryID] INT PRIMARY KEY IDENTITY(1,1),
    [Name] VARCHAR(500) NOT NULL,
    
    -- Administrative Level Information
    [AdministrativeLevel] INT NOT NULL,  -- 0=Country, 1=State/Province, 2=County/District, 3=City/Municipality, 4=Sub-district
    [AdministrativeLevelType] VARCHAR(100),  -- "Country", "State", "Province", "County", "District", "City", "Municipality", etc.
    
    -- Parent Hierarchy: Level 0 (Country/Nation)
    [AdminLevel0_Name] VARCHAR(500),
    [AdminLevel0_Code] VARCHAR(3),  -- ISO 3166-1 Alpha-3
    
    -- Parent Hierarchy: Level 1 (State/Province)
    [AdminLevel1_Name] VARCHAR(500),
    [AdminLevel1_Code] VARCHAR(10),
    [AdminLevel1_Type] VARCHAR(100),  -- "State", "Province", "Region", "Territory", etc.
    
    -- Parent Hierarchy: Level 2 (County/District)
    [AdminLevel2_Name] VARCHAR(500),
    [AdminLevel2_Code] VARCHAR(10),
    [AdminLevel2_Type] VARCHAR(100),  -- "County", "District", "Parish", "Prefecture", etc.
    
    -- Parent Hierarchy: Level 3 (City/Municipality)
    [AdminLevel3_Name] VARCHAR(500),
    [AdminLevel3_Code] VARCHAR(10),
    [AdminLevel3_Type] VARCHAR(100),  -- "City", "Municipality", "Town", "Borough", etc.
    
    -- Parent Hierarchy: Level 4 (Sub-district/Division)
    [AdminLevel4_Name] VARCHAR(500),
    [AdminLevel4_Code] VARCHAR(10),
    [AdminLevel4_Type] VARCHAR(100),  -- "Sub-district", "Ward", "Division", "Zone", etc.
    
    -- Legacy/Denormalized Columns (for backward compatibility)
    [NationCode2] VARCHAR(2),
    [NationCode3] VARCHAR(3),
    [StateProvinceName] VARCHAR(500),
    [StateProvinceCode] VARCHAR(10),
    [CountyName] VARCHAR(255),
    
    -- Geometry and Spatial Data
    [GeometryGeoJSON] VARBINARY(MAX),
    [GeometryType] VARCHAR(50),  -- "Polygon", "MultiPolygon"
    [BoundingBox_MinLat] DECIMAL(10, 8),
    [BoundingBox_MaxLat] DECIMAL(10, 8),
    [BoundingBox_MinLon] DECIMAL(11, 8),
    [BoundingBox_MaxLon] DECIMAL(11, 8),
    [FeatureCount] INT,
    
    -- Metadata
    [LoadedDate] DATETIME DEFAULT GETDATE(),
    [LastUpdated] DATETIME DEFAULT GETDATE(),
    [IsActive] BIT DEFAULT 1
);

-- Indexes for Common Queries
CREATE INDEX IX_GeoBoundaries_Name ON [GEO].[GeoBoundaries]([Name]);
CREATE INDEX IX_GeoBoundaries_AdminLevel ON [GEO].[GeoBoundaries]([AdministrativeLevel]);
CREATE INDEX IX_GeoBoundaries_AdminLevel0 ON [GEO].[GeoBoundaries]([AdminLevel0_Code]) WHERE [AdminLevel0_Code] IS NOT NULL;
CREATE INDEX IX_GeoBoundaries_AdminLevel1 ON [GEO].[GeoBoundaries]([AdminLevel1_Code]) WHERE [AdminLevel1_Code] IS NOT NULL;
CREATE INDEX IX_GeoBoundaries_AdminLevel2 ON [GEO].[GeoBoundaries]([AdminLevel2_Code]) WHERE [AdminLevel2_Code] IS NOT NULL;
CREATE INDEX IX_GeoBoundaries_AdminLevel3 ON [GEO].[GeoBoundaries]([AdminLevel3_Code]) WHERE [AdminLevel3_Code] IS NOT NULL;
CREATE INDEX IX_GeoBoundaries_AdminLevel4 ON [GEO].[GeoBoundaries]([AdminLevel4_Code]) WHERE [AdminLevel4_Code] IS NOT NULL;
CREATE INDEX IX_GeoBoundaries_Hierarchy ON [GEO].[GeoBoundaries]([AdminLevel0_Code], [AdminLevel1_Code], [AdminLevel2_Code], [AdminLevel3_Code], [AdminLevel4_Code]);
CREATE INDEX IX_GeoBoundaries_IsActive ON [GEO].[GeoBoundaries]([IsActive]);

PRINT 'GeoBoundaries table created successfully!';
PRINT '';
PRINT 'Supported administrative hierarchy examples:';
PRINT '  Level 0 (Country): USA';
PRINT '  Level 1 (State): Wisconsin';
PRINT '  Level 2 (County): Milwaukee County';
PRINT '  Level 3 (City): Milwaukee';
PRINT '  Level 4 (Sub-district): Downtown Milwaukee Ward 3';
