import React from "react";
import { Box } from "@/shared/ui/design-system/components";
import { useMobile } from "@/shared/hooks";
import { EarnDesktop, EarnMobile } from "@/components/earn";

export function Earn() {
  const { isMobile } = useMobile();
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      style={{
        maxWidth: "100%",
        margin: "0 auto",
        padding: "0 16px",
      }}
    >
      {isMobile ? (
        <EarnMobile isLoaded={isLoaded} />
      ) : (
        <EarnDesktop isLoaded={isLoaded} />
      )}
    </Box>
  );
}
