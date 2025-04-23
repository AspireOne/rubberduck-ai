import {useEffect, useRef, useState, useMemo, useCallback, createContext, useContext} from "react";
import "./App.scss";
import {LiveAPIProvider} from "./contexts/LiveAPIContext";
import SidePanel from "./components/side-panel/SidePanel";
import {Altair} from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";
import AudioPulse from "./components/audio-pulse/AudioPulse";
import cn from "classnames";
import {constants} from "./constants";
import { useLiveAPIContext } from "./contexts/LiveAPIContext";

// Create a context for the mode
export type ModeContextType = {
  mode: 'programming' | 'general';
  setMode: (mode: 'programming' | 'general') => void;
};

const ModeContext = createContext<ModeContextType>({
  mode: 'general',
  setMode: () => {},
});

export const useMode = () => useContext(ModeContext);

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const uri = constants.wssEndpoint;

// Component for the main app content
// Mode switch component
function ModeSwitch() {
  const { mode, setMode } = useMode();
  
  return (
    <div className="mode-switch-container" style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '8px 12px',
      borderRadius: '20px',
      backdropFilter: 'blur(5px)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
    }}>
      <span style={{ 
        color: mode === 'general' ? '#fff' : 'rgba(255, 255, 255, 0.5)',
        fontWeight: mode === 'general' ? 'bold' : 'normal',
        transition: 'color 0.3s ease'
      }}>
        General
      </span>
      <label className="switch" style={{
        position: 'relative',
        display: 'inline-block',
        width: '40px',
        height: '20px'
      }}>
        <input 
          type="checkbox" 
          checked={mode === 'programming'} 
          onChange={() => setMode(mode === 'programming' ? 'general' : 'programming')}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span className="slider" style={{
          position: 'absolute',
          cursor: 'pointer',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: mode === 'programming' ? '#4285F4' : '#ccc',
          transition: '0.4s',
          borderRadius: '34px'
        }}>
          <span className="slider-button" style={{
            position: 'absolute',
            content: '""',
            height: '16px',
            width: '16px',
            left: mode === 'programming' ? '22px' : '2px',
            bottom: '2px',
            backgroundColor: 'white',
            transition: '0.4s',
            borderRadius: '50%'
          }}></span>
        </span>
      </label>
      <span style={{ 
        color: mode === 'programming' ? '#fff' : 'rgba(255, 255, 255, 0.5)',
        fontWeight: mode === 'programming' ? 'bold' : 'normal',
        transition: 'color 0.3s ease'
      }}>
        Programming
      </span>
    </div>
  );
}

function AppContent() {
  // this video reference is used for displaying the active stream, whether that is the webcam or screen capture
  // feel free to style as you see fit
  const videoRef = useRef<HTMLVideoElement>(null);
  // either the screen capture, the video or null, if null we hide it
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const { connected, volume } = useLiveAPIContext();
  const [randomTurn, setRandomTurn] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const lastTurnTimeRef = useRef<number>(0);
  const lastFlipTimeRef = useRef<number>(0);
  const mode = useMode();
  
  // Function to trigger random turning when speaking
  useEffect(() => {
    if (!connected || volume <= 0.05) return;
    
    const currentTime = Date.now();
    if (currentTime - lastTurnTimeRef.current > 3000) { // Check if at least 3 seconds passed
      const shouldTurn = Math.random() < 0.1; // 10% chance per check (happens every 100ms due to AudioPulse)
      
      if (shouldTurn) {
        const newAngle = (Math.random() * 2 - 1) * 30; // Random angle between -30 and 30 degrees
        setRandomTurn(newAngle);
        lastTurnTimeRef.current = currentTime;
        
        // Reset turn after a delay
        setTimeout(() => {
          setRandomTurn(0);
        }, 1500);
      }
    }
  }, [connected, volume]);
  
  // Function to trigger random flipping only when talking
  useEffect(() => {
    if (!connected || volume <= 0.05) return;
    
    const flipInterval = setInterval(() => {
      const currentTime = Date.now();
      // Only flip if enough time has passed (5-12 seconds)
      if (currentTime - lastFlipTimeRef.current > 5000) {
        // Random chance to flip (adjusted to make it happen roughly every 5-12 seconds)
        const shouldFlip = Math.random() < 0.15;
        
        if (shouldFlip) {
          setIsFlipped(prev => !prev);
          lastFlipTimeRef.current = currentTime;
        }
      }
    }, 1000);
    
    return () => clearInterval(flipInterval);
  }, [connected, volume]);

  const isVideoActive = !!videoStream;

  return (
    <div className="streaming-console">
      <ModeSwitch />
      <SidePanel/>
      <main>
        <div className="main-app-area">
          {/* Audio Visualization as a standalone element positioned strategically */}
          <div className="main-audio-visualization-container">
            <AudioPulse volume={volume} active={connected} hover={true} />
          </div>

          {/* APP content area */}
          <div className="app-content">
            <Altair/>
            {
              !isVideoActive &&
              <div 
                className={cn("duck-container", { waddling: connected && volume > 0.05 })}
                style={{
                  position: "relative",
                  display: "inline-block",
                }}
              >
                <img 
                  style={{
                    maxWidth: "400px",
                    maxHeight: "400px",
                    transform: connected ? 
                      `${isFlipped ? 'scaleX(-1)' : ''} rotate(${volume > 0.05 ? (randomTurn || Math.min(12, volume * 25)) : 0}deg)` : 
                      'none',
                    transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }} 
                  src={"https://pngimg.com/uploads/rubber_duck/rubber_duck_PNG54.png"} 
                  alt="Rubber duck"
                />
                <style>
                  {`
                    .duck-container.waddling {
                      animation: waddle ${Math.max(0.8, 1.5 - volume)}s infinite alternate cubic-bezier(0.445, 0.05, 0.55, 0.95);
                    }
                    
                    @keyframes waddle {
                      0% {
                        transform: translateX(-${Math.min(25, volume * 50)}px) rotate(-${Math.min(8, volume * 15)}deg);
                      }
                      20% {
                        transform: translateX(-${Math.min(18, volume * 36)}px) rotate(-${Math.min(5, volume * 10)}deg);
                      }
                      40% {
                        transform: translateX(-${Math.min(10, volume * 20)}px) rotate(${Math.min(2, volume * 4)}deg);
                      }
                      60% {
                        transform: translateX(${Math.min(10, volume * 20)}px) rotate(-${Math.min(2, volume * 4)}deg);
                      }
                      80% {
                        transform: translateX(${Math.min(18, volume * 36)}px) rotate(${Math.min(5, volume * 10)}deg);
                      }
                      100% {
                        transform: translateX(${Math.min(25, volume * 50)}px) rotate(${Math.min(8, volume * 15)}deg);
                      }
                    }
                  `}
                </style>
              </div>
            }
            <video
              className={cn("stream", {
                hidden: !isVideoActive,
              })}
              ref={videoRef}
              autoPlay
              playsInline
            />
          </div>
        </div>

        <ControlTray
          videoRef={videoRef}
          supportsVideo={true}
          onVideoStreamChange={setVideoStream}
        >
          {/* put your own buttons here */}
        </ControlTray>
      </main>
    </div>
  );
}

function App() {
  const [mode, setMode] = useState<'programming' | 'general'>('general');

  return (
    <div className="App">
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <ModeContext.Provider value={{ mode, setMode }}>
          <AppContent />
        </ModeContext.Provider>
      </LiveAPIProvider>
    </div>
  );
}

export default App;
