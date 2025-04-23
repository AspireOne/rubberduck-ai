import {useEffect, useRef, useState, createContext, useContext} from "react";
import "./App.scss";
import {LiveAPIProvider} from "./contexts/LiveAPIContext";
import SidePanel from "./components/side-panel/SidePanel";
import {Altair} from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";
import AudioPulse from "./components/audio-pulse/AudioPulse";
import ApiKeyPrompt from "./components/api-key-prompt/ApiKeyPrompt";
import PromptSelector from "./components/prompt-selector/PromptSelector";
import cn from "classnames";
import {constants} from "./constants";
import {useLiveAPIContext} from "./contexts/LiveAPIContext";
import {useApiKey} from "./api-key-provider";

// Create a context for the mode
export type ModeType = 'programming' | 'general' | 'custom' | 'quackPro';

export type ModeContextType = {
  mode: ModeType;
  setMode: (mode: ModeType) => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
};

const ModeContext = createContext<ModeContextType>({
  mode: 'general',
  setMode: () => {},
  customPrompt: '',
  setCustomPrompt: () => {},
});

export const useMode = () => useContext(ModeContext);

const uri = constants.wssEndpoint;

// Component for the main app content
// Mode switch component - now uses the PromptSelector
function ModeSwitch() {
  return <PromptSelector />;
}

function AppContent() {
  // this video reference is used for displaying the active stream, whether that is the webcam or screen capture
  // feel free to style as you see fit
  const videoRef = useRef<HTMLVideoElement>(null);
  // either the screen capture, the video or null, if null we hide it
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const {connected, volume} = useLiveAPIContext();
  const [randomTurn, setRandomTurn] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const lastTurnTimeRef = useRef<number>(0);

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
        className={cn("side-panel-overlay", {visible: sidebarOpen})}
        onClick={handleOverlayClick}
      ></div>

      {/* Side panel with open class controlled by state - only use the mobile version on small screens */}
      <div className="desktop-sidebar">
        <SidePanel/>
      </div>

      {/* Mobile sidebar that overlays content */}
      <div className={cn("mobile-sidebar", {open: sidebarOpen})}>
        <SidePanel/>
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
                      `rotate(${volume > 0.05 ? (randomTurn || Math.min(12, volume * 25)) : 0}deg)` :
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
  const [mode, setMode] = useState<ModeType>('general');
  const [customPrompt, setCustomPrompt] = useState<string>('');
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
        <ModeContext.Provider value={{mode, setMode, customPrompt, setCustomPrompt}}>
          <AppContent/>
        </ModeContext.Provider>
      </LiveAPIProvider>
    </div>
  );
}

export default App;
