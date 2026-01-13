
const importMap = {
  "imports": {
    "react": "https://esm.sh/react@18.2.0",
    "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
    "framer-motion": "https://esm.sh/framer-motion@10.16.4?external=react,react-dom",
    "phosphor-react": "https://esm.sh/phosphor-react@1.4.1?external=react,react-dom",
    "@google/genai": "https://esm.sh/@google/genai@0.1.2",
    "papaparse": "https://esm.sh/papaparse@5.4.1",
    "recharts": "https://esm.sh/recharts@2.12.0?external=react,react-dom",
    "uuid": "https://esm.sh/uuid@9.0.1"
  }
};

const script = document.createElement('script');
script.type = 'importmap';
script.textContent = JSON.stringify(importMap);
document.head.appendChild(script);