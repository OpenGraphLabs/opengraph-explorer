import { Box } from "@/shared/ui/design-system/components";
import { LeaderboardPageProvider } from "@/shared/providers/LeaderboardPageProvider";
import { LeaderboardLayoutDesktop } from "@/components/leaderboard/LeaderboardLayoutDesktop";
import { LeaderboardLayoutMobile } from "@/components/leaderboard/LeaderboardLayoutMobile";
import { useMobile } from "@/shared/hooks/useMobile";

function LeaderboardContent() {
  const { isMobile } = useMobile();

  if (isMobile) return <LeaderboardLayoutMobile />;
  return <LeaderboardLayoutDesktop />;
}

export function Leaderboard() {
  return (
    <LeaderboardPageProvider>
      <Box style={{ minHeight: "100vh" }}>
        <LeaderboardContent />
      </Box>
    </LeaderboardPageProvider>
  );
}