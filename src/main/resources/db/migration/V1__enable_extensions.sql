-- Required for the reservation date-range exclusion constraint (V6), which
-- combines an equality check (vehicle_id) with a range-overlap check (daterange)
-- in a single GiST index.
CREATE EXTENSION IF NOT EXISTS btree_gist;
