import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperPlaneRight, Sparkle, X, CaretDown, Plus, Trash, ChartBar, ChatCircleDots } from 'phosphor-react';
import { Message, MessageType, DashboardItem, ChartConfig } from '../../types';
import { Button } from '../Core/Button';
import { Input } from '../Core/Input';
import { ChartRenderer } from './ChartRenderer';
import { Tokens, S, useIsMobile } from '../../utils/styles';
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  messages: Message[];
  dashboard: DashboardItem[];
  onSendMessage: (text: string) => void;
  onAddDashboardItem: (item: DashboardItem) => void;
  onRemoveDashboardItem: (id: string) => void;
  onUpdateDashboardItem: (item: DashboardItem) => void;
  isProcessing: boolean;
  isOpen: boolean;
  onClose: () => void;
  data: any;
  headers: any;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  dashboard,
  onSendMessage,
  onAddDashboardItem,
  onRemoveDashboardItem,
  onUpdateDashboardItem,
  isProcessing,
  isOpen,
  onClose,
  data,
  headers
}) => {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (activeTab === 'chat' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput('');
  };

  const handleAddChart = () => {
    const newChart: DashboardItem = {
      id: uuidv4(),
      config: {
        type: 'bar',
        dataKey: headers[0] || '',
        series: headers.slice(1, 2) || [],
        title: 'New Analysis'
      }
    };
    onAddDashboardItem(newChart);
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
        top: isMobile ? Tokens.Space[10] : Tokens.Space[10], // On desktop, top spacing is managed by height
        width: isMobile ? '100%' : '500px',
        maxHeight: isMobile ? '100%' : 'calc(100vh - 48px)',
        backgroundColor: isMobile ? Tokens.Color.Base.Surface[1] : S.glass.backgroundColor,
        backdropFilter: 'blur(24px)',
        borderRadius: isMobile ? `${Tokens.Effect.Radius.L} ${Tokens.Effect.Radius.L} 0 0` : Tokens.Effect.Radius.L,
        boxShadow: Tokens.Effect.Shadow.Float,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: `1px solid ${Tokens.Color.Base.Border[1]}`,
      }}
    >
      {/* Header Tabs */}
      <div style={{
          display: 'flex',
          flexDirection: 'column',
          borderBottom: `1px solid ${Tokens.Color.Base.Border[1]}`,
          backgroundColor: isMobile ? Tokens.Color.Base.Surface[2] : 'rgba(255,255,255,0.5)',
      }}>
        <div style={{ ...S.flexBetween, padding: `${Tokens.Space[4]} ${Tokens.Space[5]}` }}>
            <div style={{ display: 'flex', gap: Tokens.Space[4] }}>
                <div 
                    onClick={() => setActiveTab('chat')}
                    style={{ 
                        ...Tokens.Type.Readable.Label.M, 
                        color: activeTab === 'chat' ? Tokens.Color.Accent.Content[2] : Tokens.Color.Base.Content[3],
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 0',
                        position: 'relative'
                    }}
                >
                    <ChatCircleDots size={18} weight={activeTab === 'chat' ? 'fill' : 'regular'} />
                    Chat
                    {activeTab === 'chat' && <motion.div layoutId="tab" style={{ position: 'absolute', bottom: -17, left: 0, right: 0, height: 2, backgroundColor: Tokens.Color.Accent.Surface[3] }} />}
                </div>
                <div 
                    onClick={() => setActiveTab('dashboard')}
                    style={{ 
                        ...Tokens.Type.Readable.Label.M, 
                        color: activeTab === 'dashboard' ? Tokens.Color.Accent.Content[2] : Tokens.Color.Base.Content[3],
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 0',
                        position: 'relative'
                    }}
                >
                    <ChartBar size={18} weight={activeTab === 'dashboard' ? 'fill' : 'regular'} />
                    Charts
                    {activeTab === 'dashboard' && <motion.div layoutId="tab" style={{ position: 'absolute', bottom: -17, left: 0, right: 0, height: 2, backgroundColor: Tokens.Color.Accent.Surface[3] }} />}
                </div>
            </div>
            <Button variant="icon" onClick={onClose} aria-label="Close Chat" style={{ color: Tokens.Color.Base.Content[3] }}>
              {isMobile ? <CaretDown size={24} /> : <X size={20} />}
            </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'chat' ? (
                <motion.div 
                    key="chat"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                >
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
            ) : (
                <motion.div 
                    key="dashboard"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: Tokens.Space[5], gap: Tokens.Space[5] }}
                >
                    {dashboard.length === 0 && (
                        <div style={{ textAlign: 'center', padding: Tokens.Space[8], opacity: 0.6 }}>
                            <p style={Tokens.Type.Readable.Body.M}>No charts yet. Add one to visualize your data.</p>
                        </div>
                    )}

                    {dashboard.map((item) => (
                         <div key={item.id} style={{ 
                             backgroundColor: Tokens.Color.Base.Surface[1], 
                             borderRadius: Tokens.Effect.Radius.L, 
                             border: `1px solid ${Tokens.Color.Base.Border[1]}`,
                             padding: Tokens.Space[4],
                             boxShadow: Tokens.Effect.Shadow.Soft
                         }}>
                             <div style={{ ...S.flexBetween, marginBottom: Tokens.Space[3] }}>
                                 <input 
                                     value={item.config.title}
                                     onChange={(e) => onUpdateDashboardItem({ ...item, config: { ...item.config, title: e.target.value } })}
                                     style={{ 
                                         ...Tokens.Type.Readable.Label.M, 
                                         border: 'none', 
                                         background: 'transparent', 
                                         outline: 'none', 
                                         width: '100%', 
                                         color: Tokens.Color.Base.Content[1] 
                                     }} 
                                 />
                                 <Button variant="ghost" size="sm" onClick={() => onRemoveDashboardItem(item.id)} icon={<Trash size={16} />} />
                             </div>
                             
                             <ChartRenderer config={item.config} data={data} headers={headers} />

                             <div style={{ display: 'flex', flexDirection: 'column', gap: Tokens.Space[3], marginTop: Tokens.Space[3], padding: Tokens.Space[3], backgroundColor: Tokens.Color.Base.Surface[2], borderRadius: Tokens.Effect.Radius.M }}>
                                 {/* Type Selector */}
                                 <div style={{ display: 'flex', gap: Tokens.Space[2], overflowX: 'auto', paddingBottom: 4 }}>
                                     {(['bar', 'line', 'area', 'pie', 'radar'] as const).map(type => (
                                         <button 
                                             key={type}
                                             onClick={() => onUpdateDashboardItem({ ...item, config: { ...item.config, type } })}
                                             style={{
                                                 padding: '4px 8px',
                                                 borderRadius: '4px',
                                                 border: 'none',
                                                 backgroundColor: item.config.type === type ? Tokens.Color.Accent.Surface[1] : 'transparent',
                                                 color: item.config.type === type ? Tokens.Color.Accent.Content[1] : Tokens.Color.Base.Content[3],
                                                 cursor: 'pointer',
                                                 textTransform: 'capitalize',
                                                 fontSize: '12px'
                                             }}
                                         >
                                             {type}
                                         </button>
                                     ))}
                                 </div>
                                 
                                 {/* X-Axis */}
                                 <div style={{ display: 'flex', alignItems: 'center', gap: Tokens.Space[2] }}>
                                     <span style={{ fontSize: '11px', color: Tokens.Color.Base.Content[3], width: 40 }}>X-Axis</span>
                                     <select 
                                        value={item.config.dataKey}
                                        onChange={(e) => onUpdateDashboardItem({ ...item, config: { ...item.config, dataKey: e.target.value } })}
                                        style={{ 
                                            flex: 1, 
                                            padding: '4px', 
                                            borderRadius: '4px', 
                                            border: `1px solid ${Tokens.Color.Base.Border[2]}`,
                                            fontSize: '12px',
                                            backgroundColor: Tokens.Color.Base.Surface[1]
                                        }}
                                     >
                                        {headers.map((h: string) => <option key={h} value={h}>{h}</option>)}
                                     </select>
                                 </div>

                                 {/* Series */}
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: Tokens.Space[2] }}>
                                    <span style={{ fontSize: '11px', color: Tokens.Color.Base.Content[3] }}>Series Data</span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {headers.map((h: string) => (
                                            <div 
                                                key={h}
                                                onClick={() => {
                                                    const newSeries = item.config.series.includes(h)
                                                        ? item.config.series.filter(s => s !== h)
                                                        : [...item.config.series, h];
                                                    onUpdateDashboardItem({ ...item, config: { ...item.config, series: newSeries } });
                                                }}
                                                style={{
                                                    fontSize: '11px',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${item.config.series.includes(h) ? Tokens.Color.Accent.Surface[3] : Tokens.Color.Base.Border[2]}`,
                                                    backgroundColor: item.config.series.includes(h) ? Tokens.Color.Accent.Surface[2] : 'transparent',
                                                    color: item.config.series.includes(h) ? Tokens.Color.Accent.Content[2] : Tokens.Color.Base.Content[2],
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {h}
                                            </div>
                                        ))}
                                    </div>
                                 </div>
                             </div>
                         </div>
                    ))}
                    
                    <Button variant="secondary" onClick={handleAddChart} icon={<Plus size={16} />} style={{ marginTop: Tokens.Space[2] }}>
                        Add Chart
                    </Button>
                </motion.div>
            )}
          </AnimatePresence>
      </div>
    </motion.div>
  );
};