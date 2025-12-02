import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { ChartConfig, SheetData } from '../../types';
import { Tokens } from '../../utils/styles';

interface ChartRendererProps {
  config: ChartConfig;
  data: SheetData;
  headers: string[];
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({ config, data, headers }) => {
  const chartData = data.map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      const val = row[index]?.value;
      const num = parseFloat(val);
      obj[header] = isNaN(num) ? val : num;
    });
    return obj;
  });

  const COLORS = [
    Tokens.Color.Accent.Surface[1], 
    Tokens.Color.Base.Content[1], 
    Tokens.Color.Base.Content[3], 
    Tokens.Color.Feedback.Warning, 
    Tokens.Color.Feedback.Error
  ];

  const renderChart = () => {
    switch (config.type) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={Tokens.Color.Base.Border[1]} />
            <XAxis dataKey={config.dataKey} axisLine={false} tickLine={false} tick={{fill: Tokens.Color.Base.Content[2], fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: Tokens.Color.Base.Content[2], fontSize: 12}} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: Tokens.Effect.Shadow.Soft }}
              cursor={{ fill: Tokens.Color.Base.Surface[2] }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {config.series.map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[6, 6, 0, 0]} />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={chartData}>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={Tokens.Color.Base.Border[1]} />
            <XAxis dataKey={config.dataKey} axisLine={false} tickLine={false} tick={{fill: Tokens.Color.Base.Content[2], fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: Tokens.Color.Base.Content[2], fontSize: 12}} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: Tokens.Effect.Shadow.Soft }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {config.series.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={3} dot={{ r: 4, fill: 'white', strokeWidth: 2 }} />
            ))}
          </LineChart>
        );
       case 'pie':
         return (
           <PieChart>
             <Pie
               data={chartData}
               dataKey={config.series[0]}
               nameKey={config.dataKey}
               cx="50%"
               cy="50%"
               innerRadius={60}
               outerRadius={80}
               paddingAngle={5}
             >
               {chartData.map((entry, index) => (
                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
               ))}
             </Pie>
             <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: Tokens.Effect.Shadow.Soft }} />
             <Legend />
           </PieChart>
         )
      default: return null;
    }
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '300px',
    backgroundColor: Tokens.Color.Base.Surface[1],
    padding: Tokens.Space[4],
    borderRadius: Tokens.Effect.Radius.L,
    border: `1px solid ${Tokens.Color.Base.Border[1]}`,
    boxShadow: Tokens.Effect.Shadow.Soft,
    marginTop: Tokens.Space[4],
    marginBottom: Tokens.Space[4],
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ ...Tokens.Type.Readable.Label.M, marginBottom: Tokens.Space[2], color: Tokens.Color.Base.Content[1] }}>{config.title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        {renderChart() || <div>Chart Type Not Supported</div>}
      </ResponsiveContainer>
    </div>
  );
};