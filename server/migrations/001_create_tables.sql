-- Create annotators table
CREATE TABLE annotators (
    id BIGSERIAL PRIMARY KEY,
    sui_address VARCHAR(200) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create missions table
CREATE TABLE missions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    mission_type VARCHAR(20) NOT NULL CHECK (mission_type IN ('label_annotation', 'bbox_annotation')),
    total_items INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create mission_scores table
CREATE TABLE mission_scores (
    id BIGSERIAL PRIMARY KEY,
    mission_id BIGINT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    annotator_id BIGINT NOT NULL REFERENCES annotators(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(mission_id, annotator_id)
);

-- Create indexes for better performance
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_type ON missions(mission_type);
CREATE INDEX idx_mission_scores_mission_id ON mission_scores(mission_id);
CREATE INDEX idx_mission_scores_annotator_id ON mission_scores(annotator_id);
CREATE INDEX idx_mission_scores_score ON mission_scores(score DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_annotators_updated_at BEFORE UPDATE ON annotators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mission_scores_updated_at BEFORE UPDATE ON mission_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 