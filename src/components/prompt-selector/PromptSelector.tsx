/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useState } from "react";
import { useMode } from "../../App";
import cn from "classnames";
import "./prompt-selector.scss";
import { constants } from "../../constants";

const PromptSelector = () => {
  const { mode, setMode, customPrompt, setCustomPrompt } = useMode();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(customPrompt);

  const handleModeChange = (newMode: 'general' | 'programming' | 'custom') => {
    setMode(newMode);
    setIsExpanded(false);
  };

  const handleCustomPromptSave = () => {
    setCustomPrompt(editingPrompt);
    setMode('custom');
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setEditingPrompt(customPrompt);
    setIsExpanded(false);
  };

  // Initialize editing prompt when expanding
  const handleExpandClick = () => {
    if (!isExpanded) {
      setEditingPrompt(customPrompt || "");
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={cn("prompt-selector-container", { expanded: isExpanded })}>
      <div className="prompt-selector-header" onClick={handleExpandClick}>
        <span className="prompt-mode-label">
          {mode === 'general' ? 'General Mode' : 
           mode === 'programming' ? 'Programming Mode' : 
           'Custom Prompt'}
        </span>
        <span className="material-symbols-outlined">
          {isExpanded ? 'expand_less' : 'expand_more'}
        </span>
      </div>
      
      {isExpanded && (
        <div className="prompt-selector-content">
          <div className="prompt-options">
            <div 
              className={cn("prompt-option", { active: mode === 'general' })}
              onClick={() => handleModeChange('general')}
            >
              <div className="option-header">
                <span className="material-symbols-outlined">chat</span>
                <h3>General Mode</h3>
              </div>
              <p className="prompt-preview">{constants.generalModePrompt.substring(0, 100)}...</p>
            </div>
            
            <div 
              className={cn("prompt-option", { active: mode === 'programming' })}
              onClick={() => handleModeChange('programming')}
            >
              <div className="option-header">
                <span className="material-symbols-outlined">code</span>
                <h3>Programming Mode</h3>
              </div>
              <p className="prompt-preview">{constants.programmingPrompt.substring(0, 100)}...</p>
            </div>
            
            <div className={cn("prompt-option custom", { active: mode === 'custom' })}>
              <div className="option-header">
                <span className="material-symbols-outlined">edit</span>
                <h3>Custom Prompt</h3>
              </div>
              <textarea
                value={editingPrompt}
                onChange={(e) => setEditingPrompt(e.target.value)}
                placeholder="Enter your custom prompt here..."
                rows={5}
              />
              <div className="custom-prompt-actions">
                <button 
                  className="cancel-button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button 
                  className="save-button"
                  onClick={handleCustomPromptSave}
                  disabled={!editingPrompt.trim()}
                >
                  Save & Use
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptSelector;
