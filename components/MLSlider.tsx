
import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import { motion, AnimatePresence } from "framer-motion";

interface MLSliderProps {
  items: any[];
  renderItem: (item: any) => React.ReactNode;
}

const MLSlider: React.FC<MLSliderProps> = ({ items, renderItem }) => {
  const webcamRef = useRef<Webcam>(null);
  const [model, setModel] = useState<handpose.HandPose | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const [gesture, setGesture] = useState<"IDLE" | "LEFT" | "RIGHT">("IDLE");
  const lastGestureTime = useRef(0);

  // Load TensorFlow Model
  useEffect(() => {
    if (isEnabled && !model) {
      const loadModel = async () => {
        // tf.ready() removed to fix compatibility issues
        const net = await handpose.load();
        setModel(net);
        console.log("Handpose model loaded.");
      };
      loadModel();
    }
  }, [isEnabled]);

  // Detection Loop
  useEffect(() => {
    let animationId: number;

    const detect = async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4 &&
        model
      ) {
        const video = webcamRef.current.video;
        const predictions = await model.estimateHands(video);

        if (predictions.length > 0) {
          // Get palm base x-coordinate
          const palmBase = predictions[0].annotations.palmBase[0] as number[]; 
          const x = palmBase[0]; // x coordinate
          const width = video.videoWidth;

          // Logic: Split screen into 3 zones
          // [ LEFT (Next) | IDLE | RIGHT (Prev) ]
          // Note: Webcam is mirrored usually
          
          const now = Date.now();
          if (now - lastGestureTime.current > 1500) { // Debounce 1.5s
            if (x < width * 0.2) {
              setGesture("RIGHT"); // User moved hand right (screen left)
              handleNext();
              lastGestureTime.current = now;
            } else if (x > width * 0.8) {
              setGesture("LEFT"); // User moved hand left (screen right)
              handlePrev();
              lastGestureTime.current = now;
            } else {
              setGesture("IDLE");
            }
          }
        }
      }
      animationId = requestAnimationFrame(detect);
    };

    if (isEnabled && model) {
      detect();
    }

    return () => cancelAnimationFrame(animationId);
  }, [model, isEnabled, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">AI Gesture Gallery</h3>
        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className={`px-4 py-2 rounded-full border ${
            isEnabled ? "bg-red-500 border-red-500" : "bg-transparent border-accent text-accent"
          } transition-all`}
        >
          {isEnabled ? "Disable Camera" : "Enable Gesture Control"}
        </button>
      </div>

      {isEnabled && (
        <div className="absolute top-0 right-0 w-32 h-24 border-2 border-accent rounded-lg overflow-hidden z-20 opacity-80">
          <Webcam
            ref={webcamRef}
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
          <div className="absolute bottom-0 left-0 bg-black/50 text-white text-[10px] w-full text-center">
            {gesture}
          </div>
        </div>
      )}

      <div className="relative h-[400px] w-full overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full p-4"
          >
            {renderItem(items[currentIndex])}
          </motion.div>
        </AnimatePresence>
        
        {/* Manual Controls Fallback */}
        <button onClick={handlePrev} className="absolute left-4 bg-black/50 p-3 rounded-full text-white hover:bg-accent">←</button>
        <button onClick={handleNext} className="absolute right-4 bg-black/50 p-3 rounded-full text-white hover:bg-accent">→</button>
      </div>
      
      {isEnabled && (
        <p className="text-center text-gray-500 text-sm mt-4">
          👋 Wave your hand to the <b>Left</b> or <b>Right</b> edge of the camera frame to switch projects.
        </p>
      )}
    </div>
  );
};

export default MLSlider;
