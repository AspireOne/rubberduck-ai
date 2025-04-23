import {useState, useEffect} from 'react';

export const apiKeyProvider = {
  getApiKey: (): string | null => {
    const apiKey = localStorage.getItem("gemini_api_key");
    return apiKey || null;
  },
  setApiKey: (apiKey: string) => {
    localStorage.setItem("gemini_api_key", apiKey);
    // Dispatch a custom event when the API key changes
    window.dispatchEvent(new Event('api_key_changed'));
  }
}

export const useApiKey = () => {
  const [apiKey, setApiKeyState] = useState<string | null>(apiKeyProvider.getApiKey());

  // Listen for changes to the API key
  useEffect(() => {
    const handleApiKeyChange = () => {
      setApiKeyState(apiKeyProvider.getApiKey());
    };

    // Listen for the custom event
    window.addEventListener('api_key_changed', handleApiKeyChange);

    // Clean up the event listener
    return () => {
      window.removeEventListener('api_key_changed', handleApiKeyChange);
    };
  }, []);

  const getApiKey = (): string | null => {
    return apiKey;
  };

  const setApiKey = (newApiKey: string): void => {
    apiKeyProvider.setApiKey(newApiKey);
    setApiKeyState(newApiKey);
  };

  return {getApiKey, setApiKey, apiKey};
};
