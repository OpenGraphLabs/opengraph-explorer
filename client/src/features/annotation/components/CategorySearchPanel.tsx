import React, { useState, useCallback, useRef } from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { MagnifyingGlass, X, Sparkle } from "phosphor-react";
import { useSearchCategories } from "@/shared/hooks";
import type { CategoryRead } from "@/shared/api/generated/models";

interface CategorySearchPanelProps {
  onCategorySelect?: (category: CategoryRead) => void;
  selectedCategory?: CategoryRead | null;
  placeholder?: string;
  dictionaryId?: number;
}

export function CategorySearchPanel({
  onCategorySelect,
  selectedCategory,
  placeholder = "Search categories...",
  dictionaryId = 1,
}: CategorySearchPanelProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const { categories, isLoading, error, hasSearch } = useSearchCategories(searchTerm, dictionaryId);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setHighlightedIndex(-1);
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((category: CategoryRead) => {
    onCategorySelect?.(category);
    setHighlightedIndex(-1);
  }, [onCategorySelect]);

  // Handle clear selection
  const handleClear = useCallback(() => {
    onCategorySelect?.(null as any);
    setSearchTerm("");
    setHighlightedIndex(-1);
  }, [onCategorySelect]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (categories.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < categories.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : categories.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && categories[highlightedIndex]) {
          handleCategorySelect(categories[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [categories, highlightedIndex, handleCategorySelect]);

  // Highlight matching text
  const highlightMatch = useCallback((text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span
          key={index}
          style={{
            background: theme.colors.interactive.primary,
            color: theme.colors.text.inverse,
            fontWeight: 600,
            borderRadius: "3px",
            padding: "1px 3px",
          }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  }, [theme, searchTerm]);

  return (
    <Box style={{ width: "100%" }}>
      {/* Selected Category Display */}
      {selectedCategory && (
        <Box
          style={{
            background: `linear-gradient(135deg, ${theme.colors.interactive.primary}15, ${theme.colors.interactive.primary}08)`,
            border: `1px solid ${theme.colors.interactive.primary}30`,
            borderRadius: theme.borders.radius.lg,
            padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
            marginBottom: theme.spacing.semantic.component.md,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: theme.animations.transitions.all,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle background pattern */}
          <Box
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "60px",
              height: "100%",
              background: `linear-gradient(90deg, transparent, ${theme.colors.interactive.primary}05)`,
              pointerEvents: "none",
            }}
          />
          
          <Flex align="center" gap="3">
            <Box
              style={{
                background: theme.colors.interactive.primary,
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Sparkle size={16} style={{ color: theme.colors.text.inverse }} />
            </Box>
            
            <Box>
              <Text
                size="3"
                style={{
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                  marginBottom: "2px",
                }}
              >
                {selectedCategory.name}
              </Text>

            </Box>
          </Flex>
          
          <Button
            onClick={handleClear}
            style={{
              background: "transparent",
              color: theme.colors.text.secondary,
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: theme.animations.transitions.all,
              position: "relative",
              zIndex: 1,
            }}
          >
            <X size={16} />
          </Button>
        </Box>
      )}

      {/* Search Input */}
      <Box style={{ position: "relative", marginBottom: theme.spacing.semantic.component.md }}>
        <Box
          style={{
            position: "relative",
            border: `2px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.xl,
            background: theme.colors.background.primary,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: `0 1px 3px ${theme.colors.background.primary}20`,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              width: "100%",
              background: "transparent",
              color: theme.colors.text.primary,
              border: "none",
              borderRadius: theme.borders.radius.xl,
              padding: `${theme.spacing.semantic.component.md} 50px ${theme.spacing.semantic.component.md} 50px`,
              fontSize: "15px",
              fontWeight: 400,
              outline: "none",
              transition: theme.animations.transitions.all,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          />
          
          {/* Search Icon */}
          <Box
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: theme.colors.text.tertiary,
              transition: theme.animations.transitions.all,
              pointerEvents: "none",
            }}
          >
            <MagnifyingGlass size={20} />
          </Box>

          {/* Clear button */}
          {searchTerm && (
            <Button
              onClick={() => {
                setSearchTerm("");
                setHighlightedIndex(-1);
                inputRef.current?.focus();
              }}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                color: theme.colors.text.tertiary,
                border: "none",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: theme.animations.transitions.all,
              }}
            >
              <X size={14} />
            </Button>
          )}
        </Box>
      </Box>

      {/* Category List - Always Visible */}
      <Box
        style={{
          background: theme.colors.background.primary,
          border: `1px solid ${theme.colors.border.primary}20`,
          borderRadius: theme.borders.radius.lg,
          boxShadow: `0 2px 8px ${theme.colors.background.primary}20`,
          maxHeight: "280px",
          overflowY: "auto",
        }}
      >
        {isLoading && (
          <Box
            style={{
              padding: `${theme.spacing.semantic.component.lg} ${theme.spacing.semantic.component.md}`,
              textAlign: "center",
            }}
          >
            <Flex direction="column" align="center" gap="2">
              <Box
                style={{
                  width: "24px",
                  height: "24px",
                  border: `2px solid ${theme.colors.border.primary}`,
                  borderTopColor: theme.colors.interactive.primary,
                  borderRadius: "50%",
                  animation: 'spin 1s linear infinite',
                }}
              />
              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  fontWeight: 500,
                }}
              >
                Loading categories...
              </Text>
            </Flex>
          </Box>
        )}

        {error && (
          <Box
            style={{
              padding: theme.spacing.semantic.component.lg,
              textAlign: "center",
            }}
          >
            <Text
              size="2"
              style={{
                color: theme.colors.status.error,
                fontWeight: 500,
              }}
            >
              Unable to load categories
            </Text>
          </Box>
        )}

        {!isLoading && !error && categories.length === 0 && searchTerm && (
          <Box
            style={{
              padding: theme.spacing.semantic.component.lg,
              textAlign: "center",
            }}
          >
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                fontWeight: 500,
              }}
            >
              No categories found for "{searchTerm}"
            </Text>
          </Box>
        )}

        {!isLoading && !error && categories.length > 0 && (
          <>


            {/* Categories */}
            <Box style={{ padding: `${theme.spacing.semantic.component.xs} 0` }}>
              {categories.map((category, index) => (
                <Box
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  style={{
                    padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.lg}`,
                    cursor: "pointer",
                    background: highlightedIndex === index 
                      ? `${theme.colors.interactive.primary}12` 
                      : selectedCategory?.id === category.id
                      ? `${theme.colors.interactive.primary}08`
                      : "transparent",
                    borderLeft: highlightedIndex === index 
                      ? `3px solid ${theme.colors.interactive.primary}` 
                      : selectedCategory?.id === category.id
                      ? `3px solid ${theme.colors.interactive.primary}60`
                      : "3px solid transparent",
                    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.semantic.component.md,
                  }}
                >
                  <Box
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: selectedCategory?.id === category.id 
                        ? theme.colors.interactive.primary
                        : theme.colors.text.tertiary,
                      opacity: selectedCategory?.id === category.id ? 1 : 0.6,
                      flexShrink: 0,
                      transition: theme.animations.transitions.all,
                    }}
                  />
                  
                                     <Box style={{ flex: 1, minWidth: 0 }}>
                     <Text
                       size="2"
                       style={{
                         fontWeight: selectedCategory?.id === category.id ? 600 : 500,
                         color: theme.colors.text.primary,
                         overflow: "hidden",
                         textOverflow: "ellipsis",
                         whiteSpace: "nowrap",
                       }}
                     >
                       {highlightMatch(category.name, searchTerm)}
                     </Text>
                   </Box>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
} 