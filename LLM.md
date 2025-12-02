
# LLM Instructions

## Project Context
LimeSheet is a React-based spreadsheet app. It uses standard React 18 patterns but avoids build steps like Webpack/Vite in favor of native ES modules via `importmap`.

## Coding Rules
1. **No Tailwind**: Use `utils/styles.ts` Tokens and inline JS styles.
2. **Architecture**: Core -> Package -> Section -> Page.
3. **Motion**: Use Framer Motion for UI, GSAP for 3D/Canvas.
4. **AI**: Use `@google/genai` for all AI calls.

## Key Files
- `utils/styles.ts`: Source of truth for Colors, Typography, Spacing.
- `services/geminiService.ts`: AI interaction logic.
- `components/Package/Table.tsx`: Main grid rendering logic.
