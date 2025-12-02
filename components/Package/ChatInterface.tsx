import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperPlaneRight, Sparkle, X, CaretDown } from 'phosphor-react';
import { Message, MessageType } from '../../types';
import { Button } from '../Core/Button';
import { Input } from '../Core/Input';
import { ChartRenderer } from './ChartRenderer';
import { Tokens, S, useIsMobile } from '../../utils/styles';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  isOpen: boolean;
  onClose: () => void;
  data: any;
  headers: any;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isProcessing,
  isOpen,
  onClose,
  data,
  headers
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput('');
  };

  const sidebarVariants = {
    open: { 
        y: 0, 
        opacity: 1, 
        scale: 1,
        pointerEvents: 'auto' as const
    },
    closed: { 
        y: isMobile ? '100%' : 20, 
        opacity: 0, 
        scale: isMobile ? 1 : 0.95,
        pointerEvents: 'none' as const
    },
  };

  return (
    <motion.div
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
      transition={Tokens.Effect.Transition.Bounce}
      style={{
        position: 'fixed',
        right: isMobile ? 0 : Tokens.Space[6],
        bottom: isMobile ? 0 : Tokens.Space[6],
        left: isMobile ? 0 : 'auto',
        top: isMobile ? Tokens.Space[10] : Tokens.Space[10], // On desktop, top spacing is managed by height, on mobile it goes to top
        width: isMobile ? '100%' : '420px',
        maxHeight: isMobile ? '100%' : 'calc(100vh - 48px)',
        backgroundColor: isMobile ? Tokens.Color.Base.Surface[1] : S.glass.backgroundColor,
        backdropFilter: 'blur(20px)',
        borderRadius: isMobile ? `${Tokens.Effect.Radius.L} ${Tokens.Effect.Radius.L} 0 0` : Tokens.Effect.Radius.L,
        boxShadow: Tokens.Effect.Shadow.Float,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: `1px solid ${Tokens.Color.Base.Border[1]}`,
      }}
    >
      {/* Header */}
      <div style={{
          ...S.flexBetween,
          padding: `${Tokens.Space[4]} ${Tokens.Space[5]}`,
          borderBottom: `1px solid ${Tokens.Color.Base.Border[1]}`,
          backgroundColor: isMobile ? Tokens.Color.Base.Surface[2] : 'rgba(255,255,255,0.5)',
      }}>
        <div style={{ ...S.flexCenter, gap: Tokens.Space[3] }}>
          <div style={{ 
              padding: Tokens.Space[2], 
              backgroundColor: Tokens.Color.Accent.Surface[2], 
              borderRadius: Tokens.Effect.Radius.Full, 
              color: Tokens.Color.Accent.Content[2] 
          }}>
            <Sparkle weight="fill" size={18} />
          </div>
          <div>
            <h2 style={{ ...Tokens.Type.Expressive.Display.S, fontSize: '1.25rem', color: Tokens.Color.Base.Content[1] }}>Analyst</h2>
          </div>
        </div>
        <Button variant="icon" onClick={onClose} aria-label="Close Chat" style={{ color: Tokens.Color.Base.Content[3] }}>
          {isMobile ? <CaretDown size={24} /> : <X size={20} />}
        </Button>
      </div>

      {/* Messages */}
      <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: Tokens.Space[5],
          display: 'flex',
          flexDirection: 'column',
          gap: Tokens.Space[5],
          backgroundColor: isMobile ? Tokens.Color.Base.Surface[1] : 'transparent',
      }} ref={scrollRef}>
        {messages.length === 0 && (
          <div style={{ ...S.flexCol, alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5, textAlign: 'center', padding: Tokens.Space[8] }}>
            <Sparkle size={48} color={Tokens.Color.Base.Content[3]} weight="thin" style={{ marginBottom: Tokens.Space[4] }} />
            <p style={{ ...Tokens.Type.Readable.Body.M, color: Tokens.Color.Base.Content[3] }}>Ask questions about your data.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id} 
            style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: msg.type === MessageType.USER ? 'flex-end' : 'flex-start', 
                width: '100%' 
            }}
          >
             {msg.type === MessageType.AI && <span style={{ ...Tokens.Type.Readable.Label.S, color: Tokens.Color.Base.Content[3], marginBottom: 4, marginLeft: 12 }}>LimeSheet</span>}
            <div style={{
                maxWidth: '90%',
                padding: `${Tokens.Space[3]} ${Tokens.Space[5]}`,
                borderRadius: Tokens.Effect.Radius.L,
                ...Tokens.Type.Readable.Body.M,
                lineHeight: 1.6,
                boxShadow: Tokens.Effect.Shadow.Soft,
                backgroundColor: msg.type === MessageType.USER ? Tokens.Color.Base.Content[1] : Tokens.Color.Base.Surface[1],
                color: msg.type === MessageType.USER ? Tokens.Color.Base.Surface[1] : Tokens.Color.Base.Content[1],
                borderBottomRightRadius: msg.type === MessageType.USER ? 4 : Tokens.Effect.Radius.L,
                borderBottomLeftRadius: msg.type === MessageType.AI ? 4 : Tokens.Effect.Radius.L,
                border: msg.type === MessageType.AI ? `1px solid ${Tokens.Color.Base.Border[1]}` : 'none',
            }}>
              {msg.content}
            </div>
            {msg.chartConfig && (
               <ChartRenderer config={msg.chartConfig} data={data} headers={headers} />
            )}
          </motion.div>
        ))}
        
        {isProcessing && (
          <div style={{ alignSelf: 'flex-start', padding: `${Tokens.Space[3]} ${Tokens.Space[5]}`, backgroundColor: Tokens.Color.Base.Surface[1], borderRadius: Tokens.Effect.Radius.L, borderBottomLeftRadius: 4, border: `1px solid ${Tokens.Color.Base.Border[1]}`, boxShadow: Tokens.Effect.Shadow.Soft }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0, 150, 300].map(delay => (
                <motion.div
                  key={delay}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: delay / 1000 }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: Tokens.Color.Accent.Surface[3] }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
          padding: Tokens.Space[4],
          backgroundColor: isMobile ? Tokens.Color.Base.Surface[1] : 'rgba(255,255,255,0.8)',
          borderTop: `1px solid ${Tokens.Color.Base.Border[1]}`,
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: Tokens.Space[2], alignItems: 'center', backgroundColor: Tokens.Color.Base.Surface[2], padding: Tokens.Space[2], borderRadius: Tokens.Effect.Radius.Full, border: `1px solid ${Tokens.Color.Base.Border[1]}` }}>
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your instruction..."
            disabled={isProcessing}
            style={{ flex: 1, marginBottom: 0 }}
            // Override Input component style for this specific context
          />
          {/* We need to inject styles to hide the default input borders since we have a container */}
          <style>{`
            input { background: transparent !important; border: none !important; box-shadow: none !important; padding-left: 12px !important; }
          `}</style>
          
          <Button 
            type="submit" 
            variant="primary"
            disabled={!input.trim() || isProcessing}
            style={{ borderRadius: Tokens.Effect.Radius.Full, aspectRatio: '1/1', padding: 0, width: '40px', height: '40px', flexShrink: 0 }}
          >
             <PaperPlaneRight size={20} weight="fill" />
          </Button>
        </form>
      </div>
    </motion.div>
  );
};