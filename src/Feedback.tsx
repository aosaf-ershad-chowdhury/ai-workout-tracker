import React, { useEffect, useRef, useState } from "react";
import type { Landmarks } from "./types";
// import Speech from "react-speech";

interface FeedbackProps {
  landmarks: Landmarks | null;
  exercise?: string;
}

const calculateAngle = (a: any, b: any, c: any) => {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  return angle > 180 ? 360 - angle : angle;
};

const detectKneeValgus = (landmarks: any) => {
  const leftKneePos = landmarks[25];
  const leftAnklePos = landmarks[27];
  const rightKneePos = landmarks[26];
  const rightAnklePos = landmarks[28];

  // Knee-to-ankle alignment
  const leftAlignment = leftKneePos.x - leftAnklePos.x;
  const rightAlignment = rightKneePos.x - rightAnklePos.x;

  // Threshold values (need to adjust)
  const valgusThreshold = 0.08;

  const messages = [];
  if (Math.abs(leftAlignment) > valgusThreshold) {
    messages.push("Left knee caving in - push knees out");
  }
  if (Math.abs(rightAlignment) > valgusThreshold) {
    messages.push("Right knee caving in - push knees out");
  }

  return messages;
};

const detectBackCurvature = (landmarks: any) => {
  const shoulderHipAngle = calculateAngle(
    landmarks[11], // Left shoulder
    landmarks[23], // Left hip
    landmarks[25] // Left knee
  );

  const messages = [];

  // Hyperextension (leaning back too far)
  if (shoulderHipAngle > 195) {
    messages.push("Don't hyperextend your back - engage core");
  }

  // Rounding (leaning forward too much)
  if (shoulderHipAngle < 165) {
    messages.push("Back rounding - maintain neutral spine");
  }

  return messages;
};

interface FeedbackState {
  repCount: number;
  exercisePhase: "top" | "bottom" | "transition" | "rest";
  lastPhaseChange: number;
  depthHistory: number[];
  feedback: string;
}

export const Feedback: React.FC<FeedbackProps> = ({ landmarks }) => {
  // Use a single state object to manage related values
  const [state, setState] = useState<FeedbackState>({
    repCount: 0,
    exercisePhase: "rest",
    lastPhaseChange: 0,
    depthHistory: [],
    feedback: "",
  });
  // Store feedback to show after rep is completed
  const [pendingFeedback, setPendingFeedback] = useState<string>("");

  // Use ref to track previous values without triggering re-renders
  const prevLandmarks = useRef<Landmarks | null>(null);
  // Store last spoken feedback to avoid repeating
  const lastSpokenRef = useRef<string>("");

  useEffect(() => {
    if (!landmarks || landmarks.length < 29) return;
    // Skip processing if landmarks haven't changed
    if (JSON.stringify(landmarks) === JSON.stringify(prevLandmarks.current))
      return;
    prevLandmarks.current = landmarks;
    const newState = { ...state };
    // Detect reps and update state
    const repCompleted = detectReps(landmarks, newState);
    // Analyze form and update feedback only after rep is completed
    if (repCompleted) {
      const feedbackMsg = analyzeForm(landmarks, newState.depthHistory);
      setPendingFeedback(feedbackMsg);
      newState.feedback = feedbackMsg;
    }
    setState(newState);
  }, [landmarks]);

  useEffect(() => {
    if (pendingFeedback && pendingFeedback !== lastSpokenRef.current) {
      lastSpokenRef.current = pendingFeedback;
      // Use browser speech synthesis if react-speech is not enough
      if (window.speechSynthesis) {
        const utter = new window.SpeechSynthesisUtterance(pendingFeedback);
        utter.rate = 1.1;
        window.speechSynthesis.cancel(); // Stop any previous speech
        window.speechSynthesis.speak(utter);
      }
    }
  }, [pendingFeedback]);

  const detectReps = (landmarks: any, currentState: FeedbackState) => {
    const leftKneeAngle = calculateAngle(
      landmarks[23],
      landmarks[25],
      landmarks[27]
    );
    const rightKneeAngle = calculateAngle(
      landmarks[24],
      landmarks[26],
      landmarks[28]
    );
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
    let repCompleted = false;
    // Update depth history at bottom position
    if (avgKneeAngle < 90) {
      currentState.depthHistory = [
        ...currentState.depthHistory.slice(-4),
        avgKneeAngle,
      ];
    }
    // Squat detection logic
    if (avgKneeAngle < 90 && currentState.exercisePhase !== "bottom") {
      currentState.exercisePhase = "bottom";
      currentState.lastPhaseChange = performance.now();
      // Half rep when going down
      currentState.repCount += 0.5;
    } else if (avgKneeAngle > 140 && currentState.exercisePhase === "bottom") {
      currentState.exercisePhase = "top";
      currentState.lastPhaseChange = performance.now();
      // Complete rep when standing up
      currentState.repCount += 0.5;
      repCompleted = true;
    } else if (avgKneeAngle > 160 && currentState.exercisePhase === "top") {
      currentState.exercisePhase = "rest";
    }
    return repCompleted;
  };

  const analyzeForm = (landmarks: any, depthHistory: number[]) => {
    if (!landmarks || landmarks.length < 25) return "";

    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];

    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

    // Collect feedback
    let messages = [
      ...detectKneeValgus(landmarks),
      ...detectBackCurvature(landmarks),
      ...checkDepthConsistency(avgKneeAngle, depthHistory),
    ];

    // Basic form checks
    if (avgKneeAngle > 100 && state.exercisePhase === "bottom") {
      messages.push("Go deeper! Aim for 90° knee bend");
    }

    return messages.length > 0 ? messages.join("\n") : "Good form!";
  };

  const checkDepthConsistency = (
    currentDepth: number,
    depthHistory: number[]
  ) => {
    if (depthHistory.length < 3) return [];

    const avgDepth =
      depthHistory.reduce((a, b) => a + b, 0) / depthHistory.length;
    const depthVariation =
      Math.max(...depthHistory) - Math.min(...depthHistory);

    const messages = [];
    if (depthVariation > 50) {
      messages.push("Maintain consistent depth between reps");
    }
    if (currentDepth < avgDepth - 10) {
      messages.push("You're not going as deep as previous reps");
    }
    console.log(messages);
    return messages;
  };

  return (
    <>
      <div
        style={{
          marginTop: "16px",
          padding: "16px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          borderRadius: "8px",
        }}
      >
        <h3
          style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "8px" }}
        >
          Form Feedback:
        </h3>
        <div style={{ whiteSpace: "pre-line" }}>
          {(pendingFeedback || state.feedback).split("\n").map((line, i) => (
            <p
              key={i}
              style={{
                color: line.includes("!") ? "#ff5555" : "#55ff55",
                margin: "4px 0",
                fontWeight: line.includes("Good") ? "bold" : "normal",
              }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          borderRadius: "50%",
          width: "80px",
          height: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          fontWeight: "bold",
          zIndex: 10,
        }}
      >
        {Math.floor(state.repCount)}
      </div>
      {/* Optionally, you can use the react-speech component for UI speech controls: */}
      {/* <Speech text={pendingFeedback || state.feedback} /> */}
    </>
  );
};
