import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Upload, X, User, FileText } from "lucide-react";
import { useNavigateWithToken } from "../hooks/useNavigateWithToken";
import { useAddPrescription } from "../hooks/usePrescription";

interface AddPrescriptionProps {
  token: string;
}

export default function AddPrescription({ token }: AddPrescriptionProps) {
  const navigate = useNavigateWithToken();
  const [doctorName, setDoctorName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { submit, success, loading: prescriptionLoading, error: prescriptionError, reset } = useAddPrescription(token);

  useEffect(() => {
    reset();
  }, [reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (selected) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
      if (!allowedTypes.includes(selected.type)) {
        setValidationError("Only JPG, PNG, or PDF files are allowed.");
        setFile(null);
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setValidationError("File size must be less than 10MB.");
        setFile(null);
        return;
      }
      setValidationError(null);
      setFile(selected);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim()) {
      setValidationError("Doctor name is required.");
      return;
    }
    if (!file) {
      setValidationError("Please upload a prescription file.");
      return;
    }

    setValidationError(null);

    try {
      await submit({
        doctor_name: doctorName.trim(),
        prescription: file,
      });
    } catch {
      // error handled by hook
    }
  };

  useEffect(() => {
    if (success) {
      navigate("/prescription");
    }
  }, [success, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-[1440px] mx-auto bg-slate-50 min-h-screen pb-24">
        <div className="px-6 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between pt-6 pb-4">
            <button
              onClick={() => navigate("/prescription")}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={16} className="text-slate-600" />
            </button>
            <p className="text-lg font-black text-slate-900">Add Prescription</p>
            <div className="w-9" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Doctor Name */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Doctor Name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Smith"
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Prescription File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {!file ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-28 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                >
                  <Upload size={24} className="text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">
                    Tap to upload JPG, PNG, or PDF
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <FileText size={20} className="text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X size={16} className="text-slate-500" />
                  </button>
                </div>
              )}
            </div>

            {/* Error */}
            {(validationError || prescriptionError) && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-xs font-semibold text-red-600">{validationError || prescriptionError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={prescriptionLoading}
              className="w-full h-12 rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {prescriptionLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Prescription"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
