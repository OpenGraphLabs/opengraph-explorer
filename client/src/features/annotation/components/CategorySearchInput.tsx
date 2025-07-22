import React, { useState, useRef, useEffect } from 'react';
import { Box, Flex, Text, Button } from '@/shared/ui/design-system/components';
import { useTheme } from '@/shared/ui/design-system';
import { MagnifyingGlassIcon, ChevronDownIcon, CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import { useSearchCategories } from '@/shared/hooks/useDictionaryCategories';

export interface CategorySearchInputProps {
  placeholder?: string;
  selectedCategory?: { id: number; name: string } | null;
  onCategorySelect: (category: { id: number; name: string } | null) => void;
  onSearchChange?: (query: string) => void;
  className?: string;
  dictionaryId?: number;
}

export function CategorySearchInput({
  placeholder = "Search categories...",
  selectedCategory,
  onCategorySelect,
  onSearchChange,
  className,
  dictionaryId = 1,
}: CategorySearchInputProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { categories, isLoading } = useSearchCategories(query, dictionaryId);

  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(query);
    }
  }, [query, onSearchChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setFocusedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < categories.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && categories[focusedIndex]) {
          handleCategorySelect(categories[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleCategorySelect = (category: { id: number; name: string }) => {
    setQuery('');
    setIsOpen(false);
    setFocusedIndex(-1);
    onCategorySelect(category);
    inputRef.current?.blur();
  };

  const handleClearSelection = () => {
    setQuery('');
    onCategorySelect(null);
    inputRef.current?.focus();
  };

  const displayValue = selectedCategory ? selectedCategory.name : query;

  return (
    <Box className={className} style={{ position: 'relative', width: '100%' }}>
      {/* Input Container */}
      <Box
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: theme.colors.background.card,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borders.radius.full,
          transition: theme.animations.transitions.all,
          boxShadow: theme.shadows.base.sm,
          padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
        }}
        onFocusCapture={(e) => {
          e.currentTarget.style.boxShadow = theme.shadows.semantic.interactive.focus;
          e.currentTarget.style.borderColor = theme.colors.interactive.primary;
        }}
        onBlurCapture={(e) => {
          if (!isOpen) {
            e.currentTarget.style.boxShadow = theme.shadows.base.sm;
            e.currentTarget.style.borderColor = theme.colors.border.primary;
          }
        }}
      >
        <MagnifyingGlassIcon 
          width="20" 
          height="20" 
          style={{ 
            color: theme.colors.text.tertiary,
            marginRight: theme.spacing.semantic.component.md,
          }} 
        />
        
        <input
          ref={inputRef}
          type="text"
          placeholder={selectedCategory ? selectedCategory.name : placeholder}
          value={selectedCategory ? '' : query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: theme.typography.body.fontSize,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI Variable, Segoe UI, system-ui, Roboto, Helvetica Neue, Arial, sans-serif',
            color: theme.colors.text.primary,
          }}
        />

        {/* Selected Category Display */}
        {selectedCategory && (
          <Flex align="center" gap="2" style={{ marginRight: theme.spacing[2] }}>
            <Box
              style={{
                background: theme.colors.interactive.primary,
                color: 'white',
                padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                borderRadius: theme.borders.radius.sm,
                fontSize: theme.typography.caption.fontSize,
                fontWeight: theme.typography.labelLarge.fontWeight,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[1],
              }}
            >
              <CheckIcon width="12" height="12" />
              {selectedCategory.name}
            </Box>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearSelection}
              style={{
                padding: theme.spacing[1],
                minWidth: 'auto',
                borderRadius: theme.borders.radius.sm,
              }}
            >
              <Cross2Icon width="12" height="12" />
            </Button>
          </Flex>
        )}

        {!selectedCategory && (
          <ChevronDownIcon 
            width="16" 
            height="16" 
            style={{ 
              color: theme.colors.text.tertiary,
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: theme.animations.transitions.all,
            }} 
          />
        )}
      </Box>

      {/* Dropdown */}
      {isOpen && !selectedCategory && (
        <Box
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: theme.spacing[1],
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.md,
            boxShadow: theme.shadows.semantic.card.high,
            zIndex: 50,
            maxHeight: '240px',
            overflowY: 'auto',
          }}
        >
          {isLoading && (
            <Flex
              align="center"
              justify="center"
              style={{
                padding: theme.spacing.semantic.component.lg,
              }}
            >
              <Box
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  border: `2px solid ${theme.colors.border.primary}`,
                  borderTopColor: theme.colors.interactive.primary,
                  animation: 'spin 1s linear infinite',
                }}
              />
            </Flex>
          )}

          {!isLoading && categories.length === 0 && (
            <Flex
              align="center"
              justify="center"
              style={{
                padding: theme.spacing.semantic.component.lg,
              }}
            >
              <Text
                style={{
                  color: theme.colors.text.tertiary,
                  fontSize: theme.typography.bodySmall.fontSize,
                }}
              >
                {query ? 'No categories found' : 'Type to search categories'}
              </Text>
            </Flex>
          )}

          {!isLoading && categories.length > 0 && categories.map((category, index) => (
            <Box
              key={category.id}
              style={{
                padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
                cursor: 'pointer',
                background: index === focusedIndex ? theme.colors.background.secondary : 'transparent',
                borderBottom: index < categories.length - 1 ? `1px solid ${theme.colors.border.subtle}` : 'none',
                transition: theme.animations.transitions.all,
              }}
              onClick={() => handleCategorySelect(category)}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              <Text
                style={{
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.body.fontSize,
                }}
              >
                {category.name}
              </Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Global styles for animations */}
      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </Box>
  );
} 