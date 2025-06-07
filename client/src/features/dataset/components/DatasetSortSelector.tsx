import { Flex, Select } from "@radix-ui/themes";
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  TextAlignLeftIcon,
  StackIcon,
} from "@radix-ui/react-icons";

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
      case "newest": return <ChevronUpIcon />;
      case "oldest": return <ChevronDownIcon />;
      case "name": return <TextAlignLeftIcon />;
      case "size": return <StackIcon />;
      default: return <ChevronUpIcon />;
    }
  };

  const getSortLabel = (sortValue: string) => {
    const option = options.find(opt => opt.value === sortValue);
    return option?.label || "Sort";
  };

  return (
    <Select.Root 
      value={selectedSort}
      onValueChange={onSortChange}
    >
      <Select.Trigger
        style={{
          padding: "8px 12px",
          border: "1px solid var(--gray-5)",
          borderRadius: "8px",
          background: "white",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "all 0.2s ease",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          cursor: "pointer",
          minWidth: "180px",
          whiteSpace: "nowrap",
        }}
      >
        <Flex align="center" gap="2" style={{ overflow: "hidden" }}>
          {getSortIcon(selectedSort)}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", marginLeft: "6px" }}>
            {getSortLabel(selectedSort)}
          </span>
        </Flex>
      </Select.Trigger>

      <Select.Content 
        position="popper" 
        style={{ 
          zIndex: 999,
          borderRadius: "8px", 
          overflow: "hidden", 
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", 
          border: "1px solid var(--gray-4)",
          background: "white",
          animation: "slideDown 0.2s ease",
        }}
      >
        <Select.Group>
          <Select.Label style={{ padding: "8px 22px", color: "var(--gray-9)", fontSize: "12px", fontWeight: 600 }}>
            Sort by
          </Select.Label>
          
          {options.map((option) => (
            <Select.Item 
              key={option.value}
              value={option.value}
              style={{ 
                padding: "8px 22px", 
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                fontSize: "13px",
                transition: "background 0.1s ease",
                whiteSpace: "nowrap",
              }}
            >
              <Flex align="center" gap="2">
                {getSortIcon(option.value)}
                <span>{option.label}</span>
              </Flex>
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
}; 