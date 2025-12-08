
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface VoiceControlProps {
  onNavigate: (sectionId: string) => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({ onNavigate }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const { toggleTheme, isDarkMode } = useTheme();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setFeedback('Listening...');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setTimeout(() => {
            setTranscript('');
            setFeedback('');
        }, 2000);
      };

      recognitionRef.current.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase();
        setTranscript(command);
        processCommand(command);
      };
      
      recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          setFeedback('Error. Try again.');
      }
    }
  }, [isDarkMode]);

  const processCommand = (cmd: string) => {
    if (cmd.includes('home') || cmd.includes('top')) {
      onNavigate('about');
      setFeedback('Navigating to Home');
    } else if (cmd.includes('skill') || cmd.includes('expertise')) {
      onNavigate('skills');
      setFeedback('Showing Skills');
    } else if (cmd.includes('project') || cmd.includes('work')) {
      onNavigate('projects');
      setFeedback('Opening Projects');
    } else if (cmd.includes('experience') || cmd.includes('timeline')) {
      onNavigate('experience');
      setFeedback('Showing Experience');
    } else if (cmd.includes('contact') || cmd.includes('email')) {
      onNavigate('contact');
      setFeedback('Go to Contact');
    } else if (cmd.includes('dark') || cmd.includes('night')) {
      if (!isDarkMode) toggleTheme();
      setFeedback('Dark Mode Enabled');
    } else if (cmd.includes('light') || cmd.includes('day')) {
      if (isDarkMode) toggleTheme();
      setFeedback('Light Mode Enabled');
    } else {
      setFeedback('Command not recognized');
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
        alert("Voice control not supported in this browser.");
        return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  if (!recognitionRef.current) return null;

  return (
    <div className="fixed bottom-52 left-8 z-40 flex flex-col items-center">
       {/* Feedback Bubble */}
       {(isListening || transcript || feedback) && (
           <div className={`mb-4 px-4 py-2 rounded-xl backdrop-blur-md shadow-lg text-sm font-mono transition-all duration-300 ${
               isListening ? 'bg-accent/80 text-white animate-pulse' : 'bg-secondary/90 text-text-primary'
           }`}>
               {feedback || transcript || "Listening..."}
           </div>
       )}
       
       {/* Mic Button */}
      <button
        onClick={toggleListening}
        className={`w-12 h-12 rounded-full shadow-premium flex items-center justify-center transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] scale-110' 
            : 'bg-primary border border-secondary text-accent hover:bg-secondary'
        }`}
        aria-label="Voice Control"
      >
        {isListening ? (
             <div className="flex gap-1 h-4 items-center">
                 <div className="w-1 bg-white animate-[music-bar_0.5s_ease-in-out_infinite]"></div>
                 <div className="w-1 bg-white animate-[music-bar_0.5s_ease-in-out_infinite_0.1s]"></div>
                 <div className="w-1 bg-white animate-[music-bar_0.5s_ease-in-out_infinite_0.2s]"></div>
             </div>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        )}
      </button>
    </div>
  );
};

export default VoiceControl;
