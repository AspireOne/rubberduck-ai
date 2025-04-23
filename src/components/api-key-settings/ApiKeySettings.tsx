import React, { useState } from 'react';
import './ApiKeySettings.scss';

interface ApiKeySettingsProps {
  currentApiKey: string | null;
  onSave: (apiKey: string) => void;
  onClose: () => void;
}

const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ currentApiKey, onSave, onClose }) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }
    
    onSave(apiKey);
    onClose();
  };

  return (
    <div className="api-key-settings-overlay" onClick={onClose}>
      <div className="api-key-settings-container" onClick={(e) => e.stopPropagation()}>
        <div className="api-key-settings-header">
          <h2>API Key Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="api-key">Gemini API Key</label>
            <input
              id="api-key"
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
          
          <div className="button-group">
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="save-button">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeySettings;
