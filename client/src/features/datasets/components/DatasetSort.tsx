import { Flex, Select } from "@radix-ui/themes";
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  TextAlignLeftIcon,
  StackIcon,
} from "@radix-ui/react-icons";

type SortOption = "newest" | "oldest" | "name" | "size";

interface DatasetSortProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function DatasetSort({ selectedSort, onSortChange }: DatasetSortProps) {
  const getSortIcon = (sort: SortOption) => {
    switch (sort) {
      case "newest": return <ChevronUpIcon style={{ flexShrink: 0 }} />;
      case "oldest": return <ChevronDownIcon style={{ flexShrink: 0 }} />;
      case "name": return <TextAlignLeftIcon style={{ flexShrink: 0 }} />;
      case "size": return <StackIcon style={{ flexShrink: 0 }} />;
    }
  };

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case "newest": return "Newest First";
      case "oldest": return "Oldest First";
      case "name": return "Name";
      case "size": return "Size";
    }
  };

  return (
    <Select.Root value={selectedSort} onValueChange={onSortChange}>
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
          <Select.Label style={{ 
            padding: "8px 22px", 
            color: "var(--gray-9)", 
            fontSize: "12px", 
            fontWeight: 600 
          }}>
            Sort by
          </Select.Label>
          
          <Select.Item 
            value="newest" 
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
            <ChevronUpIcon style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }} />
            <span style={{ display: "inline-block", verticalAlign: "middle", marginLeft: "6px" }}>Newest First</span>
          </Select.Item>
          
          <Select.Item 
            value="oldest" 
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
            <ChevronDownIcon style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }} />
            <span style={{ display: "inline-block", verticalAlign: "middle", marginLeft: "6px" }}>Oldest First</span>
          </Select.Item>

          <Select.Item 
            value="name" 
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
            <TextAlignLeftIcon style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }} />
            <span style={{ display: "inline-block", verticalAlign: "middle", marginLeft: "6px" }}>Name</span>
          </Select.Item>
          
          <Select.Item 
            value="size" 
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
            <StackIcon style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }} />
            <span style={{ display: "inline-block", verticalAlign: "middle", marginLeft: "6px" }}>Size</span>
          </Select.Item>
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
} 