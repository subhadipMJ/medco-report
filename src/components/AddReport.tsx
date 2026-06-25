import { useState, useRef, useEffect } from "react";
import {
  X,
  CalendarDays,
  User,
  Building2,
  Plus,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowLeft,
  RefreshCw,
  // Upload,
  // Trash2,
  // FileText,
} from "lucide-react";
import { useNavigateWithToken } from "../hooks/useNavigateWithToken";
import { useLocation } from "react-router-dom";
import { AddLabReportRequest, CompareReportParameter } from "../types/api";
import { useAddDoctor, useDoctor } from "../hooks/useDoctor";
import { useAddLab, useLab } from "../hooks/useLab";
import { useAddLabReport } from "../hooks/useLabReports";

interface TestEntry extends CompareReportParameter {
  value: string;
  test_report?: File;
}

interface AddReportProps {
  token: string;
}

function CustomDropdown({
  icon,
  options,
  value,
  onChange,
  placeholder,
  direction = "up",
  loading,
  error,
}: {
  icon: React.ReactNode;
  options: { value: string; label: string }[];
  value: string;
  onChange: (opt: { value: string; label: string }) => void;
  placeholder: string;
  direction?: "up" | "down";
  loading?: boolean;
  error?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative w-[290px] landscape:w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-14 rounded-2xl border border-slate-200 bg-white pl-9 pr-9 text-base font-semibold text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition-colors flex items-center text-left"
      >
        {selected ? selected.label : placeholder}
      </button>
      {open && (
        <div
          className={`absolute left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-lg z-50 overflow-hidden ${
            direction === "up" ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {loading && (
            <div className="px-3 py-2.5 text-sm text-slate-400 flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin" />
              Loading...
            </div>
          )}
          {error && (
            <div className="px-3 py-2.5 text-sm text-red-500 flex items-center gap-2">
              <X size={14} />
              {error}
            </div>
          )}
          {!loading &&
            !error &&
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2.5 text-left text-sm font-medium flex items-center justify-between transition-colors ${
                  value === opt.value
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-white"
                }`}
              >
                {opt.label}
                {value === opt.value && (
                  <Check size={14} className="text-blue-600" />
                )}
              </button>
            ))}
        </div>
      )}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        {icon}
      </div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
    </div>
  );
}

const AddReport = ({ token }: AddReportProps) => {
  const navigate = useNavigateWithToken();
  const location = useLocation();
  const preserved = location.state as {
    date?: string;
    doctor?: string | { value: string; label: string };
    lab?: string | { value: string; label: string };
    tests?: TestEntry[];
  } | null;

  const [date, setDate] = useState(preserved?.date || "");
  const [doctor, setDoctor] = useState<{ value: string; label: string } | null>(
    preserved?.doctor
      ? typeof preserved.doctor === "string"
        ? { value: preserved.doctor, label: preserved.doctor }
        : preserved.doctor
      : null,
  );
  const [lab, setLab] = useState<{ value: string; label: string } | null>(
    preserved?.lab
      ? typeof preserved.lab === "string"
        ? { value: preserved.lab, label: preserved.lab }
        : preserved.lab
      : null,
  );
  const [step, setStep] = useState<1 | 2>(preserved?.tests ? 2 : 1);
  const [tests, setTests] = useState<TestEntry[]>(preserved?.tests || []);

  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState("");
  const [showAddLab, setShowAddLab] = useState(false);
  const [newLab, setNewLab] = useState("");

  const [previews, setPreviews] = useState<Record<string, string>>({});

  const {
    doctors: apiDoctors,
    loading,
    error,
    refetch,
  } = useDoctor(token || null);

  const { submit: addDoctorSubmit, loading: addDoctorLoading } = useAddDoctor(
    token || null,
  );

  const { submit: addLabReportSubmit, loading: addLabReportLoading } =
    useAddLabReport(token || null);

  const {
    labs: apiLabs,
    loading: labsLoading,
    error: labsError,
    refetch: labsRefetch,
  } = useLab(token || null);

  const { submit: addLabSubmit, loading: addLabLoading } = useAddLab(
    token || null,
  );

  const doctorOptions =
    !loading && apiDoctors.length > 0
      ? apiDoctors.map((d) => ({ value: String(d.id), label: d.doctor_name }))
      : [];

  const labOptions =
    !labsLoading && apiLabs.length > 0
      ? apiLabs.map((l) => ({ value: String(l.id), label: l.lab_name }))
      : [];

  // const handleFileChangeForTest = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   parameter_id: string,
  // ) => {
  //   const selected = e.target.files;
  //   if (selected && selected.length > 0) {
  //     const file = selected[0];
  //     setTests((prev) =>
  //       prev.map((t) =>
  //         t.parameter_id === parameter_id ? { ...t, test_report: file } : t,
  //       ),
  //     );
  //     if (file.type.startsWith("image/")) {
  //       const url = URL.createObjectURL(file);
  //       setPreviews((prev) => ({ ...prev, [parameter_id]: url }));
  //     }
  //   }
  //   e.target.value = "";
  // };

  // const removeFileForTest = (parameter_id: string) => {
  //   setTests((prev) =>
  //     prev.map((t) =>
  //       t.parameter_id === parameter_id ? { ...t, test_report: undefined } : t,
  //     ),
  //   );
  //   setPreviews((prev) => {
  //     const next = { ...prev };
  //     if (next[parameter_id]) {
  //       URL.revokeObjectURL(next[parameter_id]);
  //       delete next[parameter_id];
  //     }
  //     return next;
  //   });
  // };

  const reset = () => {
    setDate("");
    setDoctor(null);
    setLab(null);
    setStep(1);
    setTests([]);
    setPreviews({});
  };

  const handleClose = () => {
    reset();
    navigate("/");
  };

  const handleContinue = () => {
    if (date && doctor && lab) setStep(2);
  };

  const toggleTest = (param: CompareReportParameter) => {
    setTests((prev) => {
      const exists = prev.find((t) => t.parameter_id === param.parameter_id);
      if (exists)
        return prev.filter((t) => t.parameter_id !== param.parameter_id);
      return [...prev, { ...param, value: "", test_report: undefined }];
    });
  };

  const updateTestValue = (parameter_name: string, value: string) => {
    setTests((prev) =>
      prev.map((t) =>
        t.parameter_name === parameter_name ? { ...t, value } : t,
      ),
    );
  };

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleAddDoctor = async (name: string) => {
    if (!name || !name.trim() || !token) return;
    try {
      await addDoctorSubmit(name.trim());
      refetch();
      setNewDoctor("");
      setShowAddDoctor(false);
    } catch (err: any) {
      alert(err.message || "Failed to add doctor");
    }
  };

  const handleAddLab = async (name: string) => {
    if (!name || !name.trim() || !token) return;
    try {
      await addLabSubmit(name.trim());
      labsRefetch();
      setNewLab("");
      setShowAddLab(false);
    } catch (err: any) {
      alert(err.message || "Failed to add lab");
    }
  };

  const handleFinalSubmit = async () => {
    const request: AddLabReportRequest = {
      date_of_test: date,
      lab_name: lab?.label || "",
      doctor_name: doctor?.label || "",
      tests: tests.map((t) => ({
        test_id: Number(t.test_id),
        group_id: t.group_id,
        parameter_id: t.parameter_id,
        test_value: t.value,
        test_report: t.test_report,
      })),
    };

    // console.log("Add report request:", request);

    try {
      await addLabReportSubmit(request);
      reset();
      navigate("/");
    } catch (err: any) {
      alert(err.message || "Failed to add lab");
    }
  };

  // console.log(tests);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      {step === 1 ? (
        <div className="flex items-center justify-between px-6 pt-8 pb-4">
          <div className="flex items-center gap-3">
            <p className="text-xl font-black text-slate-900">Add Report</p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <X size={18} className="text-slate-600" />
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-violet-50 via-fuchsia-50 to-rose-50 px-6 pt-8 pb-6 rounded-b-[2rem] mb-6">
          <div className="flex items-start justify-between">
            <button
              onClick={() => setStep(1)}
              className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur border border-white/50 flex items-center justify-center hover:bg-white transition-colors"
            >
              <ArrowLeft size={16} className="text-slate-700" />
            </button>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur border border-white/50 flex items-center justify-center hover:bg-white transition-colors"
            >
              <X size={16} className="text-slate-700" />
            </button>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <p className="text-2xl font-black text-slate-900">
                Dr. {doctor?.label}
              </p>
              <p className="text-xl font-medium text-slate-500 mb-1">
                <CalendarDays size={18} className="inline mr-1" />
                {date}
              </p>
            </div>
            <p className="text-xl font-semibold text-slate-600 mt-1">
              <span className="text-slate-400">Laboratory Name: </span>
              {lab?.label}
            </p>
          </div>
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div className="px-6 pb-8 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="date-picker"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="sr-only"
              />
              <button
                type="button"
                onClick={() =>
                  (
                    document.getElementById(
                      "date-picker",
                    ) as HTMLInputElement | null
                  )?.showPicker?.()
                }
                className="w-full h-14 rounded-2xl border border-slate-200 bg-white pl-4 pr-12 text-lg font-bold text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition-colors flex items-center text-left"
              >
                {date
                  ? new Date(date).toLocaleDateString("en-GB")
                  : "DD/MM/YYYY"}
              </button>
              <CalendarDays
                size={20}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Doctor */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Doctor Name
            </label>
            <div className="flex items-center gap-2 mt-2">
              <CustomDropdown
                icon={<User size={16} />}
                options={doctorOptions || []}
                value={doctor?.value || ""}
                onChange={setDoctor}
                placeholder="Select doctor"
                direction="down"
                loading={loading}
                error={error}
              />
              <button
                onClick={() => {
                  refetch();
                  setDoctor(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <RefreshCw size={12} />
              </button>
              <button
                onClick={() => setShowAddDoctor(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 border border-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Plus size={12} className="text-white" />
              </button>
            </div>
            {showAddDoctor && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => setShowAddDoctor(false)}
                />
                <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-black text-slate-900">
                      Add Doctor
                    </p>
                    <button
                      onClick={() => setShowAddDoctor(false)}
                      className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center"
                    >
                      <X size={16} className="text-slate-600" />
                    </button>
                  </div>
                  <input
                    autoFocus
                    type="text"
                    value={newDoctor}
                    onChange={(e) => setNewDoctor(e.target.value)}
                    placeholder="Doctor name"
                    className="w-full h-14 rounded-2xl border border-slate-200 bg-white px-3 text-base font-semibold text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition-colors"
                  />
                  <button
                    disabled={addDoctorLoading}
                    onClick={() => {
                      const name = newDoctor.trim();
                      if (!name) return;
                      handleAddDoctor(name);
                    }}
                    className="w-full h-14 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {addDoctorLoading && (
                      <RefreshCw size={16} className="animate-spin" />
                    )}
                    {addDoctorLoading ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lab */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Lab Name
            </label>
            <div className="flex items-center gap-2 mt-2">
              <CustomDropdown
                icon={<Building2 size={16} />}
                options={labOptions || []}
                value={lab?.value || ""}
                onChange={setLab}
                placeholder="Select lab"
                direction="down"
                loading={labsLoading}
                error={labsError}
              />
              <button
                onClick={() => {
                  labsRefetch();
                  setLab(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <RefreshCw size={12} />
              </button>
              <button
                onClick={() => setShowAddLab((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 border border-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Plus size={12} className="text-white" />
              </button>
            </div>
            {showAddLab && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => setShowAddLab(false)}
                />
                <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-black text-slate-900">Add Lab</p>
                    <button
                      onClick={() => setShowAddLab(false)}
                      className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center"
                    >
                      <X size={16} className="text-slate-600" />
                    </button>
                  </div>
                  <input
                    autoFocus
                    type="text"
                    value={newLab}
                    onChange={(e) => setNewLab(e.target.value)}
                    placeholder="Lab name"
                    className="w-full h-14 rounded-2xl border border-slate-200 bg-white px-3 text-base font-semibold text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition-colors"
                  />
                  <button
                    disabled={addLabLoading}
                    onClick={() => {
                      const name = newLab.trim();
                      if (!name) return;
                      handleAddLab(name);
                    }}
                    className="w-full h-14 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {addLabLoading && (
                      <RefreshCw size={16} className="animate-spin" />
                    )}
                    {addLabLoading ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="px-6 pb-8 space-y-4">
          {/* Add Test Button */}
          <div className="flex justify-end">
            <button
              onClick={() =>
                navigate("/select-test", {
                  state: { date, doctor, lab, tests },
                })
              }
              className="h-12 rounded-xl border border-dashed border-slate-300 bg-green-500 text-white text-xl font-bold flex items-center justify-center gap-2 px-5 hover:bg-white transition-colors"
            >
              <Plus size={16} />
              Add Report
            </button>
          </div>

          {/* Selected Tests with Values */}
          {tests.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Enter Values
              </p>
              {tests.map((test) => (
                <div
                  key={test.parameter_id}
                  className="flex-1 items-start gap-3 bg-white border border-slate-200 rounded-2xl p-3"
                >
                  {/* <FlaskConical
                    size={16}
                    className="text-slate-400 shrink-0 mt-1"
                  /> */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800 truncate mb-2">
                        {test.parameter_name}
                      </p>
                      <button
                        onClick={() => toggleTest(test)}
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0 mt-1"
                      >
                        <X size={14} className="text-slate-500" />
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={test.value}
                        onChange={(e) =>
                          updateTestValue(test.parameter_name, e.target.value)
                        }
                        placeholder="0.0"
                        className="w-full h-16 rounded-3xl border border-slate-200 bg-white pl-5 pr-14 text-lg font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                      {test.parameter_unit && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                          {test.parameter_unit}
                        </span>
                      )}
                    </div>

                    {/* Attachments */}
                    {/* <div className="flex-1 min-w-0 my-6">
                      <input
                        id={`file-input-${test.parameter_id}`}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={(e) => handleFileChangeForTest(e, test.parameter_id)}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`file-input-${test.parameter_id}`}
                        className="w-full h-14 rounded-2xl border border-dashed border-slate-300 bg-green-700 text-white text-base font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors cursor-pointer"
                      >
                        <Upload size={16} />
                        Upload File
                      </label>

                      {test.test_report && (
                        <div className="mt-3 grid gap-3">
                          <div
                            key={`${test.test_report.name}-${test.parameter_id}`}
                            className="flex items-center bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm"
                          >
                            {test.test_report.type.startsWith("image/") &&
                            previews[test.parameter_id] ? (
                              <div className="w-16 h-16 shrink-0 bg-slate-100">
                                <img
                                  src={previews[test.parameter_id]}
                                  alt={test.test_report.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 shrink-0 bg-white flex items-center justify-center">
                                <FileText size={24} className="text-slate-300" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0 p-2.5">
                              <p className="text-xs font-medium text-slate-700 truncate">
                                {test.test_report.name}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-[10px] text-slate-400">
                                  {(test.test_report.size / 1024).toFixed(1)} KB
                                </p>
                                <button
                                  onClick={() => removeFileForTest(test.parameter_id)}
                                  className="w-6 h-6 rounded-md text-white bg-red-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fixed bottom action button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100">
        <div className="max-w-md mx-auto">
          {step === 1 ? (
            <button
              onClick={handleContinue}
              disabled={!date || !doctor || !lab}
              className="w-full h-14 rounded-2xl bg-slate-900 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              disabled={tests.length === 0 || addLabReportLoading}
              className="w-full h-14 rounded-2xl bg-slate-900 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {addLabReportLoading && (
                <RefreshCw size={16} className="animate-spin" />
              )}
              {addLabReportLoading ? "Saving..." : "Save Report"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddReport;
