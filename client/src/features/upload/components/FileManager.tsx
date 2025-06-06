import { Box, Flex, Text, Button, Card, Badge } from "@radix-ui/themes";
import { FileIcon, TrashIcon, PlusIcon } from "@radix-ui/react-icons";

interface FileManagerProps {
  files: File[];
  onFileRemove: (index: number) => void;
  onAddMoreFiles: () => void;
}

export function FileManager({ files, onFileRemove, onAddMoreFiles }: FileManagerProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <Card
      style={{
        padding: "24px",
        borderRadius: "12px",
        border: "1px solid var(--gray-3)",
        background: "white",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      }}
    >
      <Flex direction="column" gap="4">
        {/* Header */}
        <Flex justify="between" align="center">
          <Text size="3" weight="bold" style={{ color: "var(--gray-12)" }}>
            Selected Files ({files.length})
          </Text>
          <Button
            variant="soft"
            onClick={onAddMoreFiles}
            style={{
              background: "var(--blue-3)",
              color: "var(--blue-11)",
              borderRadius: "6px",
              padding: "0 12px",
              height: "32px",
            }}
          >
            <PlusIcon width={14} height={14} />
            Add More
          </Button>
        </Flex>

        {/* File List Container */}
        <Box style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid var(--gray-4)", borderRadius: "8px" }}>
          {/* Table Header */}
          <Box 
            style={{ 
              padding: "12px 16px", 
              background: "var(--gray-2)", 
              borderBottom: "1px solid var(--gray-4)",
              display: "grid",
              gridTemplateColumns: "1fr auto auto auto",
              gap: "16px",
              alignItems: "center",
              fontWeight: 500,
              fontSize: "13px",
              color: "var(--gray-11)",
            }}
          >
            <Text>File Name</Text>
            <Text>Type</Text>
            <Text>Size</Text>
            <Text>Actions</Text>
          </Box>

          {/* File List */}
          {files.map((file, index) => (
            <Box
              key={index}
              style={{
                padding: "12px 16px",
                borderBottom: index < files.length - 1 ? "1px solid var(--gray-3)" : "none",
                background: "white",
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: "16px",
                alignItems: "center",
                transition: "background-color 0.2s ease",
              }}
            >
              {/* File Name */}
              <Flex align="center" gap="3" style={{ overflow: "hidden" }}>
                <Box
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "6px",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileIcon width={12} height={12} style={{ color: "white" }} />
                </Box>
                <Text size="2" style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {file.name}
                </Text>
              </Flex>

              {/* File Type */}
              <Badge color="gray" style={{ fontSize: "11px" }}>
                {file.type.split('/')[1]?.toUpperCase() || "UNKNOWN"}
              </Badge>

              {/* File Size */}
              <Text size="2" style={{ color: "var(--gray-10)" }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </Text>

              {/* Remove Button */}
              <Button
                size="1"
                variant="soft"
                onClick={() => onFileRemove(index)}
                style={{
                  background: "var(--red-3)",
                  color: "var(--red-11)",
                  borderRadius: "6px",
                  padding: "0 8px",
                  height: "28px",
                }}
              >
                <TrashIcon width={12} height={12} />
              </Button>
            </Box>
          ))}
        </Box>

        {/* File Statistics */}
        <Card style={{ padding: "16px", background: "var(--blue-2)", border: "1px solid var(--blue-4)", borderRadius: "8px" }}>
          <Flex justify="between" align="center">
            <Text size="2" weight="medium" style={{ color: "var(--blue-11)" }}>
              Total: {files.length} files
            </Text>
            <Text size="2" style={{ color: "var(--blue-10)" }}>
              {(files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)} MB
            </Text>
          </Flex>
        </Card>
      </Flex>
    </Card>
  );
} 