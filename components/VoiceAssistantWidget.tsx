import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import type { PortfolioData } from '../types';

interface VoiceAssistantWidgetProps {
    portfolioData: PortfolioData;
    onNavigate: (sectionId: string) => void;
    onOpenProject: (projectId: string) => void;
}

// --- Audio Helper Functions ---
const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

const encode = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const createBlob = (data: Float32Array): Blob => {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
};

// --- Component ---
const VoiceAssistantWidget: React.FC<VoiceAssistantWidgetProps> = ({ portfolioData, onNavigate, onOpenProject }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<'idle' | 'listening' | 'speaking' | 'error'>('idle');
    const [conversation, setConversation] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    
    // Refs for stable resources and state across renders & callbacks
    const sessionPromise = useRef<Promise<any> | null>(null);
    const mediaStream = useRef<MediaStream | null>(null);
    const inputAudioContext = useRef<AudioContext | null>(null);
    const outputAudioContext = useRef<AudioContext | null>(null);
    const scriptProcessor = useRef<ScriptProcessorNode | null>(null);
    const sources = useRef(new Set<AudioBufferSourceNode>()).current;
    const nextStartTime = useRef(0); // FIX: Persist nextStartTime across renders
    const currentModelTurnText = useRef(''); // FIX: Accumulate text for command processing

    const processCommands = (text: string) => {
        const commandRegex = /\[(NAVIGATE_TO|OPEN_PROJECT_MODAL):?([^\]]*)\]/g;
        let match;
        while ((match = commandRegex.exec(text)) !== null) {
            const [, command, arg] = match;
            if (command === 'NAVIGATE_TO') onNavigate(arg);
            else if (command === 'OPEN_PROJECT_MODAL') onOpenProject(arg);
        }
    };

    const stopConversation = useCallback(() => {
        if (sessionPromise.current) {
            sessionPromise.current.then(session => session?.close()).catch(console.error);
            sessionPromise.current = null;
        }
        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach(track => track.stop());
            mediaStream.current = null;
        }
        if (scriptProcessor.current) {
            scriptProcessor.current.disconnect();
            scriptProcessor.current = null;
        }
        if (inputAudioContext.current?.state !== 'closed') inputAudioContext.current?.close().catch(console.error);
        if (outputAudioContext.current?.state !== 'closed') outputAudioContext.current?.close().catch(console.error);
        
        sources.forEach(source => source.stop());
        sources.clear();
        
        setStatus('idle');
    }, [sources]);
    
    const startConversation = useCallback(async () => {
        setStatus('listening');
        setConversation([]);
        nextStartTime.current = 0;
        currentModelTurnText.current = '';
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStream.current = stream;

            const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
            inputAudioContext.current = new AudioCtor({ sampleRate: 16000 });
            outputAudioContext.current = new AudioCtor({ sampleRate: 24000 });

            const portfolioContext = `This is the portfolio of ${portfolioData.profile.name}, an ${portfolioData.profile.title}. About: ${portfolioData.profile.about}. Projects: ${portfolioData.projects.map(p => `ID ${p.id}, Title: ${p.title}`).join(', ')}.`;
            const systemInstruction = `You are a sophisticated AI Concierge for the professional portfolio of ${portfolioData.profile.name}. Your purpose is to provide an engaging, helpful, and personalized tour for visitors. You MUST ONLY use the portfolio information provided to answer questions. When a user's request implies an action, you can embed special commands in your response. Available Commands: [NAVIGATE_TO:section_id] (valid ids: about, skills, projects, experience, education, memories, contact), [OPEN_PROJECT_MODAL:project_id]. Be friendly and professional. PORTFOLIO KNOWLEDGE BASE: --- ${portfolioContext} ---`;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            sessionPromise.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: systemInstruction,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        const source = inputAudioContext.current!.createMediaStreamSource(stream);
                        scriptProcessor.current = inputAudioContext.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessor.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromise.current?.then((session) => {
                                if (session) session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor.current);
                        scriptProcessor.current.connect(inputAudioContext.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            setConversation(prev => {
                                const last = prev[prev.length - 1];
                                // FIX: Immutable update for streaming transcription
                                if (last?.role === 'user' && !message.serverContent?.turnComplete) {
                                    const updatedLast = { ...last, text: last.text + text };
                                    return [...prev.slice(0, -1), updatedLast];
                                }
                                return [...prev, { role: 'user', text }];
                            });
                        }

                        if (message.serverContent?.outputTranscription) {
                            setStatus('speaking');
                            const text = message.serverContent.outputTranscription.text;
                            currentModelTurnText.current += text; // FIX: Accumulate text in ref
                            setConversation(prev => {
                                const last = prev[prev.length - 1];
                                // FIX: Immutable update for streaming transcription
                                if (last?.role === 'model'  && !message.serverContent?.turnComplete) {
                                    const updatedLast = { ...last, text: last.text + text };
                                    return [...prev.slice(0, -1), updatedLast];
                                }
                                return [...prev, { role: 'model', text }];
                            });
                        }
                        
                        if (message.serverContent?.turnComplete) {
                            // FIX: Use ref for up-to-date text to process commands
                            if (currentModelTurnText.current) {
                                processCommands(currentModelTurnText.current);
                            }
                            currentModelTurnText.current = ''; // Reset for next turn
                            setStatus('listening');
                        }

                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData) {
                            // FIX: Use ref for nextStartTime
                            nextStartTime.current = Math.max(nextStartTime.current, outputAudioContext.current!.currentTime);
                            const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext.current!, 24000, 1);
                            const sourceNode = outputAudioContext.current!.createBufferSource();
                            sourceNode.buffer = audioBuffer;
                            sourceNode.connect(outputAudioContext.current!.destination);
                            sourceNode.addEventListener('ended', () => sources.delete(sourceNode));
                            sourceNode.start(nextStartTime.current);
                            nextStartTime.current += audioBuffer.duration;
                            sources.add(sourceNode);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setStatus('error');
                        stopConversation();
                    },
                    onclose: () => {
                       // Handled by stopConversation
                    },
                },
            });

        } catch (err) {
            console.error("Failed to start conversation:", err);
            setStatus('error');
        }
    // FIX: Removed `conversation` from dependencies to make function stable
    }, [portfolioData, onNavigate, onOpenProject, stopConversation, sources]);

    const handleToggle = () => {
        setIsOpen(prev => !prev);
    };
    
    useEffect(() => {
        if (isOpen) {
            startConversation();
        } else {
            stopConversation();
        }
    // FIX: Make this effect only dependent on `isOpen` and the stable functions
    }, [isOpen, startConversation, stopConversation]);

    // Cleanup on component unmount
    useEffect(() => {
        return () => { 
            stopConversation();
        }
    }, [stopConversation]);

    const StatusIndicator = () => {
        switch (status) {
            case 'listening': return <div className="text-sm text-green-500 font-semibold animate-pulse">Listening...</div>;
            case 'speaking': return <div className="text-sm text-blue-500 font-semibold">Speaking...</div>;
            case 'error': return <div className="text-sm text-red-500 font-semibold">Connection Error</div>;
            default: return <div className="text-sm text-gray-500 font-semibold">Press mic to start</div>;
        }
    };

    return (
        <>
            <button
                onClick={handleToggle}
                className={`fixed bottom-24 right-8 bg-gradient-to-r ${isOpen ? 'from-red-500 to-rose-600' : 'from-accent to-highlight'} text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl z-50 transform hover:scale-110 transition-all duration-300 animate-attention-shake`}
                aria-label={isOpen ? "Stop AI Assistant" : "Start AI Assistant"}
                style={{ bottom: '90px' }}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                )}
            </button>

            {isOpen && (
                <div className="fixed bottom-28 right-8 w-80 h-[450px] bg-white/80 backdrop-blur-lg border border-slate-200/90 rounded-lg shadow-2xl flex flex-col z-50 animate-slide-in" role="dialog" style={{bottom: '170px'}}>
                    <header className="bg-slate-100/90 p-3 rounded-t-lg text-text-primary border-b border-slate-200/90 text-center font-bold flex items-center justify-center space-x-2">
                         <span>AI Voice Assistant</span>
                    </header>
                    <div className="flex-1 p-3 overflow-y-auto space-y-3">
                        {conversation.length === 0 && (
                             <div className="p-2 text-sm text-text-secondary bg-accent/10 rounded-lg">
                                Hello! I'm an AI assistant. I'll start listening as soon as I'm ready. Feel free to ask me about this portfolio!
                            </div>
                        )}
                        {conversation.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-accent text-white' : 'bg-slate-200 text-text-primary'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-slate-200/90 flex items-center justify-center">
                        <StatusIndicator />
                    </div>
                </div>
            )}
        </>
    );
};

export default VoiceAssistantWidget;
