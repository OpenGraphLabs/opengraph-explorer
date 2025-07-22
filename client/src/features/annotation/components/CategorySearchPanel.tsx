import React, { useState, useCallback, useRef, useEffect } from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { MagnifyingGlass, Check, X, CaretDown, CaretUp } from "phosphor-react";
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
  placeholder = "Search for categories (e.g., desk, chair, table...)",
  dictionaryId = 1,
}: CategorySearchPanelProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { categories, isLoading, error } = useSearchCategories(searchTerm, dictionaryId);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(value.length > 0);
    setHighlightedIndex(-1);
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((category: CategoryRead) => {
    onCategorySelect?.(category);
    setSearchTerm("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  }, [onCategorySelect]);

  // Handle clear selection
  const handleClear = useCallback(() => {
    onCategorySelect?.(null as any);
    setSearchTerm("");
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, [onCategorySelect]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || categories.length === 0) return;

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
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, categories, highlightedIndex, handleCategorySelect]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            borderRadius: "2px",
            padding: "0 2px",
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
    <Box style={{ position: "relative", width: "100%" }}>
      {/* Selected Category Display */}
      {selectedCategory && !isOpen && (
        <Box
          style={{
            background: theme.colors.interactive.primary,
            color: theme.colors.text.inverse,
            borderRadius: theme.borders.radius.md,
            padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
            marginBottom: theme.spacing.semantic.component.sm,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Text
              size="2"
              style={{
                fontWeight: 600,
                color: theme.colors.text.inverse,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              {selectedCategory.name}
            </Text>
            <Text
              size="1"
              style={{
                color: theme.colors.text.inverse,
                opacity: 0.8,
                fontSize: "11px",
              }}
            >
              Category ID: {selectedCategory.id}
            </Text>
          </Box>
          
          <Button
            onClick={handleClear}
            style={{
              background: "transparent",
              color: theme.colors.text.inverse,
              border: "none",
              borderRadius: theme.borders.radius.sm,
              padding: theme.spacing.semantic.component.xs,
              cursor: "pointer",
              opacity: 0.8,
              transition: theme.animations.transitions.all,
            }}
          >
            <X size={14} />
          </Button>
        </Box>
      )}

      {/* Search Input */}
      <Box style={{ position: "relative" }}>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length > 0 && setIsOpen(true)}
          placeholder={selectedCategory ? "Search for a different category..." : placeholder}
          style={{
            width: "100%",
            background: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.sm,
            padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
            paddingLeft: "40px",
            fontSize: "13px",
            outline: "none",
            transition: theme.animations.transitions.all,
          }}
        />
        
        <Box
          style={{
            position: "absolute",
            left: theme.spacing.semantic.component.sm,
            top: "50%",
            transform: "translateY(-50%)",
            color: theme.colors.text.tertiary,
            pointerEvents: "none",
          }}
        >
          <MagnifyingGlass size={16} />
        </Box>

        {isOpen && (
          <Box
            style={{
              position: "absolute",
              right: theme.spacing.semantic.component.sm,
              top: "50%",
              transform: "translateY(-50%)",
              color: theme.colors.text.tertiary,
              pointerEvents: "none",
            }}
          >
            <CaretDown size={12} />
          </Box>
        )}
      </Box>

      {/* Dropdown Results */}
      {isOpen && (
        <Box
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.md,
            boxShadow: theme.shadows.semantic.overlay.popover,
            marginTop: theme.spacing.semantic.component.xs,
            maxHeight: "240px",
            overflowY: "auto",
          }}
        >
          {isLoading && (
            <Box
              style={{
                padding: theme.spacing.semantic.component.md,
                textAlign: "center",
              }}
            >
              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  fontStyle: "italic",
                }}
              >
                Searching...
              </Text>
            </Box>
          )}

          {error && (
            <Box
              style={{
                padding: theme.spacing.semantic.component.md,
                textAlign: "center",
              }}
            >
              <Text
                size="2"
                style={{
                  color: theme.colors.status.error,
                }}
              >
                Error loading categories
              </Text>
            </Box>
          )}

          {!isLoading && !error && categories.length === 0 && searchTerm && (
            <Box
              style={{
                padding: theme.spacing.semantic.component.md,
                textAlign: "center",
              }}
            >
              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  fontStyle: "italic",
                }}
              >
                No categories found for "{searchTerm}"
              </Text>
            </Box>
          )}

          {!isLoading && !error && categories.length > 0 && (
            <>
              <Box
                style={{
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.md}`,
                  borderBottom: `1px solid ${theme.colors.border.subtle}`,
                  background: theme.colors.background.secondary,
                }}
              >
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {categories.length} result{categories.length !== 1 ? 's' : ''}
                </Text>
              </Box>

              {categories.map((category, index) => (
                <Box
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  style={{
                    padding: theme.spacing.semantic.component.sm,
                    cursor: "pointer",
                    background: highlightedIndex === index 
                      ? `${theme.colors.interactive.primary}20` 
                      : "transparent",
                    borderBottom: index < categories.length - 1 
                      ? `1px solid ${theme.colors.border.subtle}20` 
                      : "none",
                    transition: theme.animations.transitions.all,
                  }}
                >
                  <Text
                    size="2"
                    style={{
                      fontWeight: 600,
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing.semantic.component.xs,
                    }}
                  >
                    {highlightMatch(category.name, searchTerm)}
                  </Text>
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.text.secondary,
                      fontSize: "11px",
                      lineHeight: 1.4,
                    }}
                  >
                    ID: {category.id} • Created: {new Date(category.created_at).toLocaleDateString()}
                  </Text>
                </Box>
              ))}
            </>
          )}
        </Box>
      )}
    </Box>
  );
} 