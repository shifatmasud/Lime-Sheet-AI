
# LimeSheet AI

An ultra-minimalist, intelligent spreadsheet studio powered by Gemini.

## Features
- **Smart Analysis**: Ask questions about your data using natural language.
- **Data Visualization**: Auto-generate charts from text queries.
- **CSV I/O**: Import and Export standard CSV files.
- **Google Sheets**: Import directly from public Google Sheet URLs.
- **Premium UI**: Glassmorphic, motion-rich interface built with custom design tokens.

## Architecture
- **Framework**: React 18 (via ESM.sh)
- **State Management**: React Hooks (Atomic, Durable)
- **Styling**: JS Objects + Design Tokens (No Tailwind)
- **Motion**: Framer Motion & GSAP
- **3D**: Three.js (Reactive Background)
- **AI**: @google/genai SDK

## Directory Structure
- `components/Core`: Basic building blocks (Button, Input, Background).
- `components/Package`: Complex features (Table, Chat, Chart).
- `components/Section`: Layout regions (Header).
- `components/Page`: Full page layouts (Home).
- `services`: Logic for API and Data processing.
- `utils`: Design system tokens and helpers.
