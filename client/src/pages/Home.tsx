import React from "react";
import { useMobile } from "@/shared/hooks";
import { HomePageContextProvider, useHomePageContext } from "@/contexts/HomePageContextProvider";
import { HomeErrorState } from "@/components/home/HomeErrorState";
import { HomeLayoutDesktop } from "@/components/home/HomeLayoutDesktop";
import { HomeLayoutMobile } from "@/components/home/HomeLayoutMobile";

function HomeContent() {
  const { error } = useHomePageContext();
  const { isMobile } = useMobile();

  // Handle error state first
  if (error) {
    return <HomeErrorState />;
  }

  if (isMobile) {
    return <HomeLayoutMobile />;
  }

  return <HomeLayoutDesktop />;
}

export function Home() {
  return (
    <HomePageContextProvider>
      <HomeContent />
    </HomePageContextProvider>
  );
}
