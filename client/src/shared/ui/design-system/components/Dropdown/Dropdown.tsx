import React, { useState, useMemo } from "react";
import { Box } from "@radix-ui/themes";
import { CaretDown, X, MagnifyingGlass } from "phosphor-react";
import { useTheme } from "../../theme/ThemeProvider";
import { DropdownProps } from "./types";

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  variant = "default",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  error = false,
  searchable = false,
  clearable = false,
  onOpen,
  onClose,
  onSearch,
  onClear,
  ...props
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    
    return options.filter(option => 
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery, searchable]);

  // Get current selected option
  const selectedOption = options.find(option => option.value === value);

  // Size styles
  const sizeStyles = {
    sm: {
      height: "28px",
      padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
      paddingRight: clearable && value ? "60px" : "32px",
      fontSize: "12px",
      iconSize: 10,
      minWidth: "120px",
    },
    md: {
      height: "36px", 
      padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
      paddingRight: clearable && value ? "60px" : "40px",
      fontSize: "13px",
      iconSize: 12,
      minWidth: "160px",
    },
    lg: {
      height: "46px",
      padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
      paddingRight: clearable && value ? "70px" : "48px",
      fontSize: "14px",
      iconSize: 14,
      minWidth: "270px",
    },
  };

  // Variant styles
  const variantStyles = {
    default: {
      background: `linear-gradient(135deg, ${theme.colors.background.primary}, ${theme.colors.background.card})`,
      border: `1px solid ${theme.colors.border.primary}`,
      focusBorderColor: theme.colors.interactive.primary,
      focusShadow: `0 0 0 3px ${theme.colors.interactive.primary}20`,
    },
    minimal: {
      background: "transparent",
      border: `1px solid ${theme.colors.border.secondary}`,
      focusBorderColor: theme.colors.interactive.primary,
      focusShadow: `0 0 0 2px ${theme.colors.interactive.primary}15`,
    },
    outlined: {
      background: theme.colors.background.primary,
      border: `2px solid ${theme.colors.border.primary}`,
      focusBorderColor: theme.colors.interactive.primary,
      focusShadow: `0 0 0 3px ${theme.colors.interactive.primary}15`,
    },
    filled: {
      background: theme.colors.background.secondary,
      border: `1px solid transparent`,
      focusBorderColor: theme.colors.interactive.primary,
      focusShadow: `0 0 0 3px ${theme.colors.interactive.primary}20`,
    },
  };

  const currentSizeStyle = sizeStyles[size];
  const currentVariantStyle = variantStyles[variant];

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    onValueChange(newValue);
    setSearchQuery(""); // Reset search after selection
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange("");
    onClear?.();
  };

  const handleDropdownClick = () => {
    if (searchable && !disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        onOpen?.();
      } else {
        onClose?.();
        setSearchQuery("");
      }
    }
  };

  const handleSearchOptionClick = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
    onClose?.();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Basic HTML select for non-searchable dropdowns
  if (!searchable) {
    return (
      <Box 
        style={{ 
          width: fullWidth ? "100%" : "auto",
          position: "relative",
        }}
      >
        <select
          value={value || ""}
          onChange={handleSelectChange}
          disabled={disabled || loading}
          style={{
            appearance: "none",
            width: fullWidth ? "100%" : "auto",
            minWidth: currentSizeStyle.minWidth,
            height: currentSizeStyle.height,
            padding: currentSizeStyle.padding,
            paddingRight: currentSizeStyle.paddingRight,
            background: error 
              ? `${theme.colors.status.error}10` 
              : currentVariantStyle.background,
            border: error
              ? `1px solid ${theme.colors.status.error}`
              : currentVariantStyle.border,
            borderRadius: theme.borders.radius.md,
            color: disabled 
              ? theme.colors.interactive.disabled 
              : theme.colors.text.primary,
            fontSize: currentSizeStyle.fontSize,
            fontWeight: value ? 600 : 500,
            cursor: disabled ? "not-allowed" : "pointer",
            outline: "none",
            boxShadow: loading 
              ? `0 2px 4px ${theme.colors.background.primary}30`
              : theme.shadows.semantic.card.low,
            transition: theme.animations.transitions.hover,
            opacity: disabled ? 0.6 : 1,
          }}
          onFocus={(e) => {
            if (!disabled) {
              e.target.style.borderColor = currentVariantStyle.focusBorderColor;
              e.target.style.boxShadow = currentVariantStyle.focusShadow;
            }
          }}
          onBlur={(e) => {
            if (!disabled) {
              e.target.style.borderColor = error 
                ? theme.colors.status.error
                : currentVariantStyle.border.split(" ")[2] || theme.colors.border.primary;
              e.target.style.boxShadow = theme.shadows.semantic.card.low;
            }
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.background = error 
                ? `${theme.colors.status.error}15`
                : `${theme.colors.background.secondary}`;
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              e.currentTarget.style.background = error 
                ? `${theme.colors.status.error}10`
                : currentVariantStyle.background;
            }
          }}
          {...props}
        >
          <option value="" disabled style={{ color: theme.colors.text.tertiary }}>
            {loading ? "Loading..." : placeholder}
          </option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
              style={{ 
                color: option.disabled 
                  ? theme.colors.interactive.disabled
                  : theme.colors.text.primary,
              }}
            >
              {option.label}
              {option.description && ` • ${option.description}`}
            </option>
          ))}
        </select>

        {/* Clear button */}
        {clearable && value && !disabled && (
          <Box
            onClick={handleClear}
            style={{
              position: "absolute",
              right: size === "lg" ? "32px" : size === "md" ? "28px" : "24px",
              top: "50%",
              transform: "translateY(-50%)",
              color: theme.colors.text.tertiary,
              cursor: "pointer",
              padding: "2px",
              borderRadius: theme.borders.radius.sm,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: theme.animations.transitions.hover,
              zIndex: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.colors.text.primary;
              e.currentTarget.style.background = `${theme.colors.border.primary}80`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.colors.text.tertiary;
              e.currentTarget.style.background = "transparent";
            }}
          >
            <X size={currentSizeStyle.iconSize} />
          </Box>
        )}

        {/* Dropdown arrow */}
        <Box
          style={{
            position: "absolute",
            right: theme.spacing.semantic.component.sm,
            top: "50%",
            transform: "translateY(-50%)",
            background: `${theme.colors.interactive.primary}15`,
            borderRadius: theme.borders.radius.sm,
            padding: "3px",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CaretDown 
            size={currentSizeStyle.iconSize} 
            style={{ 
              color: theme.colors.interactive.primary,
            }} 
          />
        </Box>
      </Box>
    );
  }

  // Custom searchable dropdown
  return (
    <Box 
      style={{ 
        width: fullWidth ? "100%" : "auto",
        position: "relative",
      }}
    >
      {/* Trigger */}
      <Box
        onClick={handleDropdownClick}
        style={{
          width: fullWidth ? "100%" : "auto",
          minWidth: currentSizeStyle.minWidth,
          height: currentSizeStyle.height,
          padding: currentSizeStyle.padding,
          paddingRight: currentSizeStyle.paddingRight,
          background: error 
            ? `${theme.colors.status.error}10` 
            : currentVariantStyle.background,
          border: error
            ? `1px solid ${theme.colors.status.error}`
            : currentVariantStyle.border,
          borderRadius: theme.borders.radius.md,
          color: disabled 
            ? theme.colors.interactive.disabled 
            : theme.colors.text.primary,
          fontSize: currentSizeStyle.fontSize,
          fontWeight: value ? 600 : 500,
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none",
          boxShadow: theme.shadows.semantic.card.low,
          transition: theme.animations.transitions.hover,
          display: "flex",
          alignItems: "center",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {/* Content */}
        <Box style={{ 
          flex: 1, 
          display: "flex", 
          alignItems: "center", 
          gap: theme.spacing.semantic.component.xs,
          minWidth: 0,
        }}>
          {selectedOption?.icon && (
            <Box style={{ 
              color: theme.colors.text.secondary,
              flexShrink: 0,
            }}>
              {selectedOption.icon}
            </Box>
          )}
          <Box style={{
            color: value 
              ? theme.colors.text.primary 
              : theme.colors.text.tertiary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}>
            {loading 
              ? "Loading..." 
              : selectedOption?.label || placeholder
            }
          </Box>
        </Box>
      </Box>

      {/* Clear button */}
      {clearable && value && !disabled && (
        <Box
          onClick={handleClear}
          style={{
            position: "absolute",
            right: size === "lg" ? "32px" : size === "md" ? "28px" : "24px",
            top: "50%",
            transform: "translateY(-50%)",
            color: theme.colors.text.tertiary,
            cursor: "pointer",
            padding: "2px",
            borderRadius: theme.borders.radius.sm,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: theme.animations.transitions.hover,
            zIndex: 2,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.colors.text.primary;
            e.currentTarget.style.background = `${theme.colors.border.primary}80`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.colors.text.tertiary;
            e.currentTarget.style.background = "transparent";
          }}
        >
          <X size={currentSizeStyle.iconSize} />
        </Box>
      )}

      {/* Dropdown arrow */}
      <Box
        style={{
          position: "absolute",
          right: theme.spacing.semantic.component.sm,
          top: "50%",
          transform: "translateY(-50%)",
          background: `${theme.colors.interactive.primary}15`,
          borderRadius: theme.borders.radius.sm,
          padding: "3px",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CaretDown 
          size={currentSizeStyle.iconSize} 
          style={{ 
            color: theme.colors.interactive.primary,
          }} 
        />
      </Box>

      {/* Dropdown menu for searchable */}
      {isOpen && (
        <Box
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.md,
            boxShadow: theme.shadows.semantic.overlay.dropdown,
            padding: theme.spacing.semantic.component.xs,
            maxHeight: "300px",
            overflowY: "auto",
            zIndex: 50,
          }}
        >
          {/* Search Input */}
          <Box style={{ 
            padding: theme.spacing.semantic.component.xs,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
            marginBottom: theme.spacing.semantic.component.xs,
          }}>
            <Box style={{ position: "relative" }}>
              <Box
                style={{
                  position: "absolute",
                  left: theme.spacing.semantic.component.xs,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: theme.colors.text.tertiary,
                }}
              >
                <MagnifyingGlass size={12} />
              </Box>
              <input
                placeholder="Search options..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: `6px 8px 6px 28px`,
                  border: `1px solid ${theme.colors.border.secondary}`,
                  borderRadius: theme.borders.radius.sm,
                  background: theme.colors.background.primary,
                  color: theme.colors.text.primary,
                  fontSize: "12px",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.interactive.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.border.secondary;
                }}
              />
            </Box>
          </Box>

          {/* Options */}
          {filteredOptions.length === 0 ? (
            <Box
              style={{
                padding: theme.spacing.semantic.component.md,
                textAlign: "center",
                color: theme.colors.text.tertiary,
                fontSize: "12px",
                fontStyle: "italic",
              }}
            >
              {searchQuery ? "No results found" : "No options available"}
            </Box>
          ) : (
            filteredOptions.map((option) => (
              <Box
                key={option.value}
                onClick={() => !option.disabled && handleSearchOptionClick(option.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.xs,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  borderRadius: theme.borders.radius.sm,
                  fontSize: currentSizeStyle.fontSize,
                  fontWeight: 500,
                  cursor: option.disabled ? "not-allowed" : "pointer",
                  color: option.disabled 
                    ? theme.colors.interactive.disabled
                    : theme.colors.text.primary,
                  margin: "1px 0",
                  opacity: option.disabled ? 0.5 : 1,
                  transition: theme.animations.transitions.hover,
                  background: value === option.value 
                    ? `${theme.colors.interactive.primary}15`
                    : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!option.disabled) {
                    e.currentTarget.style.background = `${theme.colors.background.secondary}`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!option.disabled) {
                    e.currentTarget.style.background = value === option.value 
                      ? `${theme.colors.interactive.primary}15`
                      : "transparent";
                  }
                }}
              >
                <Box style={{ flex: 1, display: "flex", alignItems: "center", gap: theme.spacing.semantic.component.xs }}>
                  {option.icon && (
                    <Box style={{ 
                      color: theme.colors.text.secondary,
                      flexShrink: 0,
                    }}>
                      {option.icon}
                    </Box>
                  )}
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Box style={{
                      color: option.disabled 
                        ? theme.colors.interactive.disabled
                        : theme.colors.text.primary,
                      fontWeight: 500,
                    }}>
                      {option.label}
                    </Box>
                    {option.description && (
                      <Box style={{
                        color: theme.colors.text.tertiary,
                        fontSize: "11px",
                        marginTop: "2px",
                      }}>
                        {option.description}
                      </Box>
                    )}
                  </Box>
                </Box>
                
                {value === option.value && (
                  <Box
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: theme.colors.interactive.primary,
                      flexShrink: 0,
                    }}
                  />
                )}
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
}; 