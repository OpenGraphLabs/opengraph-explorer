import React, { useState, useRef, useEffect } from "react";
import { Box, Flex, Text } from "@/shared/ui/design-system/components";
import { Button } from "@/shared/ui/design-system/components/Button/Button";
import { useTheme } from "@/shared/ui/design-system";
import { useProfileSetupPageContext } from "@/shared/providers/ProfileSetupPageProvider";
import { useMobile } from "@/shared/hooks";
import { User, Globe, Calendar, Users, CaretDown, Check, Plus } from "phosphor-react";

export function ProfileSetupForm() {
  const { theme } = useTheme();
  const { isMobile } = useMobile();
  const {
    formData,
    errors,
    updateFormData,
    handleSubmit,
    isLoading,
    countries,
    genderOptions,
  } = useProfileSetupPageContext();

  // Country autocomplete state
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState(countries);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customCountryName, setCustomCountryName] = useState("");
  const countryInputRef = useRef<HTMLInputElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Get selected country name for display
  const selectedCountry = countries.find(c => c.code === formData.country);
  const displayCountryName = isOtherSelected && customCountryName 
    ? customCountryName 
    : selectedCountry ? selectedCountry.name : "";

  // Check if Other is selected
  useEffect(() => {
    setIsOtherSelected(formData.country === "OTHER");
  }, [formData.country]);

  // Update filtered countries when search changes
  useEffect(() => {
    if (countrySearch.trim() === "") {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter(country =>
        country.name.toLowerCase().includes(countrySearch.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
    setHighlightedIndex(-1); // Reset highlight when search changes
  }, [countrySearch, countries]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node) &&
        countryInputRef.current &&
        !countryInputRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false);
        setCountrySearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCountryInputFocus = () => {
    if (!isOtherSelected) {
      setShowCountryDropdown(true);
      setCountrySearch("");
    }
  };

  const handleCountrySelect = (countryCode: string, customName?: string) => {
    updateFormData("country", countryCode);
    setShowCountryDropdown(false);
    setCountrySearch("");
    setHighlightedIndex(-1);
    
    if (countryCode === "OTHER") {
      setIsOtherSelected(true);
      setCustomCountryName(customName || "");
      // Keep focus for direct input if no custom name provided
      if (!customName) {
        setTimeout(() => countryInputRef.current?.focus(), 0);
      } else {
        countryInputRef.current?.blur();
      }
    } else {
      setIsOtherSelected(false);
      setCustomCountryName("");
      countryInputRef.current?.blur();
    }
  };

  const handleUseCustomInput = () => {
    const searchTerm = countrySearch.trim();
    handleCountrySelect("OTHER", searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showCountryDropdown) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        if (!isOtherSelected) {
          setShowCountryDropdown(true);
          setCountrySearch("");
        }
      }
      return;
    }

    const hasCustomOption = filteredCountries.length === 0 && countrySearch.trim().length > 0;
    const totalOptions = filteredCountries.length + (hasCustomOption ? 1 : 0);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < totalOptions - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : totalOptions - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (hasCustomOption && highlightedIndex === filteredCountries.length) {
          // Select the custom input option
          handleUseCustomInput();
        } else if (highlightedIndex >= 0 && highlightedIndex < filteredCountries.length) {
          handleCountrySelect(filteredCountries[highlightedIndex].code);
        }
        break;
      case "Escape":
        setShowCountryDropdown(false);
        setCountrySearch("");
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleCustomCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCountryName(e.target.value);
  };

  const handleCustomCountryBlur = () => {
    // Only close if not clicking on dropdown
    if (!showCountryDropdown) {
      // Validate custom input or revert
      if (!customCountryName.trim()) {
        updateFormData("country", "US"); // Reset to default
        setIsOtherSelected(false);
      }
    }
  };

  // Base input styling
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: isMobile ? "16px" : "18px",
    fontSize: isMobile ? "16px" : "15px",
    fontWeight: 500,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: theme.borders.radius.lg,
    background: theme.colors.background.primary,
    color: theme.colors.text.primary,
    outline: "none",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const focusedInputStyle: React.CSSProperties = {
    borderColor: theme.colors.interactive.primary,
    boxShadow: `0 0 0 3px ${theme.colors.interactive.primary}20`,
  };

  const errorInputStyle: React.CSSProperties = {
    borderColor: theme.colors.status.error,
    boxShadow: `0 0 0 3px ${theme.colors.status.error}15`,
  };

  // Field wrapper styling
  const fieldStyle: React.CSSProperties = {
    marginBottom: isMobile 
      ? theme.spacing.semantic.component.lg 
      : theme.spacing.semantic.component.xl,
  };

  const fieldLabelStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.semantic.component.xs,
    marginBottom: theme.spacing.semantic.component.xs,
    fontSize: isMobile ? "15px" : "14px",
    fontWeight: 600,
    color: theme.colors.text.primary,
  };

  const fieldDescriptionStyle: React.CSSProperties = {
    fontSize: "12px",
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.semantic.component.xs,
    lineHeight: 1.3,
  };

  const errorTextStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 500,
    color: theme.colors.status.error,
    marginTop: theme.spacing.semantic.component.xs,
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      style={{ width: "100%" }}
    >
      <Flex direction="column" gap="5">
        {/* Row 1: Nickname (full width) */}
        <Box style={fieldStyle}>
          <Box style={fieldLabelStyle}>
            <User size={16} color={theme.colors.interactive.primary} weight="duotone" />
            <Text weight="medium">Nickname</Text>
            <Text size="1" style={{ color: theme.colors.status.error }}>*</Text>
          </Box>
          <input
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={(e) => updateFormData("nickname", e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, focusedInputStyle)}
            onBlur={(e) => {
              const hasError = errors.nickname;
              Object.assign(e.target.style, hasError ? errorInputStyle : { 
                borderColor: theme.colors.border.primary, 
                boxShadow: "none" 
              });
            }}
            placeholder="e.g. DataScientist42, AIEnthusiast"
            style={{
              ...inputStyle,
              ...(errors.nickname ? errorInputStyle : {}),
            }}
            maxLength={50}
            disabled={isLoading}
          />
          {errors.nickname && (
            <Text style={errorTextStyle} as="p">
              {errors.nickname}
            </Text>
          )}
        </Box>

        {/* Row 2: Gender + Age (side by side on desktop) */}
        <Box 
          style={{
            display: isMobile ? "flex" : "grid",
            flexDirection: isMobile ? "column" : undefined,
            gridTemplateColumns: isMobile ? undefined : "2fr 1fr",
            gap: isMobile ? theme.spacing.semantic.component.lg : theme.spacing.semantic.layout.md,
          }}
        >
          {/* Gender Field */}
          <Box style={isMobile ? fieldStyle : {}}>
            <Box style={fieldLabelStyle}>
              <Users size={16} color={theme.colors.interactive.primary} weight="duotone" />
              <Text weight="medium">Gender</Text>
              <Text size="1" style={{ color: theme.colors.status.error }}>*</Text>
            </Box>
            <Flex gap="3" style={{ marginTop: theme.spacing.semantic.component.xs }}>
              {genderOptions.map((option) => (
                <Box
                  key={option.value}
                  style={{
                    flex: 1,
                    position: "relative",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.6 : 1,
                  }}
                  onClick={() => !isLoading && updateFormData("gender", option.value)}
                >
                  <input
                    type="radio"
                    id={`gender-${option.value}`}
                    name="gender"
                    value={option.value}
                    checked={formData.gender === option.value}
                    onChange={(e) => updateFormData("gender", e.target.value)}
                    disabled={isLoading}
                    style={{
                      position: "absolute",
                      opacity: 0,
                      width: 0,
                      height: 0,
                    }}
                  />
                  <label
                    htmlFor={`gender-${option.value}`}
                    style={{
                      display: "block",
                      padding: isMobile ? "14px 8px" : "14px 12px",
                      border: `1px solid ${
                        formData.gender === option.value
                          ? theme.colors.interactive.primary
                          : errors.gender
                          ? theme.colors.status.error
                          : theme.colors.border.primary
                      }`,
                      borderRadius: theme.borders.radius.lg,
                      background: formData.gender === option.value 
                        ? `${theme.colors.interactive.primary}08` 
                        : theme.colors.background.primary,
                      textAlign: "center",
                      fontSize: isMobile ? "14px" : "13px",
                      fontWeight: formData.gender === option.value ? 600 : 500,
                      color: formData.gender === option.value 
                        ? theme.colors.interactive.primary 
                        : theme.colors.text.primary,
                      cursor: isLoading ? "not-allowed" : "pointer",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      userSelect: "none",
                    }}
                  >
                    {option.label}
                  </label>
                </Box>
              ))}
            </Flex>
            {errors.gender && (
              <Text style={errorTextStyle} as="p">
                {errors.gender}
              </Text>
            )}
          </Box>

          {/* Age Field */}
          <Box style={isMobile ? fieldStyle : {}}>
            <Box style={fieldLabelStyle}>
              <Calendar size={16} color={theme.colors.interactive.primary} weight="duotone" />
              <Text weight="medium">Age</Text>
              <Text size="1" style={{ color: theme.colors.status.error }}>*</Text>
            </Box>
            <Box style={{ position: "relative", maxWidth: isMobile ? "100%" : "100%" }}>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={(e) => updateFormData("age", e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, focusedInputStyle)}
                onBlur={(e) => {
                  const hasError = errors.age;
                  Object.assign(e.target.style, hasError ? errorInputStyle : { 
                    borderColor: theme.colors.border.primary, 
                    boxShadow: "none" 
                  });
                }}
                placeholder="25"
                style={{
                  ...inputStyle,
                  textAlign: "center",
                  fontSize: isMobile ? "16px" : "15px",
                  fontWeight: 600,
                  ...(errors.age ? errorInputStyle : {}),
                }}
                min="13"
                max="100"
                disabled={isLoading}
              />
              <Text 
                size="1" 
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: theme.colors.text.tertiary,
                  pointerEvents: "none",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                years
              </Text>
            </Box>
            {errors.age && (
              <Text style={errorTextStyle} as="p">
                {errors.age}
              </Text>
            )}
          </Box>
        </Box>

        {/* Row 3: Country (full width with autocomplete) */}
        <Box style={fieldStyle}>
          <Box style={fieldLabelStyle}>
            <Globe size={16} color={theme.colors.interactive.primary} weight="duotone" />
            <Text weight="medium">Country</Text>
            <Text size="1" style={{ color: theme.colors.status.error }}>*</Text>
          </Box>
          
          <Box style={{ position: "relative" }}>
            <input
              ref={countryInputRef}
              type="text"
              name="country-search"
              value={
                isOtherSelected 
                  ? customCountryName
                  : showCountryDropdown 
                    ? countrySearch 
                    : displayCountryName
              }
              onChange={isOtherSelected ? handleCustomCountryChange : (e) => setCountrySearch(e.target.value)}
              onFocus={handleCountryInputFocus}
              onKeyDown={handleKeyDown}
              onBlur={isOtherSelected ? handleCustomCountryBlur : undefined}
              placeholder={isOtherSelected ? "Enter your country..." : "Search countries..."}
              style={{
                ...inputStyle,
                paddingRight: "40px",
                cursor: isOtherSelected ? "text" : "text",
                ...(errors.country ? errorInputStyle : {}),
              }}
              disabled={isLoading}
              autoComplete="off"
            />
            
            {/* Dropdown Arrow */}
            <Box
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: theme.colors.text.tertiary,
                transition: "transform 0.2s ease-in-out",
              }}
            >
              <CaretDown 
                size={16} 
                style={{
                  transform: showCountryDropdown ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease-in-out",
                }}
              />
            </Box>

            {/* Dropdown */}
            {showCountryDropdown && !isOtherSelected && (
              <Box
                ref={countryDropdownRef}
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  background: theme.colors.background.card,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.lg,
                  boxShadow: theme.shadows.semantic.card.medium,
                  maxHeight: "200px",
                  overflowY: "auto",
                  marginTop: "4px",
                }}
              >
                {filteredCountries.map((country, index) => (
                  <Box
                    key={country.code}
                    onClick={() => handleCountrySelect(country.code)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    style={{
                      padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                      cursor: "pointer",
                      borderBottom: `1px solid ${theme.colors.border.secondary}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s ease-in-out",
                      background: 
                        highlightedIndex === index
                          ? `${theme.colors.interactive.primary}15`
                          : formData.country === country.code 
                            ? `${theme.colors.interactive.primary}08` 
                            : "transparent",
                    }}
                  >
                    <Text 
                      size="2" 
                      style={{ 
                        color: theme.colors.text.primary,
                        fontWeight: 
                          highlightedIndex === index || formData.country === country.code 
                            ? 600 
                            : 400,
                      }}
                    >
                      {country.name}
                    </Text>
                    {formData.country === country.code && (
                      <Check 
                        size={16} 
                        color={theme.colors.interactive.primary} 
                        weight="bold" 
                      />
                    )}
                  </Box>
                ))}
                
                {/* Show custom input option when no results found but user has typed something */}
                {filteredCountries.length === 0 && countrySearch.trim().length > 0 && (
                  <Box
                    onClick={handleUseCustomInput}
                    onMouseEnter={() => setHighlightedIndex(filteredCountries.length)}
                    style={{
                      padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.semantic.component.sm,
                      transition: "all 0.2s ease-in-out",
                      background: highlightedIndex === filteredCountries.length
                        ? `${theme.colors.interactive.primary}15`
                        : "transparent",
                      borderTop: `1px solid ${theme.colors.border.secondary}`,
                    }}
                  >
                    <Plus 
                      size={16} 
                      color={theme.colors.interactive.primary} 
                      weight="bold" 
                    />
                    <Box style={{ flex: 1 }}>
                      <Text 
                        size="2" 
                        style={{ 
                          color: theme.colors.interactive.primary,
                          fontWeight: highlightedIndex === filteredCountries.length ? 600 : 500,
                        }}
                      >
                        Use "{countrySearch.trim()}"
                      </Text>
                      <Text 
                        size="1" 
                        style={{ 
                          color: theme.colors.text.tertiary,
                          fontSize: "11px",
                          marginTop: "2px",
                        }}
                        as="p"
                      >
                        Enter your country manually
                      </Text>
                    </Box>
                  </Box>
                )}
                
                {/* Show message when no input and no results */}
                {filteredCountries.length === 0 && countrySearch.trim().length === 0 && (
                  <Box
                    style={{
                      padding: theme.spacing.semantic.component.md,
                      textAlign: "center",
                    }}
                  >
                    <Text size="2" style={{ color: theme.colors.text.tertiary }}>
                      Type to search countries
                    </Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>
          
          {errors.country && (
            <Text style={errorTextStyle} as="p">
              {errors.country}
            </Text>
          )}
        </Box>

        {/* Submit Button */}
        <Box style={{ 
          paddingTop: theme.spacing.semantic.component.lg,
          borderTop: `1px solid ${theme.colors.border.secondary}`,
          marginTop: theme.spacing.semantic.component.md,
        }}>
          <Button
            type="submit"
            variant="primary"
            size={isMobile ? "lg" : "md"}
            fullWidth
            loading={isLoading}
            disabled={isLoading}
            style={{
              background: theme.colors.interactive.primary,
              border: "none",
              fontSize: isMobile ? "16px" : "15px",
              fontWeight: 700,
              padding: isMobile ? "16px" : "18px",
              minHeight: isMobile ? "52px" : "48px",
              borderRadius: theme.borders.radius.lg,
              color: theme.colors.text.inverse,
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: theme.shadows.semantic.interactive.default,
              textTransform: "none",
              letterSpacing: "0.01em",
            }}
          >
            {isLoading ? "Creating Profile..." : "Complete & Start Earning"}
          </Button>
        </Box>
      </Flex>
    </form>
  );
}