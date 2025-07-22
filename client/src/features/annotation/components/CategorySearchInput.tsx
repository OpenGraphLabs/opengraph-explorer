import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditingSelected, setIsEditingSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { categories, isLoading } = useSearchCategories(query, dictionaryId);

  // Smooth transitions for dropdown visibility
  useEffect(() => {
    if (isOpen) {
      setShowDropdown(true);
    } else {
      const timer = setTimeout(() => setShowDropdown(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
        if (isEditingSelected) {
          // If editing and clicking outside, cancel edit mode
          setIsEditingSelected(false);
          setQuery('');
        }
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditingSelected]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (isEditingSelected || !selectedCategory) {
      setIsOpen(true);
    }
    
    setFocusedIndex(-1);
  }, [selectedCategory, isEditingSelected]);

  const handleInputFocus = useCallback(() => {
    if (selectedCategory && !isEditingSelected) {
      // When clicking on selected category, enter edit mode
      setIsEditingSelected(true);
      setQuery(selectedCategory.name);
      setIsOpen(true);
    } else if (!selectedCategory) {
      setIsOpen(true);
    }
  }, [selectedCategory, isEditingSelected]);

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
        if (isEditingSelected) {
          // Cancel editing, revert to selected category
          setIsEditingSelected(false);
          setQuery('');
        }
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleCategorySelect = useCallback((category: { id: number; name: string }) => {
    setQuery('');
    setIsOpen(false);
    setFocusedIndex(-1);
    setIsEditingSelected(false);
    onCategorySelect(category);
    inputRef.current?.blur();
  }, [onCategorySelect]);

  const handleClearSelection = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setQuery('');
    setIsEditingSelected(false);
    onCategorySelect(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [onCategorySelect]);

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
          placeholder={selectedCategory && !isEditingSelected ? '' : placeholder}
          value={isEditingSelected || !selectedCategory ? query : selectedCategory.name}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          readOnly={selectedCategory && !isEditingSelected}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: theme.typography.body.fontSize,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI Variable, Segoe UI, system-ui, Roboto, Helvetica Neue, Arial, sans-serif',
            color: (selectedCategory && !isEditingSelected) ? theme.colors.text.secondary : theme.colors.text.primary,
            cursor: (selectedCategory && !isEditingSelected) ? 'pointer' : 'text',
            transition: theme.animations.transitions.all,
          }}
        />

        {/* Clear Button for Selected Category */}
        {selectedCategory && (
          <button
            onClick={handleClearSelection}
            style={{
              padding: theme.spacing[1],
              minWidth: 'auto',
              borderRadius: theme.borders.radius.full,
              marginRight: theme.spacing[1],
              opacity: 0.7,
              transition: theme.animations.transitions.all,
              border: `1px solid ${theme.colors.border.primary}`,
              background: theme.colors.background.card,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.background = theme.colors.background.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
              e.currentTarget.style.background = theme.colors.background.card;
            }}
          >
            <Cross2Icon width="14" height="14" style={{ color: theme.colors.text.secondary }} />
          </button>
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
      {showDropdown && (!selectedCategory || isEditingSelected) && (
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
            maxHeight: '280px',
            overflowY: 'auto',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.95)',
            transition: 'opacity 150ms ease-out, transform 150ms ease-out',
            transformOrigin: 'top center',
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
                background: index === focusedIndex 
                  ? theme.colors.interactive.primary 
                  : 'transparent',
                borderBottom: index < categories.length - 1 ? `1px solid ${theme.colors.border.subtle}` : 'none',
                transition: 'all 120ms ease-out',
                borderRadius: index === focusedIndex ? theme.borders.radius.sm : '0',
                margin: index === focusedIndex ? `0 ${theme.spacing[1]}` : '0',
              }}
              onClick={() => handleCategorySelect(category)}
              onMouseEnter={() => setFocusedIndex(index)}
              onMouseLeave={() => setFocusedIndex(-1)}
            >
              <Flex align="center" gap="2">
                <MagnifyingGlassIcon 
                  width="14" 
                  height="14" 
                  style={{ 
                    color: index === focusedIndex 
                      ? 'white'
                      : theme.colors.text.tertiary,
                    transition: 'color 120ms ease-out',
                  }} 
                />
                <Text
                  style={{
                    color: index === focusedIndex 
                      ? 'white'
                      : theme.colors.text.primary,
                    fontSize: theme.typography.body.fontSize,
                    fontWeight: index === focusedIndex 
                      ? theme.typography.labelLarge.fontWeight
                      : theme.typography.body.fontWeight,
                    transition: 'all 120ms ease-out',
                  }}
                >
                  {category.name}
                </Text>
              </Flex>
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