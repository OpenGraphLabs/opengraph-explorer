-- Create mission_ground_truths table
CREATE TABLE IF NOT EXISTS mission_ground_truths (
    id BIGSERIAL PRIMARY KEY,
    mission_id BIGINT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    item_id VARCHAR(100) NOT NULL,
    labels JSONB NOT NULL DEFAULT '[]',
    bounding_boxes JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(mission_id, item_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mission_ground_truths_mission_id ON mission_ground_truths(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_ground_truths_item_id ON mission_ground_truths(item_id);
CREATE INDEX IF NOT EXISTS idx_mission_ground_truths_labels ON mission_ground_truths USING GIN (labels);
CREATE INDEX IF NOT EXISTS idx_mission_ground_truths_bboxes ON mission_ground_truths USING GIN (bounding_boxes);

-- Create trigger for updated_at
CREATE TRIGGER update_mission_ground_truths_updated_at BEFORE UPDATE ON mission_ground_truths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 