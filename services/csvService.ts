import Papa from "papaparse";
import { Row, SheetData } from "../types";

export const parseCSV = (csvString: string): { headers: string[], data: SheetData } => {
  const result = Papa.parse(csvString, {
    header: false,
    skipEmptyLines: true,
  });

  const rawData = result.data as string[][];
  
  if (rawData.length === 0) return { headers: [], data: [] };

  const headers = rawData[0].map(h => h.trim());
  const body = rawData.slice(1);

  const data: SheetData = body.map(row => 
    row.map(cell => ({ value: cell ? cell.trim() : '' }))
  );

  return { headers, data };
};

export const serializeCSV = (headers: string[], data: SheetData): string => {
  const headerRow = headers;
  const bodyRows = data.map(row => row.map(cell => cell.value));
  return Papa.unparse([headerRow, ...bodyRows]);
};

export const fetchGoogleSheet = async (url: string): Promise<string> => {
    // Basic regex to try and convert a standard edit URL to export URL
    // e.g., https://docs.google.com/spreadsheets/d/KEY/edit#gid=0 -> https://docs.google.com/spreadsheets/d/KEY/export?format=csv
    let exportUrl = url;
    
    const keyMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (keyMatch) {
        const key = keyMatch[1];
        exportUrl = `https://docs.google.com/spreadsheets/d/${key}/export?format=csv`;
    }

    const response = await fetch(exportUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }
    return await response.text();
}
