import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Hero } from "./components/Hero";
import AppBar from "./components/AppBar";

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <>
      <CssBaseline enableColorScheme />
      <AppBar />
      <Hero start={onStart} />
    </>
  );
};
