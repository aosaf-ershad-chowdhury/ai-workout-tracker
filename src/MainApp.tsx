import React, { useState, useCallback } from "react";
import { WebcamComponent } from "./WebcamComponent";
import { Feedback } from "./Feedback";
import type { Landmarks } from "./types";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";

interface MainAppProps {
  onBack: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ onBack }) => {
  const [landmarks, setLandmarks] = useState<Landmarks | null>(null);
  const [selectedExercise, setSelectedExercise] = useState("");

  // Use useCallback to avoid unnecessary re-renders
  const handleLandmarkUpdate = useCallback((lms: Landmarks | null) => {
    setLandmarks(lms);
  }, []);

  const handleExerciseChange = (event: SelectChangeEvent) => {
    setSelectedExercise(event.target.value as string);
  };

  return (
    <div
      style={{
        height: "100vh", // changed from minHeight
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        overflow: "hidden", // prevent scrollbars from extra content
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          background: "#c42c06",
          color: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        }}
      >
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            left: 0,
            background: "none",
            border: "none",
            color: "white",
            fontSize: "1rem",
            cursor: "pointer",
            padding: "4rem 1rem",
            borderRadius: "4px",
            transition: "background 0.2s",
            textAlign: "left",
          }}
        >
          &larr; Back to Home
        </button>
        <h2 style={{ margin: 0, width: "100%", textAlign: "center" }}>
          AI Form Coach
        </h2>
      </div>

      <div
        style={{
          flex: 1, // allow this section to fill remaining height
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "1rem",
          background:
            "radial-gradient(circle at 0% 0%, rgba(255, 38, 0, 0.52) 0%, transparent 30%)," +
            "radial-gradient(circle at 100% 0%, rgba(255, 38, 0, 0.52) 0%, transparent 30%)," +
            "#101014",
          color: "white",
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
          overflow: "auto", // allow scrolling if content overflows
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "2rem", justifyContent: "center" }}>
          <span style={{ marginBottom: "0.5rem", fontWeight: 500 }}>
            SELECT EXERCISE TYPE:
          </span>
          <FormControl
            size="small"
            sx={{
              minWidth: 180,
              // Change border color and label color
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#ffffff", // custom border color
                },
                "&:hover fieldset": {
                  borderColor: "#ffffff",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#ffffff",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#ffffff", // label color
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#ffffff",
              },
              "& .MuiSelect-icon": {
                color: "#ffffff", // dropdown arrow color
              },
              "& .MuiMenuItem-root": {
                color: "#101014", // menu item text color
              },
            }}
          >
            <InputLabel id="exercise-select-label">Exercise Type</InputLabel>
            <Select
              labelId="exercise-select-label"
              id="exercise-select"
              value={selectedExercise}
              label="Exercise Type"
              onChange={handleExerciseChange}
            >
              <MenuItem disabled value="">
                <em>None</em>
              </MenuItem>
              {[
                "squats",
                "pushups [Coming Soon!]",
                "lunges [Coming Soon!]",
              ].map((exercise) => (
                <MenuItem
                  key={exercise}
                  value={exercise}
                  disabled={exercise !== "squats"}
                >
                  {exercise.charAt(0).toUpperCase() + exercise.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {selectedExercise ? (
          <WebcamComponent onLandmarkUpdate={handleLandmarkUpdate} />
        ) : (
          <div
            style={{
              width: 640,
              height: 480,
              background: "#e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "2rem auto",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <span
              style={{ color: "#666", fontSize: "1.2rem", fontWeight: 500 }}
            >
              Please select an exercise type
            </span>
          </div>
        )}
        <Feedback landmarks={landmarks} />
      </div>
    </div>
  );
};

export default MainApp;
