import React, { useRef, useState, useEffect } from 'react';
import { DownloadSimple, UploadSimple, Link as LinkIcon, FileCsv, Sun, Moon } from 'phosphor-react';
import { Button } from '../Core/Button';
import { Input } from '../Core/Input';
import { Tokens, S, useIsMobile } from '../../utils/styles';

interface HeaderProps {
  onImportCSV: (file: File) => void;
  onImportURL: (url: string) => void;
  onExportCSV: () => void;
  onRename: (newName: string) => void;
  onToggleTheme: () => void;
  isDark: boolean;
  fileName: string;
}

export const Header: React.FC<HeaderProps> = ({ onImportCSV, onImportURL, onExportCSV, onRename, onToggleTheme, isDark, fileName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [url, setUrl] = useState('');
  const isMobile = useIsMobile();
  
  // Rename state
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(fileName);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempName(fileName);
  }, [fileName]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportCSV(e.target.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
        onImportURL(url);
        setShowUrlInput(false);
        setUrl('');
    }
  };

  const saveName = () => {
    if (tempName.trim()) {
      onRename(tempName);
    } else {
      setTempName(fileName); // Revert if empty
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveName();
    if (e.key === 'Escape') {
      setTempName(fileName);
      setIsEditingName(false);
    }
  };

  // Helper for touch-friendly icon buttons
  const iconButtonStyle: React.CSSProperties = {
    padding: Tokens.Space[3],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: Tokens.Color.Base.Content[2],
    transition: 'color 0.2s',
    backgroundColor: 'transparent'
  };

  return (
    <header style={{
      ...S.flexBetween,
      width: '100%',
      height: isMobile ? '70px' : '90px',
      padding: isMobile ? `0 ${Tokens.Space[4]}` : `0 ${Tokens.Space[8]}`,
      position: 'relative',
      zIndex: 30,
    }}>
      {/* Branding & File Name */}
      <div style={{ ...S.flexCenter, gap: Tokens.Space[4] }}>
        <div style={{
            width: '40px',
            height: '40px',
            borderRadius: Tokens.Effect.Radius.M,
            backgroundColor: Tokens.Color.Accent.Surface[1],
            boxShadow: Tokens.Effect.Shadow.Glow,
            ...S.flexCenter,
            color: Tokens.Color.Accent.Content[1]
        }}>
          <FileCsv size={24} weight="duotone" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          <h1 style={{ ...Tokens.Type.Expressive.Display.S, fontSize: '1.25rem', color: Tokens.Color.Base.Content[1], lineHeight: 1 }}>LimeSheet</h1>
          
          {/* Editable File Name */}
          <div style={{ display: 'flex', alignItems: 'center', height: '20px' }}>
            {isEditingName ? (
              <input
                ref={nameInputRef}
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={saveName}
                onKeyDown={handleKeyDown}
                style={{
                    ...Tokens.Type.Readable.Label.S,
                    color: Tokens.Color.Base.Content[1],
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${Tokens.Color.Accent.Surface[1]}`,
                    outline: 'none',
                    padding: '0',
                    minWidth: '100px',
                }}
              />
            ) : (
              <div 
                onClick={() => setIsEditingName(true)}
                style={{ 
                  ...Tokens.Type.Readable.Label.S, 
                  color: Tokens.Color.Base.Content[2], 
                  cursor: 'pointer',
                  opacity: 0.8,
                }}
                title="Click to rename"
              >
                {fileName}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toolbar Island */}
      <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: Tokens.Color.Base.Surface[1], 
          borderRadius: Tokens.Effect.Radius.Full, 
          boxShadow: Tokens.Effect.Shadow.Float,
          border: `1px solid ${Tokens.Color.Base.Border[1]}`,
          padding: '2px',
          height: '44px'
      }}>
        {showUrlInput ? (
          <form onSubmit={handleUrlSubmit} style={{ display: 'flex', gap: Tokens.Space[2], alignItems: 'center', padding: `0 ${Tokens.Space[2]}` }}>
            <div style={{ width: '180px' }}>
              <Input 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="Paste Link..." 
                autoFocus
                style={{ marginBottom: 0 }} 
              />
            </div>
            <Button type="submit" size="sm" variant="primary">Go</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowUrlInput(false)}>Cancel</Button>
          </form>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 0 }}>
                <Button variant="ghost" style={iconButtonStyle} onClick={() => fileInputRef.current?.click()} title="Import CSV">
                  <UploadSimple size={18} />
                </Button>
                <Button variant="ghost" style={iconButtonStyle} onClick={() => setShowUrlInput(true)} title="Import from URL">
                  <LinkIcon size={18} />
                </Button>
                <div style={{ width: '1px', height: '20px', backgroundColor: Tokens.Color.Base.Border[2], alignSelf: 'center', margin: '0 4px' }} />
                <Button variant="ghost" style={iconButtonStyle} onClick={onExportCSV} title="Export CSV">
                  <DownloadSimple size={18} />
                </Button>
            </div>

            <div style={{ width: '1px', height: '20px', backgroundColor: Tokens.Color.Base.Border[2], alignSelf: 'center', margin: '0 4px' }} />

            <Button variant="ghost" onClick={onToggleTheme} title={isDark ? "Light Mode" : "Dark Mode"} style={iconButtonStyle}>
               {isDark ? <Sun size={18} weight="fill" /> : <Moon size={18} weight="fill" />}
            </Button>
          </>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".csv" 
          style={{ display: 'none' }} 
        />
      </div>
    </header>
  );
};