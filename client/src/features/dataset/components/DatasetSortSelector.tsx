import { Dropdown, DropdownOption } from "@/shared/ui/design-system/components";
import {
  SortAscending,
  ArrowUp,
  ArrowDown,
  TextAa,
  Archive
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
  const getSortIcon = (sortValue: string) => {
    switch (sortValue) {
      case "newest":
        return <ArrowDown size={10} />;
      case "oldest":
        return <ArrowUp size={10} />;
      case "name":
        return <TextAa size={10} />;
      case "size":
        return <Archive size={10} />;
      default:
        return <SortAscending size={10} />;
    }
  };

  // Transform options to dropdown options with icons
  const dropdownOptions: DropdownOption[] = options.map(option => ({
    value: option.value,
    label: option.label,
    icon: getSortIcon(option.value),
  }));

  return (
    <Dropdown
      options={dropdownOptions}
      value={selectedSort}
      onValueChange={onSortChange}
      placeholder="Sort..."
      size="sm"
      variant="minimal"
    />
  );
};
