import React, { useState } from 'react';
import { Tokens, S } from '../../utils/styles';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, leftIcon, style, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = {
    width: '100%',
    ...S.flexCol,
    gap: Tokens.Space[1],
    ...style,
  };

  const labelStyle = {
    ...Tokens.Type.Readable.Label.S,
    color: Tokens.Color.Base.Content[2],
    marginLeft: Tokens.Space[1],
  };

  const inputWrapperStyle = {
    position: 'relative' as const,
    width: '100%',
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: Tokens.Color.Base.Surface[1],
    border: `1px solid ${isFocused ? Tokens.Color.Accent.Surface[1] : Tokens.Color.Base.Border[1]}`,
    borderRadius: Tokens.Effect.Radius.M,
    padding: `${Tokens.Space[2]} ${Tokens.Space[4]}`,
    paddingLeft: leftIcon ? Tokens.Space[10] : Tokens.Space[4],
    color: Tokens.Color.Base.Content[1],
    outline: 'none',
    boxShadow: isFocused ? `0 0 0 3px ${Tokens.Color.Accent.Surface[2]}` : 'none',
    transition: Tokens.Effect.Transition.Fast,
    ...Tokens.Type.Readable.Body.M,
  };

  const iconStyle = {
    position: 'absolute' as const,
    left: Tokens.Space[3],
    top: '50%',
    transform: 'translateY(-50%)',
    color: Tokens.Color.Base.Content[3],
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none' as const,
  };

  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={inputWrapperStyle}>
        {leftIcon && <div style={iconStyle}>{leftIcon}</div>}
        <input
          style={inputStyle}
          onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
          {...props}
        />
      </div>
    </div>
  );
};