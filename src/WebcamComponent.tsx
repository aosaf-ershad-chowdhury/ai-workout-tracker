import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import {
  FilesetResolver,
  PoseLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

const WebcamComponent = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [initialized, setInitialized] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const animationFrameRef = useRef<number>(0);

  // Initialize MediaPipe
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
              modelAssetPath: `${import.meta.env.BASE_URL || "/"}models/pose_landmarker_heavy.task`,
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

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Process webcam frames
  useEffect(() => {
    if (!initialized || !webcamRef.current || !canvasRef.current) return;

    const predictWebcam = async () => {
      const video = webcamRef.current?.video;
      const canvas = canvasRef.current;

      if (!video || !canvas) return;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx || !poseLandmarkerRef.current) return;

      const drawingUtils = new DrawingUtils(canvasCtx);

      // Only process if video time has changed
      if (lastVideoTimeRef.current !== video.currentTime) {
        lastVideoTimeRef.current = video.currentTime;

        // Detect poses
        const results = poseLandmarkerRef.current.detectForVideo(
          video,
          performance.now()
        );

        // Clear canvas
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw pose landmarks
        if (results.landmarks) {
          for (const landmarks of results.landmarks) {
            // drawingUtils.drawLandmarks(landmarks, {
            //   radius: (data) =>
            //     data.from && typeof data.from.z === "number"
            //       ? DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1)
            //       : 5,
            // });
            // drawingUtils.drawConnectors(
            //   landmarks,
            //   PoseLandmarker.POSE_CONNECTIONS
            // );

            // Analyze form and generate feedback
            const formFeedback = analyzeForm(landmarks);
            setFeedback(formFeedback);
          }
        }
        canvasCtx.restore();
      }

      // Continue processing
      animationFrameRef.current = requestAnimationFrame(predictWebcam);
    };

    predictWebcam();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [initialized]);

  // Form analysis logic (example for squats)
  const analyzeForm = (landmarks: any) => {
    if (!landmarks || landmarks.length < 25) return "";

    // Get key landmarks (indices from MediaPipe documentation)
    const leftShoulder = landmarks[11];
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];
    const rightShoulder = landmarks[12];
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];

    // Calculate knee angles
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    // Calculate back angle
    const backAngleLeft = calculateAngle(leftShoulder, leftHip, leftKnee);
    const backAngleRight = calculateAngle(rightShoulder, rightHip, rightKnee);

    // Generate feedback
    let messages: string[] = [];

    // Knee depth check
    if (leftKneeAngle > 100 || rightKneeAngle > 100) {
      messages.push("Go deeper! Aim for 90° knee bend");
    }

    // Back straightness check
    if (backAngleLeft < 160 || backAngleRight < 160) {
      messages.push("Keep your back straight!");
    }

    // Knee alignment check
    if (Math.abs(leftKnee.x - rightKnee.x) > 0.2) {
      messages.push("Keep knees aligned with feet");
    }

    return messages.length > 0 ? messages.join("\n") : "Good form!";
  };

  // Calculate angle between three points
  const calculateAngle = (a: any, b: any, c: any) => {
    const radians =
      Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180) / Math.PI);
    return angle > 180 ? 360 - angle : angle;
  };

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

      {feedback && (
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
            style={{
              fontWeight: "bold",
              fontSize: "18px",
              marginBottom: "8px",
            }}
          >
            Form Feedback:
          </h3>
          <div style={{ whiteSpace: "pre-line" }}>{feedback}</div>
        </div>
      )}

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

export default WebcamComponent;
