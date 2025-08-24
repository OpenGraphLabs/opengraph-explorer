import React, { useState } from "react";
import { useMobile } from "@/shared/hooks";
import { LoginDesktop, LoginMobile } from "@/components/login";

export function Login() {
  const [error, setError] = useState<string>("");
  const { isMobile } = useMobile();

  const handleError = (err: Error) => {
    setError(err.message);
  };

  const commonProps = {
    error,
    onError: handleError,
  };

  if (isMobile) {
    return <LoginMobile {...commonProps} />;
  }

  return <LoginDesktop {...commonProps} />;
}
