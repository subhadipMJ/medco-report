import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface VitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldKey: string;
  fieldValue: string;
  unit?: string;
  isLoading?: boolean;
  keyEditable?: boolean;
  keyInputType?: string;
  valueInputType?: string;
  onSave: (key: string, value: string) => void;
}

export default function VitalsModal({
  isOpen,
  onClose,
  fieldKey,
  fieldValue,
  unit,
  isLoading = false,
  keyEditable = false,
  keyInputType = "text",
  valueInputType = "text",
  onSave,
}: VitalsModalProps) {
  const [value, setValue] = useState("");
  const [editableKey, setEditableKey] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (fieldKey === "height") {
        const match = fieldValue.match(/([\d.]+)\s*ft\s*([\d.]+)\s*in/);
        const ft = match ? match[1] : "";
        const inc = match ? match[2] : "";
        setFeet(ft);
        setInches(inc);
        setValue(fieldValue);
      } else {
        setValue(Math.trunc(Number(fieldValue)).toString());
      }
      setEditableKey(fieldKey);
    } else {
      setValue("");
      setEditableKey("");
      setFeet("");
      setInches("");
    }
  }, [isOpen, fieldValue, fieldKey]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fieldKey === "height") {
      const ft = feet ? Number(feet) : 0;
      const inc = inches ? Number(inches) : 0;
      const formatted = `${ft} ft ${inc} in`;
      onSave(keyEditable ? editableKey : fieldKey, formatted);
    } else {
      onSave(keyEditable ? editableKey : fieldKey, value);
    }
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
                type={keyInputType}
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
              {unit && fieldKey !== "height" && <span className="ml-1 text-slate-400 normal-case">({unit})</span>}
            </label>
            {fieldKey === "height" ? (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Feet
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={feet}
                    onChange={(e) => setFeet(e.target.value)}
                    placeholder="0"
                    className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition-colors"
                    autoFocus={!keyEditable}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Inches
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={inches}
                    onChange={(e) => setInches(e.target.value)}
                    placeholder="0"
                    className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            ) : (
              <input
                type={valueInputType === "number" ? "text" : valueInputType}
                inputMode={valueInputType === "number" ? "decimal" : undefined}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition-colors"
                autoFocus={!keyEditable}
              />
            )}
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
