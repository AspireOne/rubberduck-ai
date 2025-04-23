import {useEffect, useRef, useState} from "react";
import "./App.scss";
import {LiveAPIProvider} from "./contexts/LiveAPIContext";
import SidePanel from "./components/side-panel/SidePanel";
import {Altair} from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";
import AudioPulse from "./components/audio-pulse/AudioPulse";
import cn from "classnames";
import {constants} from "./constants";
import { useLiveAPIContext } from "./contexts/LiveAPIContext";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const uri = constants.wssEndpoint;

// Component for the main app content
function AppContent() {
  // this video reference is used for displaying the active stream, whether that is the webcam or screen capture
  // feel free to style as you see fit
  const videoRef = useRef<HTMLVideoElement>(null);
  // either the screen capture, the video or null, if null we hide it
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const { connected, volume } = useLiveAPIContext();

  const isVideoActive = !!videoStream;

  return (
    <div className="streaming-console">
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
              <img style={{
                maxWidth: "400px",
                maxHeight: "400px",
              }} src={"https://pngimg.com/uploads/rubber_duck/rubber_duck_PNG54.png"} alt="Rubber duck"/>
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
  return (
    <div className="App">
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <AppContent />
      </LiveAPIProvider>
    </div>
  );
}

export default App;