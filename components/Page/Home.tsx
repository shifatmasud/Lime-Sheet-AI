

import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sparkle, X, MagicWand, Function as FunctionIcon, Plus } from 'phosphor-react';
import { parseCSV, serializeCSV, fetchGoogleSheet } from '../../services/csvService';
import { geminiService } from '../../services/geminiService';
import { Table } from '../Package/Table';
import { Header } from '../Section/Header';
import { ChatInterface } from '../Package/ChatInterface';
import { Button } from '../Core/Button';
import { Input } from '../Core/Input';
import { AppState, Message, MessageType, ChartConfig, ColumnMeta, DashboardItem } from '../../types';
import { DEFAULT_DATA, DEFAULT_HEADERS } from '../../constants';
import { Tokens, injectTheme, useIsMobile, S } from '../../utils/styles';
import { motion, AnimatePresence } from 'framer-motion';

const FORMULA_TEMPLATES = [
  { label: 'Sum', value: '=SUM(A{{row}}, B{{row}})', desc: 'Add two cells', icon: <Plus size={14} /> },
  { label: 'Range Sum', value: '=SUM(A{{row}}:C{{row}})', desc: 'Sum cols A to C', icon: <Plus size={14} /> },
  { label: 'Average', value: '=AVERAGE(A{{row}}, B{{row}})', desc: 'Mean of cells', icon: <FunctionIcon size={14} /> },
  { label: 'Multiply', value: '=A{{row}} * B{{row}}', desc: 'Product of cells', icon: <X size={14} /> },
  { label: 'Condition', value: '=IF(A{{row}}>100, "High", "Low")', desc: 'Logic check', icon: <Sparkle size={14} /> },
  { label: 'Combine', value: '=A{{row}} & " " & B{{row}}', desc: 'Join text', icon: <MagicWand size={14} /> },
];

export const Home: React.FC = () => {
  const [state, setState] = useState<AppState>({
    data: DEFAULT_DATA,
    headers: DEFAULT_HEADERS,
    columnMeta: {},
    filename: 'Untitled Sheet',
    isProcessing: false,
    messages: [],
    dashboard: [],
    apiKey: process.env.API_KEY || null,
    model: 'gemini-3-flash-preview',
  });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const isMobile = useIsMobile();
  
  // Formula State
  const [manualFormulaCol, setManualFormulaCol] = useState<number | null>(null);
  const [formulaInput, setFormulaInput] = useState('');

  // Initialize theme & API key
  useEffect(() => {
    injectTheme('light');
    if (state.apiKey) {
      geminiService.setApiKey(state.apiKey);
    }
  }, []);

  // Sync Meta with Headers length
  useEffect(() => {
    setState(prev => {
        const newMeta = { ...prev.columnMeta };
        let changed = false;
        prev.headers.forEach((_, index) => {
            if (!newMeta[index]) {
                newMeta[index] = { width: 180 };
                changed = true;
            }
        });
        return changed ? { ...prev, columnMeta: newMeta } : prev;
    });
  }, [state.headers.length]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    injectTheme(newTheme);
  }, [theme]);

  // Handlers
  const handleCellChange = useCallback((rowIndex: number, colIndex: number, value: string) => {
    setState(prev => {
      const newData = prev.data.map((row, rIdx) => 
        rIdx === rowIndex ? row.map((cell, cIdx) => cIdx === colIndex ? { value } : cell) : row
      );
      return { ...prev, data: newData };
    });
  }, []);

  const handleHeaderChange = useCallback((colIndex: number, value: string) => {
    setState(prev => {
        const newHeaders = [...prev.headers];
        newHeaders[colIndex] = value;
        return { ...prev, headers: newHeaders };
    });
  }, []);

  const handleColumnMetaChange = useCallback((colIndex: number, meta: Partial<ColumnMeta>) => {
    setState(prev => ({
        ...prev,
        columnMeta: {
            ...prev.columnMeta,
            [colIndex]: { 
                width: 180, // Default fallback ensures 'width' is present
                ...prev.columnMeta[colIndex], 
                ...meta 
            }
        }
    }));
  }, []);

  const handleAddRow = useCallback(() => {
    setState(prev => {
      const newRow = Array(prev.headers.length).fill({ value: '' });
      return { ...prev, data: [...prev.data, newRow] };
    });
  }, []);

  const handleAddColumn = useCallback(() => {
    setState(prev => {
      const newHeaders = [...prev.headers, 'New Column'];
      const newData = prev.data.map(row => [...row, { value: '' }]);
      return { ...prev, headers: newHeaders, data: newData };
    });
  }, []);

  const handleDeleteRow = useCallback((rowIndex: number) => {
      // Direct deletion for smoother UX - in a real app, use a Toast with Undo
      setState(prev => ({
          ...prev,
          data: prev.data.filter((_, i) => i !== rowIndex)
      }));
  }, []);

  const handleDeleteColumn = useCallback((colIndex: number) => {
      setState(prev => {
          const newHeaders = prev.headers.filter((_, i) => i !== colIndex);
          const newData = prev.data.map(row => row.filter((_, i) => i !== colIndex));
          
          // Rebuild meta keys
          const newMeta: Record<number, ColumnMeta> = {};
          
          Object.keys(prev.columnMeta).forEach((key) => {
              const oldIndex = parseInt(key, 10);
              const meta = prev.columnMeta[oldIndex];
              
              if (meta) {
                  if (oldIndex < colIndex) {
                      newMeta[oldIndex] = meta;
                  } else if (oldIndex > colIndex) {
                      newMeta[oldIndex - 1] = meta;
                  }
              }
          });

          return { ...prev, headers: newHeaders, data: newData, columnMeta: newMeta };
      });
  }, []);

  const handleRenameFile = useCallback((newName: string) => {
      setState(prev => ({ ...prev, filename: newName }));
  }, []);

  const handleImportCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, data } = parseCSV(text);
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      setState(prev => ({ ...prev, headers, data, columnMeta: {}, filename: cleanName }));
    };
    reader.readAsText(file);
  };

  const handleImportURL = async (url: string) => {
    try {
      setState(prev => ({ ...prev, isProcessing: true }));
      const csvText = await fetchGoogleSheet(url);
      const { headers, data } = parseCSV(csvText);
      setState(prev => ({ ...prev, headers, data, columnMeta: {}, filename: 'Imported Sheet', isProcessing: false }));
    } catch (error) {
      alert("Failed to import sheet.");
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleExportCSV = () => {
    const csv = serializeCSV(state.headers, state.data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${state.filename}.csv`;
    link.click();
  };

  // Smart Formula Handler
  const handleSmartFormula = useCallback((colIndex: number) => {
      const headerName = state.headers[colIndex];
      const sysMsg: Message = {
          id: uuidv4(),
          type: MessageType.AI,
          content: `I can help you apply a formula to '${headerName}'. What logic should I use?`,
          timestamp: Date.now()
      };

      setState(prev => ({
          ...prev,
          messages: [...prev.messages, sysMsg]
      }));
      
      setIsChatOpen(true);
  }, [state.headers]);

  // Manual Formula Handler
  const handleManualFormula = useCallback((colIndex: number) => {
      setManualFormulaCol(colIndex);
      
      const firstRowVal = state.data[0]?.[colIndex]?.value;
      if (firstRowVal && firstRowVal.startsWith('=')) {
          const detected = firstRowVal.replace(/(\D)2(\D|$)/g, '$1{{row}}$2');
          setFormulaInput(detected);
      } else {
          setFormulaInput('=');
      }
  }, [state.data]);

  const applyManualFormula = () => {
      if (manualFormulaCol === null) return;
      
      setState(prev => {
          const newData = prev.data.map((row, index) => {
              const cellValue = formulaInput.replace(/{{row}}/g, (index + 2).toString());
              
              const newRow = [...row];
              if (newRow[manualFormulaCol]) {
                  newRow[manualFormulaCol] = { value: cellValue };
              }
              return newRow;
          });
          return { ...prev, data: newData };
      });
      
      setManualFormulaCol(null);
      setFormulaInput('');
  };

  // Dashboard Handlers
  const handleAddDashboardItem = (item: DashboardItem) => {
    setState(prev => ({ ...prev, dashboard: [...prev.dashboard, item] }));
  };

  const handleRemoveDashboardItem = (id: string) => {
    setState(prev => ({ ...prev, dashboard: prev.dashboard.filter(d => d.id !== id) }));
  };

  const handleUpdateDashboardItem = (item: DashboardItem) => {
    setState(prev => ({ ...prev, dashboard: prev.dashboard.map(d => d.id === item.id ? item : d) }));
  };
  
  // Settings Handlers
  const handleApiKeyChange = useCallback((key: string) => {
    geminiService.setApiKey(key);
    setState(prev => ({ ...prev, apiKey: key }));
  }, []);

  const handleModelChange = useCallback((model: string) => {
    setState(prev => ({ ...prev, model }));
  }, []);

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: uuidv4(),
      type: MessageType.USER,
      content: text,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isProcessing: true
    }));
    
    if (!state.apiKey) {
      const errorMsg: Message = {
        id: uuidv4(),
        type: MessageType.SYSTEM,
        content: `API Key not set. Please add your Gemini API key in the settings panel.`,
        timestamp: Date.now()
      };
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMsg],
        isProcessing: false
      }));
      return;
    }

    try {
      const currentCSV = serializeCSV(state.headers, state.data);
      const responseText = await geminiService.processQuery(currentCSV, text, state.model);

      const csvMatch = responseText.match(/```csv\n([\s\S]*?)```/);
      const jsonChartMatch = responseText.match(/```json-chart\n([\s\S]*?)```/);
      const cleanText = responseText.replace(/```csv\n[\s\S]*?```/g, '').replace(/```json-chart\n[\s\S]*?```/g, '').trim();

      let chartConfig: ChartConfig | undefined;

      if (csvMatch) {
        const { headers, data } = parseCSV(csvMatch[1]);
        setState(prev => ({ ...prev, headers, data }));
      }

      if (jsonChartMatch) {
        try {
          chartConfig = JSON.parse(jsonChartMatch[1]);
        } catch (e) {
          console.error("Failed to parse chart JSON", e);
        }
      }

      const aiMsg: Message = {
        id: uuidv4(),
        type: MessageType.AI,
        content: cleanText || (csvMatch ? "I've updated the spreadsheet." : "Here is the result."),
        chartConfig,
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMsg],
        isProcessing: false
      }));

    } catch (error: any) {
      const errorMsg: Message = {
        id: uuidv4(),
        type: MessageType.SYSTEM,
        content: `Error: ${error.message}`,
        timestamp: Date.now()
      };
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMsg],
        isProcessing: false
      }));
    }
  };

  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      <Header 
        fileName={state.filename}
        onImportCSV={handleImportCSV}
        onImportURL={handleImportURL}
        onExportCSV={handleExportCSV}
        onRename={handleRenameFile}
        onToggleTheme={toggleTheme}
        isDark={theme === 'dark'}
      />

      <main style={{ 
        flex: 1, 
        overflowY: 'auto', 
        position: 'relative', 
        zIndex: 10, 
        padding: isMobile ? Tokens.Space[4] : Tokens.Space[8],
        paddingTop: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ 
              width: '100%', 
              marginBottom: Tokens.Space[8],
              borderRadius: Tokens.Effect.Radius.XL,
              overflow: 'clip',
              boxShadow: Tokens.Effect.Shadow.Soft,
              border: `1px solid ${Tokens.Color.Base.Border[1]}`,
            }}
          >
             <Table 
                headers={state.headers} 
                data={state.data} 
                columnMeta={state.columnMeta}
                onCellChange={handleCellChange}
                onHeaderChange={handleHeaderChange}
                onColumnMetaChange={handleColumnMetaChange}
                onAddRow={handleAddRow}
                onAddColumn={handleAddColumn}
                onDeleteRow={handleDeleteRow}
                onDeleteColumn={handleDeleteColumn}
                onSmartFormula={handleSmartFormula}
                onManualFormula={handleManualFormula}
            />
          </motion.div>
      </main>

      <AnimatePresence>
      {!isChatOpen && (
        <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            style={{ position: 'fixed', bottom: Tokens.Space[8], right: Tokens.Space[8], zIndex: 40 }}
        >
           <Button 
                variant="primary" 
                size="lg" 
                style={{ 
                    borderRadius: Tokens.Effect.Radius.Full, 
                    aspectRatio: '1/1', 
                    width: '64px', 
                    height: '64px', 
                    padding: 0,
                    boxShadow: Tokens.Effect.Shadow.Glow
                }}
                onClick={() => setIsChatOpen(true)}
            >
                <Sparkle size={32} weight="fill" />
            </Button>
        </motion.div>
      )}
      </AnimatePresence>

      <ChatInterface 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        messages={state.messages}
        onSendMessage={handleSendMessage}
        isProcessing={state.isProcessing}
        data={state.data}
        headers={state.headers}
        dashboard={state.dashboard}
        onAddDashboardItem={handleAddDashboardItem}
        onRemoveDashboardItem={handleRemoveDashboardItem}
        onUpdateDashboardItem={handleUpdateDashboardItem}
        isDark={theme === 'dark'}
        apiKey={state.apiKey}
        model={state.model}
        onApiKeyChange={handleApiKeyChange}
        onModelChange={handleModelChange}
      />

      {/* Manual Formula Modal */}
      <AnimatePresence>
        {manualFormulaCol !== null && (
           <div style={{ ...S.absoluteFill, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
              <motion.div
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 style={{
                     width: isMobile ? '90%' : '500px',
                     backgroundColor: Tokens.Color.Base.Surface[1],
                     borderRadius: Tokens.Effect.Radius.L,
                     boxShadow: Tokens.Effect.Shadow.Float,
                     border: `1px solid ${Tokens.Color.Base.Border[1]}`,
                     display: 'flex',
                     flexDirection: 'column',
                     overflow: 'hidden'
                 }}
              >
                  {/* Modal Header */}
                  <div style={{ padding: Tokens.Space[5], borderBottom: `1px solid ${Tokens.Color.Base.Border[1]}`, ...S.flexBetween }}>
                      <div>
                          <h3 style={{ ...Tokens.Type.Readable.Label.L, color: Tokens.Color.Base.Content[1] }}>Apply Formula</h3>
                          <p style={{ ...Tokens.Type.Readable.Body.S, color: Tokens.Color.Base.Content[3] }}>
                              Apply logic to <span style={{ color: Tokens.Color.Accent.Content[2], fontWeight: 600 }}>{state.headers[manualFormulaCol]}</span>
                          </p>
                      </div>
                      <button onClick={() => setManualFormulaCol(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: Tokens.Color.Base.Content[2], padding: Tokens.Space[2] }}>
                         <X size={20} />
                      </button>
                  </div>
                  
                  {/* Modal Content */}
                  <div style={{ padding: Tokens.Space[5], display: 'flex', flexDirection: 'column', gap: Tokens.Space[5] }}>
                      {/* Templates Grid */}
                      <div>
                        <label style={{ ...Tokens.Type.Readable.Label.S, color: Tokens.Color.Base.Content[3], marginBottom: Tokens.Space[2], display: 'block' }}>Quick Templates</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: Tokens.Space[2] }}>
                          {FORMULA_TEMPLATES.map((tmpl) => (
                            <button
                              key={tmpl.label}
                              onClick={() => setFormulaInput(tmpl.value)}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                padding: Tokens.Space[3],
                                backgroundColor: Tokens.Color.Base.Surface[2],
                                border: `1px solid ${Tokens.Color.Base.Border[1]}`,
                                borderRadius: Tokens.Effect.Radius.M,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'left',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = Tokens.Color.Accent.Surface[3];
                                e.currentTarget.style.backgroundColor = Tokens.Color.Accent.Surface[2];
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = Tokens.Color.Base.Border[1];
                                e.currentTarget.style.backgroundColor = Tokens.Color.Base.Surface[2];
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: Tokens.Space[2], marginBottom: 4, color: Tokens.Color.Base.Content[1], fontWeight: 600, fontSize: '13px' }}>
                                {tmpl.icon} {tmpl.label}
                              </div>
                              <span style={{ fontSize: '11px', color: Tokens.Color.Base.Content[3] }}>{tmpl.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <Input 
                         value={formulaInput}
                         onChange={(e) => setFormulaInput(e.target.value)}
                         placeholder="=A{{row}} + B{{row}}"
                         label="Formula Pattern"
                         autoFocus
                         onKeyDown={(e) => e.key === 'Enter' && applyManualFormula()}
                      />
                      
                      <div style={{ backgroundColor: Tokens.Color.Base.Surface[2], padding: Tokens.Space[3], borderRadius: Tokens.Effect.Radius.M, border: `1px solid ${Tokens.Color.Base.Border[1]}` }}>
                          <p style={{ ...Tokens.Type.Readable.Body.S, color: Tokens.Color.Base.Content[2] }}>
                              <span style={{ fontWeight: 600, color: Tokens.Color.Accent.Content[2] }}>How it works: </span>
                              The tag <code>{`{{row}}`}</code> will be replaced by the current row number (e.g. 2, 3, 4) for every cell in this column.
                          </p>
                          <div style={{ marginTop: Tokens.Space[2], padding: Tokens.Space[2], backgroundColor: Tokens.Color.Base.Surface[1], borderRadius: 4, fontSize: '11px', fontFamily: 'monospace', color: Tokens.Color.Base.Content[3] }}>
                              Example: =A{'{{row}}'} + B{'{{row}}'} &rarr; =A2 + B2
                          </div>
                      </div>
                  </div>

                  {/* Modal Footer */}
                  <div style={{ padding: Tokens.Space[5], borderTop: `1px solid ${Tokens.Color.Base.Border[1]}`, display: 'flex', justifyContent: 'flex-end', gap: Tokens.Space[2], backgroundColor: Tokens.Color.Base.Surface[2] }}>
                      <Button variant="ghost" onClick={() => setManualFormulaCol(null)}>Cancel</Button>
                      <Button variant="primary" onClick={applyManualFormula}>Apply Formula</Button>
                  </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};