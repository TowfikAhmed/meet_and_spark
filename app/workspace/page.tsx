"use client";

import React, { useState } from "react";

import WelcomeScreen from "@/app/screens/WelcomeScreen";
import AuthScreen from "@/app/screens/AuthScreen";
import WorkspaceScreen from "@/app/screens/WorkspaceScreen";

type Screen = "welcome" | "auth" | "workspace";

export default function WorkspacePage() {
  const [screen, setScreen] = useState<Screen>("welcome");

  const handleNavigate = (next: Screen) => setScreen(next);

  const renderScreen = () => {
    switch (screen) {
      case "welcome":
        return <WelcomeScreen onNavigate={(s) => handleNavigate(s)} />;
      case "auth":
        return <AuthScreen onLogin={() => handleNavigate("workspace")} onBack={() => handleNavigate("welcome")} />;
      case "workspace":
        return <WorkspaceScreen onLogout={() => handleNavigate("welcome")} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col">
      {renderScreen()}
    </div>
  );
}

