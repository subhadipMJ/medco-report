import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface VitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldKey: string;
  fieldValue: string;
  isLoading?: boolean;
  keyEditable?: boolean;
  onSave: (key: string, value: string) => void;
}

export default function VitalsModal({
  isOpen,
  onClose,
  fieldKey,
  fieldValue,
  isLoading = false,
  keyEditable = false,
  onSave,
}: VitalsModalProps) {
  const [value, setValue] = useState("");
  const [editableKey, setEditableKey] = useState("");

  useEffect(() => {
    if (isOpen) {
      setValue(fieldValue);
      setEditableKey(fieldKey);
    } else {
      setValue("");
      setEditableKey("");
    }
  }, [isOpen, fieldValue, fieldKey]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(keyEditable ? editableKey : fieldKey, value);
  };

  const label = fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-sm p-5 animate-[fadeIn_0.15s_ease-out]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">
            {keyEditable ? "Add Vital" : `Edit ${label}`}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {keyEditable && (
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Field Name
              </label>
              <input
                type="text"
                value={editableKey}
                onChange={(e) => setEditableKey(e.target.value)}
                placeholder="e.g. weight, height, bmi"
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition-colors"
                autoFocus
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {keyEditable ? "Value" : label}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition-colors"
              autoFocus={!keyEditable}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors mt-2 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
