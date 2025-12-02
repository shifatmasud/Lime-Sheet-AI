import React, { useRef, useState } from 'react';
import { DownloadSimple, UploadSimple, Link as LinkIcon, FileCsv } from 'phosphor-react';
import { Button } from '../Core/Button';
import { Input } from '../Core/Input';
import { Tokens, S } from '../../utils/styles';

interface ToolbarProps {
  onImportCSV: (file: File) => void;
  onImportURL: (url: string) => void;
  onExportCSV: () => void;
  fileName: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onImportCSV, onImportURL, onExportCSV, fileName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [url, setUrl] = useState('');

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

  return (
    <div style={{
      ...S.flexCol,
      gap: Tokens.Space[4],
      padding: Tokens.Space[4],
      backgroundColor: Tokens.Color.Base.Surface[1],
      borderBottom: `1px solid ${Tokens.Color.Base.Border[1]}`,
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      <div style={{
        ...S.flexBetween,
        flexWrap: 'wrap',
        gap: Tokens.Space[4],
      }}>
        {/* Branding & File Info */}
        <div style={{ ...S.flexCenter, gap: Tokens.Space[3] }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: Tokens.Effect.Radius.M,
            backgroundColor: Tokens.Color.Accent.Surface[1],
            ...S.flexCenter,
            boxShadow: Tokens.Effect.Shadow.Glow,
          }}>
            <FileCsv size={24} weight="duotone" color={Tokens.Color.Accent.Content[1]} />
          </div>
          <div>
            <h1 style={{ ...Tokens.Type.Expressive.Display.M, color: Tokens.Color.Base.Content[1], lineHeight: 1 }}>LimeSheet</h1>
            <p style={{ ...Tokens.Type.Readable.Label.S, color: Tokens.Color.Base.Content[3], maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {fileName}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: Tokens.Space[2], overflowX: 'auto', paddingBottom: '2px' }}>
          
          {showUrlInput ? (
            <form onSubmit={handleUrlSubmit} style={{ display: 'flex', alignItems: 'center', gap: Tokens.Space[2] }}>
              <div style={{ width: '250px' }}>
                <Input 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)} 
                  placeholder="Paste Google Sheet CSV URL..." 
                  autoFocus
                />
              </div>
              <Button type="submit" size="sm" variant="primary">Go</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowUrlInput(false)}>Cancel</Button>
            </form>
          ) : (
            <>
              <Button variant="secondary" size="sm" icon={<UploadSimple size={16} />} onClick={() => fileInputRef.current?.click()}>
                Import CSV
              </Button>
              <Button variant="secondary" size="sm" icon={<LinkIcon size={16} />} onClick={() => setShowUrlInput(true)}>
                From URL
              </Button>
              <Button variant="ghost" size="sm" icon={<DownloadSimple size={16} />} onClick={onExportCSV}>
                Export
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
      </div>
    </div>
  );
};