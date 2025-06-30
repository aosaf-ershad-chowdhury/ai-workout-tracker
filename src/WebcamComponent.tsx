// WebcamComponent.tsx
import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import {
  FilesetResolver,
  PoseLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import type { Landmarks } from "./types";

interface WebcamComponentProps {
  onLandmarkUpdate: (landmarks: Landmarks | null) => void;
}

export const WebcamComponent: React.FC<WebcamComponentProps> = ({
  onLandmarkUpdate,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [initialized, setInitialized] = useState(false);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const initializePoseLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: `${
                import.meta.env.BASE_URL || "/"
              }models/pose_landmarker_heavy.task`,
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numPoses: 1,
          }
        );
        setInitialized(true);
      } catch (error) {
        console.error("Failed to initialize pose landmarker:", error);
      }
    };

    initializePoseLandmarker();
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (!initialized || !webcamRef.current || !canvasRef.current) return;

    const predictWebcam = async () => {
      const video = webcamRef.current?.video;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        // Skip processing if video not ready
        animationFrameRef.current = requestAnimationFrame(predictWebcam);
        return;
      }

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn("Invalid video dimensions - skipping frame");
        animationFrameRef.current = requestAnimationFrame(predictWebcam);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx || !poseLandmarkerRef.current) return;

      const drawingUtils = new DrawingUtils(canvasCtx);

      if (lastVideoTimeRef.current !== video.currentTime) {
        lastVideoTimeRef.current = video.currentTime;
        try {
          const results = poseLandmarkerRef.current.detectForVideo(
            video,
            performance.now()
          );

          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.landmarks && results.landmarks.length > 0) {
            for (const landmarks of results.landmarks) {
              // drawingUtils.drawLandmarks(landmarks);
              // drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);

              onLandmarkUpdate(landmarks as Landmarks);
            }
          } else {
            onLandmarkUpdate(null);
          }
        } catch (error) {
          console.error("Error during pose detection:", error);
          onLandmarkUpdate(null);
        }
        canvasCtx.restore();
      }
      animationFrameRef.current = requestAnimationFrame(predictWebcam);
    };

    predictWebcam();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [initialized, onLandmarkUpdate]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "640px",
        margin: "0 auto",
      }}
    >
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        width={640}
        height={480}
        videoConstraints={{ facingMode: "user" }}
        style={{ display: "block", width: "100%" }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
      {!initialized && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <p style={{ color: "white", fontSize: "20px" }}>
            Loading pose detector...
          </p>
        </div>
      )}
    </div>
  );
};
