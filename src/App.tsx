import {useEffect, useRef, useState, createContext, useContext} from "react";
import "./App.scss";
import {LiveAPIProvider} from "./contexts/LiveAPIContext";
import SidePanel from "./components/side-panel/SidePanel";
import {Altair} from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";
import AudioPulse from "./components/audio-pulse/AudioPulse";
import ApiKeyPrompt from "./components/api-key-prompt/ApiKeyPrompt";
import cn from "classnames";
import {constants} from "./constants";
import {useLiveAPIContext} from "./contexts/LiveAPIContext";
import {useApiKey} from "./api-key-provider";

// Create a context for the mode
export type ModeContextType = {
  mode: 'programming' | 'general';
  setMode: (mode: 'programming' | 'general') => void;
};

const ModeContext = createContext<ModeContextType>({
  mode: 'general',
  setMode: () => {
  },
});

export const useMode = () => useContext(ModeContext);

const uri = constants.wssEndpoint;

// Component for the main app content
// Mode switch component
function ModeSwitch() {
  const {mode, setMode} = useMode();

  return (
    <div className="mode-switch-container">
      <span className={mode === 'general' ? 'active' : ''}>
        General
      </span>
      <label className="switch">
        <input
          type="checkbox"
          checked={mode === 'programming'}
          onChange={() => setMode(mode === 'programming' ? 'general' : 'programming')}
        />
        <span className="slider">
          <span className="slider-button"></span>
        </span>
      </label>
      <span className={mode === 'programming' ? 'active' : ''}>
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
  const {connected, volume} = useLiveAPIContext();
  const [randomTurn, setRandomTurn] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const lastTurnTimeRef = useRef<number>(0);
  const lastFlipTimeRef = useRef<number>(0);

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

  // Close sidebar when clicking outside
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="streaming-console">
      <ModeSwitch/>
      
      {/* Mobile sidebar toggle button */}
      <button 
        className="mobile-sidebar-toggle" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <span className="material-symbols-outlined">
          {sidebarOpen ? 'close' : 'menu'}
        </span>
      </button>
      
      {/* Overlay for mobile */}
      <div 
        className={cn("side-panel-overlay", { visible: sidebarOpen })} 
        onClick={handleOverlayClick}
      ></div>
      
      {/* Side panel with open class controlled by state - only use the mobile version on small screens */}
      <div className="desktop-sidebar">
        <SidePanel />
      </div>
      
      {/* Mobile sidebar that overlays content */}
      <div className={cn("mobile-sidebar", { open: sidebarOpen })}>
        <SidePanel />
      </div>
      <main>
        <div className="main-app-area">
          {/* Audio Visualization as a standalone element positioned strategically */}
          <div className="main-audio-visualization-container">
            <AudioPulse volume={volume} active={connected} hover={true}/>
          </div>

          {/* APP content area */}
          <div className="app-content">
            <Altair/>
            {
              !isVideoActive &&
              <div
                className={cn("duck-container", {waddling: connected && volume > 0.05})}
                style={{
                  position: "relative",
                  display: "inline-block",
                }}
              >
                <img
                  style={{
                    maxWidth: "min(400px, 60vw)",
                    maxHeight: "min(400px, 60vh)",
                    width: "auto",
                    height: "auto",
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
  const {apiKey, setApiKey} = useApiKey();

  const handleApiKeySubmit = (newApiKey: string) => {
    setApiKey(newApiKey);
  };

  // If there's no API key, show the prompt
  if (!apiKey) {
    return (
      <div className="App">
        <ApiKeyPrompt onSubmit={handleApiKeySubmit}/>
      </div>
    );
  }

  // Otherwise, show the main app
  return (
    <div className="App">
      <LiveAPIProvider url={uri} apiKey={apiKey}>
        <ModeContext.Provider value={{mode, setMode}}>
          <AppContent/>
        </ModeContext.Provider>
      </LiveAPIProvider>
    </div>
  );
}

export default App;
