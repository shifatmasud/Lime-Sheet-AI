import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { SheetData, ColumnMeta, Row } from '../../types';
import { Tokens, S, useIsMobile } from '../../utils/styles';
import { Button } from '../Core/Button';
import { Plus, Trash, DotsThreeVertical, Palette, ArrowsLeftRight, PencilSimple, Function as FunctionIcon } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---

interface TableProps {
  headers: string[];
  data: SheetData;
  columnMeta: Record<number, ColumnMeta>;
  onCellChange?: (rowIndex: number, colIndex: number, value: string) => void;
  onHeaderChange?: (colIndex: number, value: string) => void;
  onColumnMetaChange?: (colIndex: number, meta: Partial<ColumnMeta>) => void;
  onAddRow?: () => void;
  onAddColumn?: () => void;
  onDeleteRow?: (rowIndex: number) => void;
  onDeleteColumn?: (colIndex: number) => void;
  onSmartFormula?: (colIndex: number) => void;
}

// --- Sub-components ---

const COLUMN_COLORS = [
  'transparent',
  Tokens.Color.Feedback.Error, // Red
  Tokens.Color.Feedback.Warning, // Orange
  Tokens.Color.Feedback.Success, // Green
  Tokens.Color.Feedback.Info, // Blue
  '#a78bfa', // Purple
  '#f472b6', // Pink
];

interface HeaderCellProps {
  value: string;
  index: number;
  width: number;
  color?: string;
  onChange: (val: string) => void;
  onResizeStart: (e: React.MouseEvent) => void;
  onAutoResize: () => void;
  onColorChange: (color: string) => void;
  onDelete: () => void;
  onSmartFormula?: () => void;
}

const HeaderCell: React.FC<HeaderCellProps> = ({ 
  value, index, width, color, onChange, onResizeStart, onAutoResize, onColorChange, onDelete, onSmartFormula 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [showMenu, setShowMenu] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isEditing) setLocalValue(value);
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const commitChange = () => {
    setIsEditing(false);
    if (localValue !== value) onChange(localValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitChange();
    if (e.key === 'Escape') {
        setLocalValue(value);
        setIsEditing(false);
    }
  };

  // Long Press Logic
  const handleMouseDown = () => {
    setIsPressing(true);
    pressTimer.current = setTimeout(() => {
      setIsEditing(true);
      setIsPressing(false);
    }, 400); // 400ms hold to rename
  };

  const handleMouseUp = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    setIsPressing(false);
  };

  const isActiveColor = color && color !== 'transparent';
  // We use transparent background because the colgroup handles the color now
  const bgColor = 'transparent'; 
  
  // Use high contrast text if a column color is active, otherwise use default secondary content color
  const textColor = isActiveColor ? Tokens.Color.Base.Content[1] : Tokens.Color.Base.Content[2];
  const inputColor = isActiveColor ? Tokens.Color.Base.Content[1] : Tokens.Color.Accent.Content[2];

  return (
    <th 
      scope="col"
      style={{ 
        width: width, 
        minWidth: width, 
        maxWidth: width, 
        position: 'relative', 
        backgroundColor: bgColor, 
        borderBottom: `1px solid ${isActiveColor ? color : Tokens.Color.Base.Border[2]}`, 
        padding: 0, 
        textAlign: 'left', 
        userSelect: 'none', 
        zIndex: showMenu ? 30 : 10, 
        transition: 'background-color 0.3s, border-color 0.3s', 
      }}
    >
      {/* Colored Top Indicator */}
      {isActiveColor && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: color }} />
      )}

      <div style={{ height: '56px', position: 'relative', display: 'flex', alignItems: 'center', paddingLeft: Tokens.Space[3], paddingRight: Tokens.Space[1] }}>
        
        {/* Color Dot Trigger */}
        <div 
           onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
           style={{
             width: '12px',
             height: '12px',
             borderRadius: '50%',
             backgroundColor: isActiveColor ? color : Tokens.Color.Base.Border[2],
             marginRight: Tokens.Space[2],
             cursor: 'pointer',
             flexShrink: 0,
             border: `1px solid ${Tokens.Color.Base.Surface[1]}`,
             boxShadow: '0 0 0 1px rgba(0,0,0,0.05)'
           }}
           title="Column Settings"
        />

        {/* Input / Text */}
        <div style={{ flex: 1, height: '100%', position: 'relative' }}>
          {isEditing ? (
            <input
              ref={inputRef}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={commitChange}
              onKeyDown={handleKeyDown}
              style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  color: inputColor,
                  ...Tokens.Type.Readable.Label.S,
              }}
            />
          ) : (
            <div 
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onDoubleClick={() => setIsEditing(true)}
              title="Double-click or Hold to Rename"
              style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: isPressing ? 'grabbing' : 'pointer',
                  color: textColor,
                  ...Tokens.Type.Readable.Label.S,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  opacity: isPressing ? 0.6 : 1,
                  transform: isPressing ? 'scale(0.98)' : 'scale(1)',
                  transition: 'all 0.2s'
              }}
            >
              {value}
            </div>
          )}
        </div>

        {/* Menu Dropdown */}
        <AnimatePresence>
          {showMenu && (
             <motion.div
                ref={menuRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{
                  position: 'absolute',
                  top: '48px',
                  left: '8px',
                  width: '200px',
                  backgroundColor: Tokens.Color.Base.Surface[1],
                  borderRadius: Tokens.Effect.Radius.M,
                  boxShadow: Tokens.Effect.Shadow.Float,
                  border: `1px solid ${Tokens.Color.Base.Border[1]}`,
                  padding: Tokens.Space[3],
                  display: 'flex',
                  flexDirection: 'column',
                  gap: Tokens.Space[2],
                  cursor: 'default',
                  zIndex: 100
                }}
             >
                {/* Rename Option */}
                <div 
                  onClick={(e) => { 
                    e.stopPropagation();
                    setShowMenu(false);
                    setIsEditing(true);
                  }}
                  style={{ ...S.flexCenter, justifyContent: 'flex-start', gap: Tokens.Space[2], padding: Tokens.Space[2], borderRadius: Tokens.Effect.Radius.S, cursor: 'pointer', color: Tokens.Color.Base.Content[1] }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = Tokens.Color.Base.Surface[2]}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                   <PencilSimple size={16} />
                   <span style={Tokens.Type.Readable.Label.S}>Rename Column</span>
                </div>

                {/* Formula Option */}
                <div 
                  onClick={(e) => { 
                    e.stopPropagation();
                    setShowMenu(false);
                    onSmartFormula?.();
                  }}
                  style={{ ...S.flexCenter, justifyContent: 'flex-start', gap: Tokens.Space[2], padding: Tokens.Space[2], borderRadius: Tokens.Effect.Radius.S, cursor: 'pointer', color: Tokens.Color.Accent.Content[2] }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = Tokens.Color.Base.Surface[2]}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                   <FunctionIcon size={16} weight="bold" />
                   <span style={Tokens.Type.Readable.Label.S}>Smart Formula</span>
                </div>

                {/* Fit Content Option */}
                <div 
                  onClick={(e) => { 
                    e.stopPropagation();
                    setShowMenu(false);
                    onAutoResize();
                  }}
                  style={{ ...S.flexCenter, justifyContent: 'flex-start', gap: Tokens.Space[2], padding: Tokens.Space[2], borderRadius: Tokens.Effect.Radius.S, cursor: 'pointer', color: Tokens.Color.Base.Content[1] }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = Tokens.Color.Base.Surface[2]}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                   <ArrowsLeftRight size={16} />
                   <span style={Tokens.Type.Readable.Label.S}>Fit to Content</span>
                </div>

                <div style={{ height: '1px', backgroundColor: Tokens.Color.Base.Border[1], margin: '4px 0' }} />

                <div>
                   <span style={{ ...Tokens.Type.Readable.Label.S, color: Tokens.Color.Base.Content[3], display: 'block', marginBottom: Tokens.Space[2], paddingLeft: Tokens.Space[2] }}>Color Tag</span>
                   <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingLeft: Tokens.Space[2] }}>
                      {COLUMN_COLORS.map(c => (
                        <div 
                          key={c}
                          onClick={() => onColorChange(c)}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: c === 'transparent' ? Tokens.Color.Base.Surface[3] : c,
                            border: `1px solid ${c === color ? Tokens.Color.Base.Content[1] : Tokens.Color.Base.Border[2]}`,
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                        >
                          {c === 'transparent' && (
                             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)', width: '1px', height: '12px', backgroundColor: Tokens.Color.Base.Content[3] }} />
                          )}
                        </div>
                      ))}
                   </div>
                </div>

                <div style={{ height: '1px', backgroundColor: Tokens.Color.Base.Border[1], margin: '4px 0' }} />

                <div 
                  onClick={(e) => { 
                    e.stopPropagation();
                    setShowMenu(false);
                    setTimeout(onDelete, 50);
                  }}
                  style={{ ...S.flexCenter, justifyContent: 'flex-start', gap: Tokens.Space[2], padding: Tokens.Space[2], borderRadius: Tokens.Effect.Radius.S, cursor: 'pointer', color: Tokens.Color.Feedback.Error }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = Tokens.Color.Base.Surface[2]}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                   <Trash size={16} />
                   <span style={Tokens.Type.Readable.Label.S}>Delete Column</span>
                </div>
             </motion.div>
          )}
        </AnimatePresence>

        {/* Resize Handle */}
        <div 
            onMouseDown={onResizeStart}
            onDoubleClick={(e) => { e.stopPropagation(); onAutoResize(); }}
            title="Double-click to fit content"
            style={{
                position: 'absolute',
                right: -4,
                top: 0,
                bottom: 0,
                width: 12,
                cursor: 'col-resize',
                zIndex: 20,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
            className="resize-handle"
        >
             <div style={{ width: 4, height: '40%', borderRadius: '2px', backgroundColor: Tokens.Color.Base.Border[2], opacity: 0, transition: 'opacity 0.2s' }} />
        </div>
      </div>
    </th>
  );
};

// --- Helper ---

const measureTextWidth = (text: string, font: string): number => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    context.font = font;
    return context.measureText(text).width;
  }
  return 0;
};

// --- Memoized Row ---

interface TableRowProps {
  row: Row;
  rIndex: number;
  headers: string[];
  // Removed columnMeta to improve performance and rely on colgroup
  onCellChange?: (rowIndex: number, colIndex: number, value: string) => void;
  onDeleteRow?: (rowIndex: number) => void;
  indexCellStyle: React.CSSProperties;
}

const TableRow = memo(({ row, rIndex, headers, onCellChange, onDeleteRow, indexCellStyle }: TableRowProps) => {
  return (
    <tr className="table-row">
      <td style={indexCellStyle}>
          <div style={{ position: 'relative', width: '100%', height: '100%', ...S.flexCenter }}>
              <span className="row-index">{rIndex + 1}</span>
              <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRow?.(rIndex);
                  }}
                  aria-label={`Delete row ${rIndex + 1}`}
                  style={{ 
                      position: 'absolute',
                      background: Tokens.Color.Base.Surface[1], 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: Tokens.Color.Feedback.Error, 
                      padding: 4,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                  }}
              >
                  <Trash size={14} weight="bold" />
              </button>
          </div>
      </td>
      {row.map((cell, cIndex) => {
        return (
          <td key={cIndex} style={{ padding: 0, borderBottom: `1px solid ${Tokens.Color.Base.Border[1]}` }}>
            <input
              value={cell.value}
              onChange={(e) => onCellChange?.(rIndex, cIndex, e.target.value)}
              aria-label={`Row ${rIndex + 1}, ${headers[cIndex]}`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                outline: 'none',
                padding: `${Tokens.Space[3]} ${Tokens.Space[5]}`,
                backgroundColor: 'transparent', // Make transparent so colgroup color shows
                color: Tokens.Color.Base.Content[1],
                ...Tokens.Type.Readable.Body.M,
                minHeight: '48px',
                transition: 'background-color 0.2s'
              }}
              onFocus={(e) => {
                  e.target.style.boxShadow = `inset 0 0 0 2px ${Tokens.Color.Accent.Surface[3]}`;
                  e.target.style.zIndex = '1';
                  e.target.style.position = 'relative';
              }}
              onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.zIndex = 'auto';
              }}
            />
          </td>
        );
      })}
      <td style={{ backgroundColor: 'transparent', borderBottom: `1px solid ${Tokens.Color.Base.Border[1]}` }} />
    </tr>
  );
}, (prev, next) => {
  // Custom comparison for performance
  return prev.row === next.row && prev.headers === next.headers;
});


// --- Main Table ---

export const Table: React.FC<TableProps> = ({ 
  headers, data, columnMeta, onCellChange, onHeaderChange, onColumnMetaChange, onAddRow, onAddColumn, onDeleteRow, onDeleteColumn, onSmartFormula 
}) => {
  const resizingRef = useRef<{ index: number; startX: number; startWidth: number } | null>(null);

  // Resize Handlers
  const handleResizeStart = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentWidth = columnMeta[index]?.width || 180;
    resizingRef.current = { index, startX: e.clientX, startWidth: currentWidth };
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'col-resize';
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingRef.current) return;
    const { index, startX, startWidth } = resizingRef.current;
    const diff = e.clientX - startX;
    const newWidth = Math.max(80, startWidth + diff); 
    onColumnMetaChange?.(index, { width: newWidth });
  }, [onColumnMetaChange]);

  const handleResizeEnd = useCallback(() => {
    resizingRef.current = null;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'default';
  }, [handleResizeMove]);

  const handleAutoResize = useCallback((colIndex: number) => {
    const headerText = (headers[colIndex] || '').toUpperCase();
    const headerWidth = measureTextWidth(headerText, '600 12px Inter') + 56;
    
    let maxCellWidth = 0;
    const rowsToCheck = data.slice(0, 100); 
    rowsToCheck.forEach(row => {
      const cellValue = row[colIndex]?.value || '';
      const w = measureTextWidth(cellValue, '400 16px Inter') + 40; 
      if (w > maxCellWidth) maxCellWidth = w;
    });

    const newWidth = Math.max(Math.max(headerWidth, maxCellWidth), 80); 
    const clampedWidth = Math.min(newWidth, 600);

    onColumnMetaChange?.(colIndex, { width: clampedWidth });
  }, [data, headers, onColumnMetaChange]);

  // Styles
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: Tokens.Color.Base.Surface[1],
    borderRadius: Tokens.Effect.Radius.XL,
    boxShadow: Tokens.Effect.Shadow.Soft,
    overflow: 'hidden',
    border: `1px solid ${Tokens.Color.Base.Border[1]}`,
  };

  const indexCellStyle: React.CSSProperties = {
    width: 60,
    minWidth: 60,
    position: 'sticky',
    left: 0,
    zIndex: 20,
    backgroundColor: Tokens.Color.Base.Surface[1],
    borderBottom: `1px solid ${Tokens.Color.Base.Border[1]}`,
    borderRight: `1px solid ${Tokens.Color.Base.Border[1]}`,
    color: Tokens.Color.Base.Content[3],
    textAlign: 'center',
    ...Tokens.Type.Readable.Label.S,
    userSelect: 'none',
  };

  return (
    <div style={containerStyle}>
       <style>{`
           .resize-handle:hover div { opacity: 1 !important; }
           .table-row .delete-btn { opacity: 0; pointer-events: none; transition: opacity 0.2s; }
           .table-row:hover .delete-btn { opacity: 1; pointer-events: auto; }
           .table-row:hover .row-index { opacity: 0; }
           
           /* Mobile Override: Always show delete button if needed, or rely on tap */
           @media (max-width: 768px) {
             .table-row .delete-btn { opacity: 0; pointer-events: none; }
             .table-row:active .delete-btn { opacity: 1; pointer-events: auto; }
             .table-row:active .row-index { opacity: 0; }
           }
        `}</style>
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }} aria-label="Data Sheet">
          <colgroup>
              <col style={{ width: 60, backgroundColor: Tokens.Color.Base.Surface[1] }} /> {/* Index Column */}
              {headers.map((_, i) => {
                  const meta = columnMeta[i];
                  const color = meta?.color;
                  const isActive = color && color !== 'transparent';
                  // Use robust colgroup coloring with 20% opacity (hex 33)
                  const bgColor = isActive ? `${color}33` : undefined;
                  return <col key={i} style={{ width: meta?.width || 180, backgroundColor: bgColor, transition: 'background-color 0.3s' }} />;
              })}
              <col style={{ width: 60 }} /> {/* Add Column Button Column */}
          </colgroup>
          <thead>
            <tr>
              <th style={{ ...indexCellStyle, zIndex: 30, borderBottom: `1px solid ${Tokens.Color.Base.Border[2]}` }}></th>
              {headers.map((h, i) => (
                <HeaderCell
                    key={i}
                    index={i}
                    value={h}
                    width={columnMeta[i]?.width || 180}
                    color={columnMeta[i]?.color}
                    onChange={(val) => onHeaderChange?.(i, val)}
                    onResizeStart={(e) => handleResizeStart(i, e)}
                    onAutoResize={() => handleAutoResize(i)}
                    onColorChange={(color) => onColumnMetaChange?.(i, { color })}
                    onDelete={() => onDeleteColumn?.(i)}
                    onSmartFormula={() => onSmartFormula?.(i)}
                />
              ))}
               <th style={{ width: 60, padding: 0, backgroundColor: Tokens.Color.Base.Surface[1], borderBottom: `1px solid ${Tokens.Color.Base.Border[2]}` }}>
                 <div 
                   onClick={onAddColumn}
                   style={{ ...S.flexCenter, width: '100%', height: '56px', cursor: 'pointer', color: Tokens.Color.Base.Content[3] }}
                   title="Add Column"
                 >
                   <Plus size={18} />
                 </div>
               </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rIndex) => (
              <TableRow 
                key={rIndex}
                rIndex={rIndex}
                row={row}
                headers={headers}
                onCellChange={onCellChange}
                onDeleteRow={onDeleteRow}
                indexCellStyle={indexCellStyle}
              />
            ))}
             {data.length === 0 && (
                <tr>
                    <td colSpan={headers.length + 2} style={{ padding: Tokens.Space[20], textAlign: 'center', color: Tokens.Color.Base.Content[3] }}>
                        Empty Sheet. Add data or ask AI.
                    </td>
                </tr>
             )}
          </tbody>
        </table>
      </div>
      
      {/* Footer Bar */}
      <div style={{ 
          height: '56px', 
          borderTop: `1px solid ${Tokens.Color.Base.Border[2]}`, 
          backgroundColor: Tokens.Color.Base.Surface[1],
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${Tokens.Space[5]}`,
          zIndex: 20
      }}>
         <Button 
            variant="ghost" 
            size="sm" 
            onClick={onAddRow} 
            icon={<Plus size={16} />}
            style={{ color: Tokens.Color.Base.Content[2] }}
         >
            Add Row
         </Button>
      </div>
    </div>
  );
};