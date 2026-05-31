-- =============================================================================
-- Update LongitudinalHemisphereID and LatitudinalHemisphereID
-- for GEO.Nations based on stored centroid coordinates.
--
-- LongitudinalHemisphereID : 0 = Unknown, 1 = West (lng < 0), 2 = East (lng > 0)
-- LatitudinalHemisphereID  : 0 = Equatorial (|lat| <= 10), 1 = Northern, 2 = Southern
-- =============================================================================

UPDATE [GEO].[Nations]
SET
    LongitudinalHemisphereID = CASE
        WHEN Longitude IS NULL  THEN 0          -- Unknown
        WHEN Longitude  < 0     THEN 1          -- West
        WHEN Longitude  > 0     THEN 2          -- East
        ELSE                         0          -- Exactly 0 / Unknown
    END,

    LatitudinalHemisphereID = CASE
        WHEN Latitude IS NULL        THEN 0     -- Unknown
        WHEN ABS(Latitude) <= 10.0   THEN 0     -- Equatorial
        WHEN Latitude > 10.0         THEN 1     -- Northern
        WHEN Latitude < -10.0        THEN 2     -- Southern
        ELSE                              0     -- Unknown
    END

WHERE Latitude IS NOT NULL
   OR Longitude IS NOT NULL;

-- Summary counts after update
SELECT
    LongitudinalHemisphereID,
    CASE LongitudinalHemisphereID
        WHEN 0 THEN 'Unknown'
        WHEN 1 THEN 'West'
        WHEN 2 THEN 'East'
    END AS LongitudinalHemisphere,
    COUNT(*) AS Count
FROM [GEO].[Nations]
GROUP BY LongitudinalHemisphereID
ORDER BY LongitudinalHemisphereID;

SELECT
    LatitudinalHemisphereID,
    CASE LatitudinalHemisphereID
        WHEN 0 THEN 'Equatorial / Unknown'
        WHEN 1 THEN 'Northern'
        WHEN 2 THEN 'Southern'
    END AS LatitudinalHemisphere,
    COUNT(*) AS Count
FROM [GEO].[Nations]
GROUP BY LatitudinalHemisphereID
ORDER BY LatitudinalHemisphereID;
