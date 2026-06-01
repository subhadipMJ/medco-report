export interface SubReport {
  id: string;
  name: string;
  value: string | number;
  unit: string;
  reference: string;
  status: 'normal' | 'high' | 'low';
}

export interface PatientInfo {
  name: string;
  id: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  bloodPressure: string;
  allergy: string;
}

export interface ReportCategory {
  id: string;
  title: string;
  date: string;
  doctor: string;
  facility: string;
  status: 'Normal' | 'Abnormal' | 'Review' | 'Critical' | 'Warning';
  type: 'critical' | 'normal';
  value?: string | number;
  unit?: string;
  referenceRange?: string;
  trend?: string; // e.g. "↑ High"
  trendValue?: string; 
  description?: string;
  subReports?: SubReport[];
}

export const patient: PatientInfo = {
  name: 'Utpal Pramanik',
  id: 'MED-2024-0871',
  age: 34,
  gender: 'Male',
  bloodGroup: 'B+',
  bloodPressure: '118/76',
  allergy: 'Penicillin',
};

export const reportsData: ReportCategory[] = [
  // CRITICAL REPORTS
  {
    id: 'tsh',
    title: 'Thyroid Function (TSH)',
    date: 'Mar 28, 2026',
    doctor: 'Dr. Sharma',
    facility: 'Apollo Clinic',
    status: 'Critical',
    type: 'critical',
    value: 5.8,
    unit: 'mIU/L',
    referenceRange: '0.4–4.5',
    trend: '↑ High',
    trendValue: 'Low • Normal ≤4.5 • ↑ High',
    description: 'TSH is 1.3 units above upper limit. Possible hypothyroidism. Consult endocrinologist immediately.',
  },
  {
    id: 'hba1c',
    title: 'HbA1c (Glycated Hb)',
    date: 'Apr 10, 2026',
    doctor: 'Dr. Roy',
    facility: 'AMRI Hospital',
    status: 'Warning',
    type: 'critical',
    value: 5.6,
    unit: '%',
    referenceRange: '<5.7',
    trend: 'Borderline',
    trendValue: '4.0% • Borderline 5.7% • Diabetic',
    description: 'Pre-diabetic range. Dietary changes + exercise needed. Retest every 3 months.',
  },
  
  // NORMAL REPORTS
  {
    id: 'cbc',
    title: 'Complete Blood Count',
    date: 'Apr 20',
    doctor: 'Dr. Sharma',
    facility: 'Apollo Clinic',
    status: 'Normal',
    type: 'normal',
    subReports: [
      { id: 'hb', name: 'Hemoglobin', value: 14.2, unit: 'g/dL', reference: '13–17', status: 'normal' },
      { id: 'wbc', name: 'WBC Count', value: 7.1, unit: 'K/µL', reference: '4.5–11', status: 'normal' },
      { id: 'plt', name: 'Platelets', value: 245, unit: 'K/µL', reference: '150–400', status: 'normal' },
      { id: 'rbc', name: 'RBC Count', value: 5.1, unit: 'M/µL', reference: '4.5–5.9', status: 'normal' },
    ]
  },
  {
    id: 'lipid',
    title: 'Lipid Profile',
    date: 'Apr 15',
    doctor: 'Dr. Mehta',
    facility: 'AMRI Hospital',
    status: 'Normal',
    type: 'normal',
    subReports: [
      { id: 'chol', name: 'Total Cholesterol', value: 182, unit: 'mg/dL', reference: '<200', status: 'normal' },
      { id: 'ldl', name: 'LDL', value: 108, unit: 'mg/dL', reference: '<130', status: 'normal' },
      { id: 'hdl', name: 'HDL', value: 55, unit: 'mg/dL', reference: '>40', status: 'normal' },
      { id: 'trig', name: 'Triglycerides', value: 142, unit: 'mg/dL', reference: '<150', status: 'normal' },
    ]
  },
  {
    id: 'kft',
    title: 'Kidney Function (KFT)',
    date: 'Mar 20',
    doctor: 'Dr. Das',
    facility: 'AMRI Hospital',
    status: 'Normal',
    type: 'normal',
    subReports: [
      { id: 'creat', name: 'Creatinine', value: 0.9, unit: 'mg/dL', reference: '0.7–1.3', status: 'normal' },
      { id: 'egfr', name: 'eGFR', value: 98, unit: 'mL/min', reference: '>90', status: 'normal' },
      { id: 'bun', name: 'BUN', value: 14, unit: 'mg/dL', reference: '7–20', status: 'normal' },
      { id: 'uric', name: 'Uric Acid', value: 5.2, unit: 'mg/dL', reference: '3.5–7.2', status: 'normal' },
    ]
  },
  {
    id: 'lft',
    title: 'Liver Function (LFT)',
    date: 'Mar 15',
    doctor: 'Dr. Bose',
    facility: 'Belle Vue',
    status: 'Normal',
    type: 'normal',
    subReports: [
      { id: 'sgpt', name: 'SGPT (ALT)', value: 28, unit: 'U/L', reference: '7–56', status: 'normal' },
      { id: 'sgot', name: 'SGOT (AST)', value: 24, unit: 'U/L', reference: '10–40', status: 'normal' },
      { id: 'bili', name: 'Bilirubin Total', value: 0.8, unit: 'mg/dL', reference: '0.2–1.2', status: 'normal' },
      { id: 'alb', name: 'Albumin', value: 4.2, unit: 'g/dL', reference: '3.5–5.0', status: 'normal' },
    ]
  },
  {
    id: 'vit',
    title: 'Vitamin Panel',
    date: 'Mar 10',
    doctor: 'Dr. Sharma',
    facility: 'Apollo Clinic',
    status: 'Normal',
    type: 'normal',
    subReports: [
      { id: 'd3', name: 'Vitamin D3', value: 42, unit: 'ng/mL', reference: '30–100', status: 'normal' },
      { id: 'b12', name: 'Vitamin B12', value: 380, unit: 'pg/mL', reference: '200–900', status: 'normal' },
      { id: 'fol', name: 'Folate', value: 9.4, unit: 'ng/mL', reference: '>5.9', status: 'normal' },
      { id: 'iron', name: 'Iron (Serum)', value: 88, unit: 'µg/dL', reference: '60–170', status: 'normal' },
    ]
  }
];
