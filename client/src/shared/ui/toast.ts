// Simple toast notification utility
export const toast = {
  success: (message: string) => {
    console.log("✅ Success:", message);
    // You can implement actual toast here using a library like react-hot-toast
    // For now, we'll just log to console
  },

  error: (message: string) => {
    console.error("❌ Error:", message);
    // You can implement actual toast here using a library like react-hot-toast
    // For now, we'll just log to console
  },

  info: (message: string) => {
    console.info("ℹ️ Info:", message);
  },

  warning: (message: string) => {
    console.warn("⚠️ Warning:", message);
  },
};
