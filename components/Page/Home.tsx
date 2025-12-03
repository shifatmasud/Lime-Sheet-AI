import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sparkle } from 'phosphor-react';
import { parseCSV, serializeCSV, fetchGoogleSheet } from '../../services/csvService';
import { geminiService } from '../../services/geminiService';
import { Table } from '../Package/Table';
import { Header } from '../Section/Header';
import { ChatInterface } from '../Package/ChatInterface';
import { Button } from '../Core/Button';
import { Background } from '../Core/Background';
import { AppState, Message, MessageType, ChartConfig, ColumnMeta, DashboardItem } from '../../types';
import { DEFAULT_DATA, DEFAULT_HEADERS } from '../../constants';
import { Tokens, injectTheme, useIsMobile } from '../../utils/styles';
import { motion, AnimatePresence } from 'framer-motion';

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
  });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const isMobile = useIsMobile();
  const [initialInput, setInitialInput] = useState(''); // Used for smart formulas

  // Initialize theme
  useEffect(() => {
    injectTheme('light');
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
      const prompt = `Calculate the values for column '${headerName}' using a formula that...`;
      
      // Add a system message to guide the user
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
      // We could use a context provider or simpler state passing for the input value,
      // but here we rely on the user seeing the prompt.
  }, [state.headers]);

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

    try {
      if (!state.apiKey) throw new Error("API Key required");
      const currentCSV = serializeCSV(state.headers, state.data);
      const responseText = await geminiService.processQuery(currentCSV, text);

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
      <Background />

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
        overflow: 'hidden', 
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
            style={{ flex: 1, overflow: 'hidden' }}
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
      />
    </div>
  );
};