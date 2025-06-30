import { useState } from "react";
import { LandingPage } from "./LandingPage";
import MainApp from "./MainApp";

const App = () => {
  const [appState, setAppState] = useState<"landing" | "app">("landing");

  return (
    <>
      {appState === "landing" ? (
        <LandingPage onStart={() => setAppState("app")} />
      ) : (
        <MainApp onBack={() => setAppState("landing")} />
      )}
    </>
  );
};

export default App;
