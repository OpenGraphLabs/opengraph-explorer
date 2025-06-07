import { Flex, Select } from "@radix-ui/themes";
import { useTheme } from "@/shared/ui/design-system";
import {
  SortAscending,
  SortDescending,
  ArrowUp,
  ArrowDown,
  TextAa,
  Archive,
  CaretDown,
  Check
} from "phosphor-react";

interface SortOption {
  value: string;
  label: string;
}

interface DatasetSortSelectorProps {
  selectedSort: string;
  onSortChange: (value: string) => void;
  options: SortOption[];
}

export const DatasetSortSelector = ({
  selectedSort,
  onSortChange,
  options,
}: DatasetSortSelectorProps) => {
  const { theme } = useTheme();

  const getSortIcon = (sortValue: string) => {
    switch (sortValue) {
      case "newest":
        return <ArrowDown size={10} style={{ color: theme.colors.text.tertiary }} />;
      case "oldest":
        return <ArrowUp size={10} style={{ color: theme.colors.text.tertiary }} />;
      case "name":
        return <TextAa size={10} style={{ color: theme.colors.text.tertiary }} />;
      case "size":
        return <Archive size={10} style={{ color: theme.colors.text.tertiary }} />;
      default:
        return <SortAscending size={10} style={{ color: theme.colors.text.tertiary }} />;
    }
  };

  const getCurrentSortLabel = () => {
    const currentOption = options.find(option => option.value === selectedSort);
    return currentOption?.label || "Sort";
  };

  return (
    <Select.Root value={selectedSort} onValueChange={onSortChange}>
      <Select.Trigger
        style={{
          background: theme.colors.background.primary,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borders.radius.sm,
          padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
          color: theme.colors.text.primary,
          fontSize: "12px",
          fontWeight: 500,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          minWidth: "100px",
          height: "28px",
        }}
      >
        <Flex align="center" gap="1">
          {getSortIcon(selectedSort)}
          <span>{getCurrentSortLabel()}</span>
        </Flex>
        <CaretDown size={10} style={{ color: theme.colors.text.tertiary, marginLeft: "auto" }} />
      </Select.Trigger>
      
      <Select.Content
        position="popper"
        style={{
          background: theme.colors.background.card,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borders.radius.sm,
          boxShadow: theme.shadows.semantic.overlay.dropdown,
          padding: theme.spacing.semantic.component.xs,
          minWidth: "140px",
          zIndex: 50,
        }}
      >
        <Select.Group>
          {options.map(option => (
            <Select.Item
              key={option.value}
              value={option.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                borderRadius: theme.borders.radius.sm,
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                color: theme.colors.text.primary,
                margin: "1px 0",
              }}
            >
              {getSortIcon(option.value)}
              <span>{option.label}</span>
              {selectedSort === option.value && (
                <Check size={10} style={{ color: theme.colors.interactive.primary, marginLeft: "auto" }} />
              )}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
};
