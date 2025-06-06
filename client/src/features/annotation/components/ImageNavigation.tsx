import {
  Flex,
  Text,
  Button,
  Progress,
} from "@radix-ui/themes";
import { CaretLeft, CaretRight } from "phosphor-react";

interface ImageNavigationProps {
  currentIndex: number;
  totalImages: number;
  onNext: () => void;
  onPrevious: () => void;
  onIndexChange?: (index: number) => void;
  loadingProgress?: number;
}

export function ImageNavigation({
  currentIndex,
  totalImages,
  onNext,
  onPrevious,
  onIndexChange,
  loadingProgress,
}: ImageNavigationProps) {
  const hasNext = currentIndex < totalImages - 1;
  const hasPrevious = currentIndex > 0;

  return (
    <Flex direction="column" gap="3">
      {/* Progress bar for loading */}
      {loadingProgress !== undefined && loadingProgress < 100 && (
        <Flex direction="column" gap="2">
          <Text size="2" style={{ color: "var(--gray-11)" }}>
            Loading images... {Math.round(loadingProgress)}%
          </Text>
          <Progress value={loadingProgress} style={{ width: "100%" }} />
        </Flex>
      )}

      {/* Navigation controls */}
      <Flex justify="between" align="center">
        <Button
          variant="soft"
          size="2"
          onClick={onPrevious}
          disabled={!hasPrevious}
          style={{
            cursor: hasPrevious ? "pointer" : "not-allowed",
            opacity: hasPrevious ? 1 : 0.5,
          }}
        >
          <CaretLeft size={16} />
          Previous
        </Button>

        <Flex align="center" gap="3">
          <Text size="3" weight="medium">
            {currentIndex + 1} of {totalImages}
          </Text>
          
          {/* Quick jump input */}
          {onIndexChange && totalImages > 5 && (
            <Flex align="center" gap="2">
              <Text size="2" style={{ color: "var(--gray-11)" }}>
                Go to:
              </Text>
              <input
                type="number"
                min={1}
                max={totalImages}
                value={currentIndex + 1}
                onChange={(e) => {
                  const newIndex = parseInt(e.target.value) - 1;
                  if (newIndex >= 0 && newIndex < totalImages) {
                    onIndexChange(newIndex);
                  }
                }}
                style={{
                  width: "60px",
                  padding: "4px 8px",
                  border: "1px solid var(--gray-6)",
                  borderRadius: "4px",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              />
            </Flex>
          )}
        </Flex>

        <Button
          variant="soft"
          size="2"
          onClick={onNext}
          disabled={!hasNext}
          style={{
            cursor: hasNext ? "pointer" : "not-allowed",
            opacity: hasNext ? 1 : 0.5,
          }}
        >
          Next
          <CaretRight size={16} />
        </Button>
      </Flex>

      {/* Keyboard shortcuts hint */}
      <Text size="1" style={{ color: "var(--gray-9)", textAlign: "center" }}>
        Use ← → arrow keys to navigate
      </Text>
    </Flex>
  );
} 