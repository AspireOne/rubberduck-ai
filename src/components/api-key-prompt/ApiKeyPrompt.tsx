import React, {useState} from 'react';
import './ApiKeyPrompt.scss';

interface ApiKeyPromptProps {
  onSubmit: (apiKey: string) => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({onSubmit}) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }

    onSubmit(apiKey);
  };

  return (
    <div className="api-key-prompt-overlay">
      <div className="api-key-prompt-container">
        <div className="duck-logo">
          <img src="https://pngimg.com/uploads/rubber_duck/rubber_duck_PNG54.png" alt="Rubber Duck" />
        </div>
        
        <h1>Welcome to Quacky</h1>
        <h2>Your AI Rubber Duck</h2>
        <p>Quacky helps you think through problems with Socratic questioning - whether it's coding challenges or life decisions!</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              placeholder="Enter your Gemini API key"
              className={error ? 'error' : ''}
            />
            {error && <div className="error-message">{error}</div>}
          </div>

          <button type="submit">Let's Get Quacking!</button>
        </form>

        <div className="info-text">
          <p>You'll need a Gemini API key to chat with Quacky. Get one for free from the <a href="https://aistudio.google.com/apikey" target="_blank"
                                                rel="noopener noreferrer">Google AI Studio</a></p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyPrompt;
