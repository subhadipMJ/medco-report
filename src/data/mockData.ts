export interface HealthMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  iconType: string;
}

export interface ReportDataPoint {
  date: string;
  value: number;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'Normal' | 'Abnormal' | 'Review';
  data: ReportDataPoint[];
  unit: string;
  referenceRange: string;
}

export const defaultMetrics: HealthMetric[] = [
  { id: '1', name: 'Height', value: '175', unit: 'cm', iconType: 'ruler' },
  { id: '2', name: 'Weight', value: '72', unit: 'kg', iconType: 'weight' },
  { id: '3', name: 'BMI', value: '23.5', unit: '', iconType: 'activity' },
  { id: '4', name: 'Blood Pressure', value: '120/80', unit: 'mmHg', iconType: 'heart' },
];

export const availableMetrics: HealthMetric[] = [
  ...defaultMetrics,
  { id: '5', name: 'Heart Rate', value: '72', unit: 'bpm', iconType: 'pulse' },
  { id: '6', name: 'Blood Sugar', value: '95', unit: 'mg/dL', iconType: 'droplet' },
  { id: '7', name: 'Oxygen', value: '98', unit: '%', iconType: 'wind' },
];

export const sampleReports: Report[] = [
  {
    id: 'r1',
    title: 'Complete Blood Count (CBC)',
    description: 'Measures various components of blood including red/white blood cells and platelets.',
    date: 'Oct 24, 2023',
    status: 'Normal',
    unit: '10^3/uL',
    referenceRange: '4.5 - 11.0',
    data: [
      { date: 'May', value: 6.2 },
      { date: 'Jun', value: 6.5 },
      { date: 'Jul', value: 7.1 },
      { date: 'Aug', value: 6.8 },
      { date: 'Sep', value: 7.4 },
      { date: 'Oct', value: 7.0 },
    ],
  },
  {
    id: 'r2',
    title: 'Lipid Panel (Cholesterol)',
    description: 'Measures the amount of cholesterol and triglycerides in your blood.',
    date: 'Sep 15, 2023',
    status: 'Review',
    unit: 'mg/dL',
    referenceRange: '< 200',
    data: [
      { date: 'Apr', value: 190 },
      { date: 'May', value: 195 },
      { date: 'Jun', value: 202 },
      { date: 'Jul', value: 198 },
      { date: 'Aug', value: 210 },
      { date: 'Sep', value: 215 },
    ],
  },
  {
    id: 'r3',
    title: 'Fasting Blood Glucose',
    description: 'Measures your blood sugar after an overnight fast.',
    date: 'Oct 10, 2023',
    status: 'Normal',
    unit: 'mg/dL',
    referenceRange: '70 - 99',
    data: [
      { date: 'May', value: 85 },
      { date: 'Jun', value: 88 },
      { date: 'Jul', value: 82 },
      { date: 'Aug', value: 89 },
      { date: 'Sep', value: 92 },
      { date: 'Oct', value: 90 },
    ],
  },
  {
    id: 'r4',
    title: 'Thyroid Panel (TSH)',
    description: 'Evaluates thyroid function.',
    date: 'Aug 20, 2023',
    status: 'Abnormal',
    unit: 'mIU/L',
    referenceRange: '0.4 - 4.0',
    data: [
      { date: 'Mar', value: 3.5 },
      { date: 'Apr', value: 3.8 },
      { date: 'May', value: 4.1 },
      { date: 'Jun', value: 4.5 },
      { date: 'Jul', value: 4.2 },
      { date: 'Aug', value: 4.8 },
    ],
  }
];
