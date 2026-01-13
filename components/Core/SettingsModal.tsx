
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key } from 'phosphor-react';
import { Tokens, S, useIsMobile } from '../../utils/styles';
import { Button } from './Button';
import { Input } from './Input';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string | null;
  onSaveApiKey: (key: string) => void;
  onResetApiKey: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentApiKey,
  onSaveApiKey,
  onResetApiKey,
}) => {
  const [localApiKey, setLocalApiKey] = useState(currentApiKey || '');
  const isMobile = useIsMobile();

  useEffect(() => {
    setLocalApiKey(currentApiKey || '');
  }, [currentApiKey, isOpen]);

  const handleSave = () => {
    onSaveApiKey(localApiKey.trim());
    onClose();
  };

  const handleReset = () => {
    onResetApiKey();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          ...S.absoluteFill,
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose} // Close on backdrop click
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={Tokens.Effect.Transition.Bounce}
          style={{
            width: isMobile ? '90%' : '500px',
            backgroundColor: Tokens.Color.Base.Surface[1],
            borderRadius: Tokens.Effect.Radius.L,
            boxShadow: Tokens.Effect.Shadow.Float,
            border: `1px solid ${Tokens.Color.Base.Border[1]}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
        >
          {/* Modal Header */}
          <div style={{ padding: Tokens.Space[5], borderBottom: `1px solid ${Tokens.Color.Base.Border[1]}`, ...S.flexBetween }}>
            <div>
              <h3 id="settings-modal-title" style={{ ...Tokens.Type.Readable.Label.L, color: Tokens.Color.Base.Content[1] }}>App Settings</h3>
              <p style={{ ...Tokens.Type.Readable.Body.S, color: Tokens.Color.Base.Content[3] }}>Configure your LimeSheet experience.</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: Tokens.Color.Base.Content[2], padding: Tokens.Space[2] }}>
              <X size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div style={{ padding: Tokens.Space[5], display: 'flex', flexDirection: 'column', gap: Tokens.Space[5] }}>
            <Input
              label="Gemini API Key"
              placeholder="AIzaSy..."
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              leftIcon={<Key size={16} />}
              autoFocus
              aria-label="Gemini API Key input"
            />
            <p style={{ ...Tokens.Type.Readable.Body.S, color: Tokens.Color.Base.Content[3] }}>
              A valid API key is required for AI features. Obtain one from Google AI Studio.
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ marginLeft: Tokens.Space[1], color: Tokens.Color.Accent.Content[2], textDecoration: 'underline' }}
              >
                Billing Info
              </a>
            </p>
          </div>

          {/* Modal Footer */}
          <div style={{ padding: Tokens.Space[5], borderTop: `1px solid ${Tokens.Color.Base.Border[1]}`, display: 'flex', justifyContent: 'flex-end', gap: Tokens.Space[2], backgroundColor: Tokens.Color.Base.Surface[2] }}>
            <Button variant="ghost" onClick={handleReset}>Reset to Default</Button>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={!localApiKey.trim()}>Save Key</Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
