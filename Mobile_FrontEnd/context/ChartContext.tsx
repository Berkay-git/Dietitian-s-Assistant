import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

export interface ChartDataPoint {
  date: string;
  value: number;
}

interface ChartContextType {
  chartData: ChartDataPoint[];
  loading: boolean;
  error: string | null;
  hasGenerated: boolean;
  fetchChartData: (clientId: string, metric: string, duration: string) => Promise<void>;
}

const ChartContext = createContext<ChartContextType | undefined>(undefined);

const API_URL = 'http://10.0.2.2:5000';

const METRIC_MAP: Record<string, string> = {
  'Weight':    'weight',
  'Body Fat':  'bodyfat',
  'Adherence': 'adherence',
};

const DURATION_MAP: Record<string, string> = {
  'Daily':   'daily',
  'Weekly':  'weekly',
  'Monthly': 'monthly',
};

export const ChartProvider = ({ children }: { children: ReactNode }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const fetchChartData = async (clientId: string, metric: string, duration: string) => {
    setLoading(true);
    setError(null);
    setHasGenerated(true);

    try {
      const mappedMetric = METRIC_MAP[metric] ?? metric.toLowerCase();
      const mappedDuration = DURATION_MAP[duration] ?? duration.toLowerCase();

      const response = await axios.get(`${API_URL}/api/dietitian/progress-data`, {
        params: { client_id: clientId, metric: mappedMetric, duration: mappedDuration },  // Sending the parameters as arguments
      });

      if (response.data.success) {
        setChartData(response.data.data);
      } else {
        setError('Could not load chart data');
        setChartData([]);
      }
    } catch (err: any) {
      setError('Failed to fetch chart data');
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChartContext.Provider value={{ chartData, loading, error, hasGenerated, fetchChartData }}>
      {children}
    </ChartContext.Provider>
  );
};

export const useChart = () => {
  const context = useContext(ChartContext);
  if (!context) throw new Error('useChart must be used within a ChartProvider');
  return context;
};
