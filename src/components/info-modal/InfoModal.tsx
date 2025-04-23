import React from 'react';
import './InfoModal.scss';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="info-modal-overlay" onClick={onClose}>
      <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2>About Quacky - Your AI Rubber Duck</h2>
        <div className="info-content">
          <p>
            Quacky is an AI-powered rubber duck debugging assistant that helps you think through problems using Socratic questioning.
          </p>
          
          <h3>What is Rubber Duck Debugging?</h3>
          <p>
            Rubber duck debugging is a method of debugging code by explaining it line-by-line to an inanimate object, like a rubber duck. 
            The process of explaining the problem often helps you find the solution on your own.
          </p>
          
          <h3>How to Use Quacky</h3>
          <p>
            1. Select a mode (Programming, General, or Custom) based on your needs
          </p>
          <p>
            2. Speak to Quacky about your problem or use the text input
          </p>
          <p>
            3. Quacky will ask questions to help you think through your problem
          </p>
          <p>
            4. You can share your screen or webcam to show Quacky what you're working on
          </p>
          
          <h3>Modes</h3>
          <p>
            <strong>Programming Mode:</strong> Optimized for coding problems and technical discussions
          </p>
          <p>
            <strong>General Mode:</strong> For everyday problem-solving and brainstorming
          </p>
          <p>
            <strong>Custom Mode:</strong> Define your own prompt for specialized assistance
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
