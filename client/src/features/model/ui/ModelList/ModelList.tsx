import React, { useState, useEffect } from 'react';
import { Grid, Flex, Text, Spinner, Box, Button } from '@radix-ui/themes';
import { MagnifyingGlassIcon, CodeIcon } from '@radix-ui/react-icons';
import { Link } from 'react-router-dom';
import { Model } from '../../types';
import { ModelCard } from '@/features/model';
import styles from '@/styles/Card.module.css';

interface ModelListProps {
  models: Model[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onModelClick: (model: Model) => void;
}

export function ModelList({ models, loading, error, onRetry, onModelClick }: ModelListProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !error) {
      setTimeout(() => setIsLoaded(true), 100);
    }
  }, [loading, error]);

  if (loading) {
    return (
      <Flex direction="column" align="center" gap="4" py="9" style={{ minHeight: "60vh", justifyContent: "center" }}>
        <Spinner size="3" className={styles.loadingPulse} />
        <Text size="3" style={{ fontWeight: 500 }}>
          Loading amazing models...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex 
        direction="column" 
        align="center" 
        gap="4" 
        py="9" 
        style={{ 
          minHeight: "60vh", 
          justifyContent: "center",
          background: "white",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
          border: "1px solid var(--gray-4)"
        }}
      >
        <Box
          className={styles.emptyState}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "var(--gray-3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CodeIcon width="32" height="32" style={{ color: "var(--gray-9)" }} />
        </Box>
        <Text size="6" style={{ fontWeight: 600 }}>
          Error Loading Models
        </Text>
        <Text size="3" color="gray" align="center" style={{ maxWidth: "400px" }}>
          {error}
        </Text>
        {onRetry && (
          <Button
            onClick={onRetry}
            style={{
              background: "#FF5733",
              color: "white",
              marginTop: "14px",
              borderRadius: "8px",
              fontWeight: 500,
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Retry
          </Button>
        )}
      </Flex>
    );
  }

  if (models.length === 0) {
    return (
      <Flex 
        direction="column" 
        align="center" 
        gap="4" 
        py="9"
        style={{ 
          minHeight: "60vh", 
          justifyContent: "center",
          background: "white",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
          border: "1px solid var(--gray-4)"
        }}
      >
        <Box
          className={styles.emptyState}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "var(--gray-3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MagnifyingGlassIcon width="32" height="32" style={{ color: "var(--gray-9)" }} />
        </Box>
        <Text size="6" style={{ fontWeight: 600 }}>
          No Models Found
        </Text>
        <Text
          size="3"
          color="gray"
          align="center"
          style={{ maxWidth: "400px", lineHeight: 1.6, letterSpacing: "0.01em" }}
        >
          No models match your search criteria. Try changing your search terms or filters.
        </Text>
        <Link to="/upload">
          <Button
            style={{
              background: "#FF5733",
              color: "white",
              marginTop: "14px",
              borderRadius: "8px",
              fontWeight: 500,
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Upload Model
          </Button>
        </Link>
      </Flex>
    );
  }

  return (
    <Grid 
      columns={{ initial: "1", sm: "2", lg: "3" }} 
      gap="5" 
      className={styles.modelGrid}
      style={{
        maxWidth: "100%",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
      }}
    >
      {models.map((model, index) => (
        <div
          key={model.id}
          style={{ 
            animationDelay: `${index * 50}ms`,
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
            height: "100%",
          }}
        >
          <ModelCard
            model={model}
            onClick={() => onModelClick(model)}
            onViewDetails={() => onModelClick(model)}
          />
        </div>
      ))}
    </Grid>
  );
} 