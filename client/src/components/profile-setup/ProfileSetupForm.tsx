import React from "react";
import { Box, Flex, Text } from "@/shared/ui/design-system/components";
import { Button } from "@/shared/ui/design-system/components/Button/Button";
import { useTheme } from "@/shared/ui/design-system";
import { useProfileSetupPageContext } from "@/shared/providers/ProfileSetupPageProvider";
import { useMobile } from "@/shared/hooks";
import { User, Globe, Calendar, Users } from "phosphor-react";

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

        {/* Row 3: Country (full width) */}
        <Box style={fieldStyle}>
          <Box style={fieldLabelStyle}>
            <Globe size={16} color={theme.colors.interactive.primary} weight="duotone" />
            <Text weight="medium">Country</Text>
            <Text size="1" style={{ color: theme.colors.status.error }}>*</Text>
          </Box>
          <select
            name="country"
            value={formData.country}
            onChange={(e) => updateFormData("country", e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, focusedInputStyle)}
            onBlur={(e) => {
              const hasError = errors.country;
              Object.assign(e.target.style, hasError ? errorInputStyle : { 
                borderColor: theme.colors.border.primary, 
                boxShadow: "none" 
              });
            }}
            style={{
              ...inputStyle,
              ...(errors.country ? errorInputStyle : {}),
            }}
            disabled={isLoading}
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
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