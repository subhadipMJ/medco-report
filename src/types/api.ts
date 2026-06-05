export interface TestType {
  id: number;
  name: string;
  key_word: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface TestGroup {
  id: number;
  name: string;
  key_word: string;
  bodytext_id: string;
  priority: number;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface TestParameter {
  id: number;
  name: string;
  key_word: string;
  value: string;
  type_of_input: string;
  testgroup_id: string;
  unit: string;
  priority: number;
  start_range: string;
  end_range: string;
  method: string;
  created_at: string;
  updated_at: string;
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
  message?: string;
  data: {
    current_page: number;
    data: LabReport[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface ReportDetailsPaginatedData {
  current_page: number;
  data: LabReport[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface LabReportDetailsResponse {
  success: number;
  error: number;
  message?: string;
  data: ReportDetailsPaginatedData;
}

export interface LabReportTypeData {
  id: number;
  name: string;
  key_word: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface LabReportTypeDetailsResponse {
  success: number;
  error: number;
  message: string;
  data: LabReportTypeData;
}

export interface LabReportGroupData {
  id: number;
  name: string;
  key_word: string;
}

export interface LabReportGroupDetailsResponse {
  success: number;
  error: number;
  message: string;
  data: LabReportGroupData;
}

export interface LabReportParameterData {
  id: number;
  name: string;
  unit: string;
}

export interface LabReportParameterDetailsResponse {
  success: number;
  error: number;
  message: string;
  data: LabReportParameterData;
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
