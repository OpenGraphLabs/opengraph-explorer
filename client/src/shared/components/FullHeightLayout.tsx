import React from "react";
import { Box } from "@/shared/ui/design-system/components";
import { LAYOUT_CONSTANTS } from "../constants/layout";

interface FullHeightLayoutProps {
  children: React.ReactNode;
  /**
   * 중앙 정렬 여부
   */
  center?: boolean;
  /**
   * 배경 스타일
   */
  background?: React.CSSProperties["background"];
  /**
   * 추가 스타일
   */
  style?: React.CSSProperties;
}

export const FullHeightLayout: React.FC<FullHeightLayoutProps> = ({
  children,
  center = false,
  background,
  style = {},
}) => {
  return (
    <Box
      style={{
        minHeight: `calc(100vh - ${LAYOUT_CONSTANTS.HEADER_HEIGHT})`,
        height: `calc(100vh - ${LAYOUT_CONSTANTS.HEADER_HEIGHT})`,
        display: center ? "flex" : "block",
        alignItems: center ? "center" : "stretch",
        justifyContent: center ? "center" : "flex-start",
        background,
        ...style,
      }}
    >
      {children}
    </Box>
  );
};
