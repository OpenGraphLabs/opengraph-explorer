// Layout constants for consistent spacing across the application
export const LAYOUT_CONSTANTS = {
  HEADER_HEIGHT: "56px",
  HEADER_HEIGHT_NUMBER: 56,
  MOBILE_HEADER_HEIGHT: "56px", // Same as desktop for now
  FOOTER_HEIGHT: "0px", // No footer currently
  SIDEBAR_WIDTH: "280px",
  MOBILE_SIDEBAR_WIDTH: "100%",
} as const;

// CSS custom properties for layout
export const LAYOUT_CSS_VARS = {
  "--header-height": LAYOUT_CONSTANTS.HEADER_HEIGHT,
  "--header-height-number": LAYOUT_CONSTANTS.HEADER_HEIGHT_NUMBER,
  "--mobile-header-height": LAYOUT_CONSTANTS.MOBILE_HEADER_HEIGHT,
  "--footer-height": LAYOUT_CONSTANTS.FOOTER_HEIGHT,
  "--sidebar-width": LAYOUT_CONSTANTS.SIDEBAR_WIDTH,
  "--mobile-sidebar-width": LAYOUT_CONSTANTS.MOBILE_SIDEBAR_WIDTH,
  "--content-min-height": `calc(100vh - ${LAYOUT_CONSTANTS.HEADER_HEIGHT})`,
  "--full-height": "100vh",
  "--available-height": `calc(100vh - ${LAYOUT_CONSTANTS.HEADER_HEIGHT})`,
} as const;
