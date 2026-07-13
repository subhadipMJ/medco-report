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
  status?: "high" | "normal" | "low";
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
  status?: "high" | "normal" | "low";
  test_type: TestType | null;
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

export interface CompareReportParameter {
  parameter_id: string;
  parameter_name: string;
  parameter_unit: string;
  start_range?: string;
  end_range?: string;
  group_id: string;
  test_id: string;
}

export interface CompareReportsResponse {
  success: number;
  error: number;
  message?: string;
  data: CompareReportParameter[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface CompareReportDetails {
  parameter_id: number | null;
  parameter_name: string;
  unit: string;
  start_range: string;
  end_range: string;
  records: [
    {
      id: number | null;
      date_of_test: string;
      test_value: string;
      status: string;
      lab_name: string;
      doctor_name: string;
    },
  ];
}

export interface CompareReportDetailsResponse {
  success: number;
  error: number;
  message?: string;
  data: CompareReportDetails[];
}

export interface Prescription {
  id: number;
  user_id: number;
  doctor_name: string;
  prescription: string;
  created_at: string;
  updated_at: string;
  prescription_url: string;
}

export interface PrescriptionResponse {
  success: number;
  error: number;
  message: string;
  prescription: Prescription[];
}

export interface PrescriptionSubmitRequest {
  doctor_name: string;
  prescription: File;
}

export interface PrescriptionSubmitResponse {
  success: number;
  error: number;
  message: string;
}

export interface DeletePrescriptionRequest {
  id: number;
}

export interface DeletePrescriptionResponse {
  success: number;
  error: number;
  message: string;
}

export interface UserProfile {
  id: number | null;
  category_id: number | null;
  name: string;
  email: string;
  email_verified_at: string | null;
  Activity: string;
  day: string | null;
  start_time: string | null;
  end_time: string | null;
  api_token: string;
  type: string;
  experience: string | null;
  city: string | null;
  province: string | null;
  phone: string;
  shop_phone: string | null;
  referral_code: string;
  registration_code: string | null;
  hospital_name: string | null;
  council_short_code: string | null;
  council_id: number | null;
  years_info: string | null;
  address: string;
  url: string | null;
  short_url: string | null;
  avatar: string | null;
  gender: string | null;
  lang: string;
  job_title: string | null;
  default_pipeline: string | null;
  created_by: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  postal_code: string | null;
  latitude: string | null;
  longitude: string | null;
  image: string | null;
  wallet: number;
  status: string;
  verify: string;
  remark: string | null;
  deleted_at: string | null;
  package: string;
  display: string;
  full_text: string | null;
  number: string | null;
  by_user_id: string | null;
  user_type: string;
  is_doner: string;
  clinic_visitd_at: string | null;
  doctor_bio: string | null;
  logo: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  subscription_status: string | null;
}

export interface UserProfileResponse {
  success: boolean;
  user: UserProfile;
}

export interface Doctor {
  id: number;
  doctor_name: string;
  updated_at: string;
  created_at: string;
}

export interface DoctorResponse {
  success: number;
  error: number;
  message?: string;
  data: Doctor[];
}

export interface AddDoctorRequest {
  doctor_name: string;
}

export interface AddDoctorResponse {
  success: number;
  error: number;
  message: string;
  data: {
    user_id: number;
    doctor_name: string;
    updated_at: string;
    created_at: string;
    id: number;
  };
}

export interface Lab {
  id: number;
  lab_name: string;
  updated_at: string;
  created_at: string;
}

export interface LabResponse {
  success: number;
  error: number;
  message?: string;
  data: Lab[];
}

export interface AddLabRequest {
  lab_name: string;
}

export interface AddLabResponse {
  success: number;
  error: number;
  message: string;
  data: {
    user_id: number;
    lab_name: string;
    updated_at: string;
    created_at: string;
    id: number;
  };
}

export interface AddLabReportRequest {
  date_of_test: string;
  lab_name: string;
  doctor_name: string;
  tests: {
    test_id: number;
    group_id: string;
    parameter_id: string;
    test_value: string;
    test_report?: File;
  }[];
}

export interface AddLabReportResponse {
  success: number;
  error: number;
  message: string;
}

export interface DeleteLabReportRequest {
  id: number;
}

export interface DeleteLabReportResponse {
  success: number;
  error: number;
  message: string;
}

export interface Vitals {
  id: number;
  user_id: number;
  height_ft: number;
  height_inch: number;
  weight: string;
  bmi: string;
  pulse: string;
  waist: string;
  created_at: string;
  updated_at: string;
}

export interface VitalsResponse {
  success: number;
  error: number;
  message?: string;
  data: Vitals;
}

export interface AddVitalRequest {
  height_ft?: number;
  height_inch?: number;
  weight?: number;
  bmi?: number;
  pulse?: number;
  waist?: number;
}

export interface AddVitalResponse {
  success: boolean;
  message: string;
  data: {
    user_id: number;
    height: string;
    weight: string;
    bmi: string;
    pulse: string;
    waist: string;
    updated_at: string;
    created_at: string;
    id: number;
  };
}

export interface VitalsOthers {
  id: number;
  user_id: number;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface VitalsOthersResponse {
  success: number;
  error: number;
  message?: string;
  data: VitalsOthers[];
}

export interface AddVitalOthersRequest {
  key: string;
  value: string;
}

export interface AddVitalOthersResponse {
  success: boolean;
  message: string;
  data: {
    user_id: number;
    key: string;
    value: string;
    updated_at: string;
    created_at: string;
    id: number;
  };
}
