export interface TestType {
  id: number;
  name: string;
  key_word: string;
}

export interface TestGroup {
  id: number;
  name: string;
  key_word: string;
}

export interface TestParameter {
  id: number;
  name: string;
  unit: string;
}

export interface LabReport {
  id: number;
  user_id: number;
  test_id: string;
  group_id: string;
  parameter_id: string;
  date_of_test: string;
  lab_name: string;
  doctor_name: string;
  prescription: string | null;
  test_value: string;
  test_report: string | null;
  created_at: string;
  updated_at: string;
  test_type: TestType;
  group: TestGroup;
  parameter: TestParameter;
}

export interface LabReportListResponse {
  success: number;
  error: number;
  lists: LabReport[];
}

export interface GroupedReport {
  groupId: number;
  groupName: string;
  groupKeyword: string;
  testType: TestType;
  latestDate: string;
  labName: string;
  doctorName: string;
  parameters: LabReport[];
}

export interface GroupedByTestType {
  testType: TestType;
  groups: GroupedReport[];
}
