import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tokens, S, StyleObject } from '../../utils/styles';
import { Variant, Size } from '../../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  icon, 
  children, 
  style,
  disabled,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Styles Map
  const getVariantStyles = (): StyleObject => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: Tokens.Color.Accent.Surface[1],
          color: Tokens.Color.Accent.Content[1],
          border: 'none',
          boxShadow: Tokens.Effect.Shadow.Soft,
        };
      case 'secondary':
        return {
          backgroundColor: Tokens.Color.Base.Surface[1],
          color: Tokens.Color.Base.Content[1],
          border: `1px solid ${Tokens.Color.Base.Border[1]}`,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: Tokens.Color.Base.Content[2],
          border: 'none',
        };
      case 'icon':
        return {
          backgroundColor: 'transparent',
          color: Tokens.Color.Base.Content[2],
          border: 'none',
          padding: Tokens.Space[2],
          borderRadius: Tokens.Effect.Radius.Full,
          aspectRatio: '1/1',
        };
      default: return {};
    }
  };

  const getSizeStyles = (): StyleObject => {
    if (variant === 'icon') return {};
    switch (size) {
      case 'sm': return { padding: `${Tokens.Space[1]} ${Tokens.Space[3]}`, ...Tokens.Type.Readable.Label.S };
      case 'md': return { padding: `${Tokens.Space[2]} ${Tokens.Space[4]}`, ...Tokens.Type.Readable.Label.M };
      case 'lg': return { padding: `${Tokens.Space[3]} ${Tokens.Space[6]}`, ...Tokens.Type.Readable.Body.L };
      default: return {};
    }
  };

  const baseStyles: StyleObject = {
    ...S.flexCenter,
    gap: Tokens.Space[2],
    borderRadius: variant === 'icon' ? Tokens.Effect.Radius.Full : Tokens.Effect.Radius.M,
    cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer',
    opacity: (disabled || isLoading) ? 0.6 : 1,
    position: 'relative',
    overflow: 'hidden',
    transition: Tokens.Effect.Transition.Base,
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={baseStyles}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* State Layer */}
      <AnimatePresence>
        {isHovered && !disabled && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              ...S.absoluteFill,
              backgroundColor: 'currentColor',
              borderRadius: 'inherit',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <div style={{ ...S.flexCenter, gap: Tokens.Space[2], position: 'relative', zIndex: 1 }}>
        {isLoading && (
           <motion.div
             animate={{ rotate: 360 }}
             transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
             style={{
               width: '16px',
               height: '16px',
               border: '2px solid currentColor',
               borderTopColor: 'transparent',
               borderRadius: '50%',
             }}
           />
        )}
        {!isLoading && icon}
        {children}
      </div>
    </motion.button>
  );
};