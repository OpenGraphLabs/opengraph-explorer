import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  Button,
  Badge,
  Separator,
  Switch,
} from "@radix-ui/themes";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileTs, 
  FileCode, 
  FileCss, 
  FileHtml, 
  FileJs, 
  FileZip, 
  FileDoc,
  FileText,
  Download,
  FolderOpen
} from "phosphor-react";
import { getModelFiles } from "../../utils/modelUtils";
import { ModelObject } from "../../services/modelGraphQLService";

interface ModelFilesTabProps {
  model: ModelObject;
}

export function ModelFilesTab({ model }: ModelFilesTabProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showOnlyCodeFiles, setShowOnlyCodeFiles] = useState(false);
  
  const files = getModelFiles(model.task_type);
  const filteredFiles = showOnlyCodeFiles 
    ? files.filter(file => isCodeFile(file.name)) 
    : files;

  // Get icon based on file type
  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const size = 24;
    const weight = "fill";
    
    switch (extension) {
      case 'ts':
      case 'tsx':
        return <FileTs size={size} weight={weight} style={{ color: "#3178C6" }} />;
      case 'js':
      case 'jsx':
        return <FileJs size={size} weight={weight} style={{ color: "#F7DF1E" }} />;
      case 'css':
        return <FileCss size={size} weight={weight} style={{ color: "#1572B6" }} />;
      case 'html':
        return <FileHtml size={size} weight={weight} style={{ color: "#E34F26" }} />;
      case 'zip':
      case 'gz':
      case 'tar':
        return <FileZip size={size} weight={weight} style={{ color: "#880E4F" }} />;
      case 'md':
      case 'txt':
        return <FileText size={size} weight={weight} style={{ color: "#4E342E" }} />;
      case 'pdf':
      case 'doc':
      case 'docx':
        return <FileDoc size={size} weight={weight} style={{ color: "#0D47A1" }} />;
      default:
        return <FileCode size={size} weight={weight} style={{ color: "#FF5733" }} />;
    }
  };

  // Check if file is a code file
  const isCodeFile = (filename: string) => {
    const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'json', 'c', 'cpp', 'h', 'cs', 'java', 'go', 'rs', 'rb', 'php', 'html', 'css', 'scss', 'less'];
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    return codeExtensions.includes(extension);
  };
  
  // Get badge color based on file format
  const getFileBadgeColor = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    if (['js', 'jsx', 'ts', 'tsx'].includes(extension)) return "orange";
    if (['py'].includes(extension)) return "blue";
    if (['json'].includes(extension)) return "green";
    if (['html', 'css', 'scss', 'less'].includes(extension)) return "purple";
    if (['md', 'txt'].includes(extension)) return "gray";
    if (['zip', 'gz', 'tar'].includes(extension)) return "red";
    
    return "gray";
  };

  return (
    <Card style={{ border: "none", boxShadow: "none" }}>
      <Flex direction="column" gap="5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Flex align="center" gap="3" mb="4">
            <Box style={{ 
              background: "#FFF4F2", 
              borderRadius: "8px", 
              width: "32px", 
              height: "32px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "#FF5733" 
            }}>
              <FolderOpen size={20} weight="bold" />
            </Box>
            <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
              Model Files
            </Heading>
          </Flex>
          
          <Text style={{ lineHeight: "1.7", fontSize: "15px", color: "#444", letterSpacing: "0.01em", marginBottom: "20px" }}>
            This model is stored on the Sui blockchain and consists of the following files.
          </Text>
          
          <Card style={{ 
            padding: "20px", 
            borderRadius: "12px", 
            background: "#FFFFFF", 
            border: "1px solid #FFE8E2",
            boxShadow: "0 4px 12px rgba(255, 87, 51, 0.05)",
            marginBottom: "28px" 
          }}>
            <Flex justify="between" align="center" mb="4">
              <Flex align="center" gap="4">
                <Badge color="orange" variant="soft" style={{ background: "#FFF4F2" }}>
                  Total: {files.length} files
                </Badge>
                <Flex align="center" gap="3">
                  <Switch 
                    checked={showOnlyCodeFiles} 
                    onCheckedChange={setShowOnlyCodeFiles}
                    style={{ 
                      '--switch-thumb-color': '#FF5733',
                      '--switch-active-color': '#FFF4F2'
                    } as React.CSSProperties}
                  />
                  <Text size="2">Show only code files</Text>
                </Flex>
              </Flex>
              
              <Flex gap="2">
                <Button
                  variant="soft" 
                  size="1"
                  style={{ 
                    background: viewMode === "grid" ? "#FFF4F2" : "transparent", 
                    color: viewMode === "grid" ? "#FF5733" : "#666",
                    borderColor: viewMode === "grid" ? "#FFE8E2" : "transparent",
                  }}
                  onClick={() => setViewMode("grid")}
                >
                  Grid View
                </Button>
                <Button
                  variant="soft" 
                  size="1"
                  style={{ 
                    background: viewMode === "list" ? "#FFF4F2" : "transparent", 
                    color: viewMode === "list" ? "#FF5733" : "#666",
                    borderColor: viewMode === "list" ? "#FFE8E2" : "transparent",
                  }}
                  onClick={() => setViewMode("list")}
                >
                  List View
                </Button>
              </Flex>
            </Flex>
            
            <Separator size="4" style={{ margin: "6px 0 20px" }} />

            {viewMode === "grid" ? (
              <Box style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "20px" }}>
                {filteredFiles.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(255, 87, 51, 0.1)" }}
                  >
                    <Card style={{ 
                      padding: "20px", 
                      borderRadius: "10px", 
                      border: "1px solid #FFE8E2",
                      background: "#FFFFFF", 
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}>
                      <Flex direction="column" gap="3" style={{ height: "100%" }}>
                        <Flex justify="center" align="center" style={{ height: "64px" }}>
                          {getFileIcon(file.name)}
                        </Flex>
                        <Text size="2" style={{ fontWeight: 600, textAlign: "center", marginTop: "4px" }}>
                          {file.name}
                        </Text>
                        <Badge 
                          size="1" 
                          variant="soft" 
                          color={getFileBadgeColor(file.name)} 
                          style={{ alignSelf: "center", marginTop: "2px" }}
                        >
                          {file.name.split('.').pop()?.toUpperCase()}
                        </Badge>
                        <Flex justify="between" align="center" style={{ marginTop: "auto", paddingTop: "8px" }}>
                          <Text size="1" color="gray">
                            {file.size}
                          </Text>
                          <Button 
                            variant="ghost" 
                            size="1"
                            style={{ color: "#FF5733" }}
                          >
                            <Download size={14} weight="bold" />
                          </Button>
                        </Flex>
                      </Flex>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            ) : (
              <Box>
                {filteredFiles.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <Flex
                      justify="between"
                      align="center"
                      py="3"
                      style={{
                        borderBottom:
                          index < filteredFiles.length - 1
                            ? "1px solid var(--gray-a2)"
                            : "none",
                        padding: "14px 10px",
                        borderRadius: "4px",
                        transition: "background 0.2s ease",
                        cursor: "pointer",
                      }}
                      className="hover-row"
                    >
                      <Flex gap="3" align="center">
                        {getFileIcon(file.name)}
                        <Box>
                          <Text style={{ fontWeight: 500 }}>
                            {file.name}
                          </Text>
                          <Text size="1" color="gray">
                            Modified {new Date().toLocaleDateString('en-US')}
                          </Text>
                        </Box>
                        <Badge 
                          size="1" 
                          variant="soft" 
                          color={getFileBadgeColor(file.name)}
                        >
                          {file.name.split('.').pop()?.toUpperCase()}
                        </Badge>
                      </Flex>
                      
                      <Flex gap="4" align="center">
                        <Text size="2" color="gray">
                          {file.size}
                        </Text>
                        <Button 
                          variant="ghost" 
                          size="1"
                          style={{ color: "#FF5733" }}
                        >
                          <Download size={16} weight="bold" />
                        </Button>
                      </Flex>
                    </Flex>
                  </motion.div>
                ))}
              </Box>
            )}
            
            {filteredFiles.length === 0 && (
              <Flex 
                direction="column" 
                align="center" 
                justify="center" 
                style={{ padding: "40px 0" }}
              >
                <Box style={{ 
                  background: "#FFF4F2",
                  borderRadius: "50%",
                  width: "64px",
                  height: "64px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  color: "#FF5733"
                }}>
                  <FileCode size={32} weight="light" />
                </Box>
                <Text size="3" style={{ fontWeight: 600, marginBottom: "12px" }}>No Files Found</Text>
                <Text size="2" style={{ color: "#666", textAlign: "center", maxWidth: "400px", lineHeight: "1.6" }}>
                  There are no files matching your filter criteria. Try changing the filter.
                </Text>
              </Flex>
            )}
          </Card>
          
          <Card style={{ 
            padding: "24px", 
            borderRadius: "12px", 
            background: "#FFFFFF", 
            border: "1px solid #FFE8E2",
            boxShadow: "0 4px 12px rgba(255, 87, 51, 0.05)" 
          }}>
            <Heading size="3" style={{ color: "#FF5733", marginBottom: "16px" }}>On-Chain Access Information</Heading>
            <Text style={{ lineHeight: "1.7", fontSize: "15px", color: "#444", letterSpacing: "0.01em", marginBottom: "20px" }}>
              Here's how to access this model's files on the Sui blockchain.
            </Text>
            
            <Box style={{ 
              background: "#F9F9F9", 
              padding: "20px", 
              borderRadius: "8px",
              fontFamily: "monospace",
              fontSize: "14px",
              lineHeight: "1.6"
            }}>
              <Text style={{ display: "block", marginBottom: "8px", color: "#666" }}>// Model File Access Code</Text>
              <Text style={{ display: "block", color: "#0F5D9E" }}>const</Text>
              <Text style={{ display: "block" }}>
                modelId = <span style={{ color: "#A31515" }}>"{model.id}"</span>;
              </Text>
              <Text style={{ display: "block", marginTop: "8px" }}>
                <span style={{ color: "#0F5D9E" }}>await</span> suiClient.getObject(&#123;
              </Text>
              <Text style={{ display: "block", marginLeft: "20px" }}>
                id: modelId,
              </Text>
              <Text style={{ display: "block", marginLeft: "20px" }}>
                options: &#123; showContent: <span style={{ color: "#0F5D9E" }}>true</span> &#125;
              </Text>
              <Text style={{ display: "block" }}>&#125;);</Text>
            </Box>
            
            <Flex justify="end" mt="4">
              <Button 
                variant="soft" 
                style={{ 
                  background: "#FFF4F2", 
                  color: "#FF5733" 
                }}
              >
                Copy Code
              </Button>
            </Flex>
          </Card>
        </motion.div>
      </Flex>
      
      <style>
        {`
          .hover-row:hover {
            background: #FFF4F2;
          }
        `}
      </style>
    </Card>
  );
} 