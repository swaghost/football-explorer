-- =============================================================================
-- Update LongitudinalHemisphereID and LatitudinalHemisphereID
-- for GEO.StatesProvinces by inheriting from the parent nation in GEO.Nations.
--
-- LongitudinalHemisphereID : 0 = Unknown, 1 = West, 2 = East
-- LatitudinalHemisphereID  : 0 = Equatorial, 1 = Northern, 2 = Southern
-- =============================================================================

UPDATE sp
SET
    sp.LongitudinalHemisphereID = ISNULL(n.LongitudinalHemisphereID, 0),
    sp.LatitudinalHemisphereID  = ISNULL(n.LatitudinalHemisphereID,  0)
FROM [GEO].[StatesProvinces] sp
INNER JOIN [GEO].[Nations] n
    ON n.NationCode3 = sp.NationCode3;

-- Summary counts after update
SELECT
    sp.LongitudinalHemisphereID,
    CASE sp.LongitudinalHemisphereID
        WHEN 0 THEN 'Unknown'
        WHEN 1 THEN 'West'
        WHEN 2 THEN 'East'
    END AS LongitudinalHemisphere,
    COUNT(*) AS Count
FROM [GEO].[StatesProvinces] sp
GROUP BY sp.LongitudinalHemisphereID
ORDER BY sp.LongitudinalHemisphereID;

SELECT
    sp.LatitudinalHemisphereID,
    CASE sp.LatitudinalHemisphereID
        WHEN 0 THEN 'Equatorial / Unknown'
        WHEN 1 THEN 'Northern'
        WHEN 2 THEN 'Southern'
    END AS LatitudinalHemisphere,
    COUNT(*) AS Count
FROM [GEO].[StatesProvinces] sp
GROUP BY sp.LatitudinalHemisphereID
ORDER BY sp.LatitudinalHemisphereID;
