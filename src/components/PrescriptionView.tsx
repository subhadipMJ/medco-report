import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, X, Share2 } from "lucide-react";
import { useNavigateWithToken } from "../hooks/useNavigateWithToken";

export default function PrescriptionView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigateWithToken();
  const url = searchParams.get("url") || "";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) {
      navigate(-1);
    }
  }, [url, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleShare = async () => {
    if (!url) return;
    try {
      if (navigator.canShare && navigator.canShare({ url })) {
        await navigator.share({ url, title: "Prescription" });
        return;
      }
    } catch {
      /* ignore user cancellation */
    }
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch {
      window.open(url, "_blank");
    }
  };

  // const handleDownload = async () => {
  //   if (!url) return;
  //   try {
  //     const response = await fetch(url);
  //     const blob = await response.blob();
  //     const blobUrl = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = blobUrl;
  //     link.download = url.split("/").pop() || "prescription";
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(blobUrl);
  //   } catch {
  //     window.open(url, "_blank");
  //   }
  // };

  if (!url) return null;

  const isPdf = url.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-700" />
          </button>
          <p className="text-sm font-semibold text-slate-800">Prescription</p>
        </div>
        <div className="flex items-center gap-2">
          {/* <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Download size={16} />
            Download
          </button> */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            title="Share"
          >
            <Share2 size={16} />
            Share
          </button>
          <button
            onClick={handleBack}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-100 overflow-auto">
        {isPdf ? (
          <iframe
            src={url}
            title="Prescription PDF"
            className="w-full h-full"
            onLoad={() => setLoading(false)}
          />
        ) : (
          <div className="flex items-center justify-center min-h-full p-4">
            <img
              src={url}
              alt="Prescription"
              className="max-w-full max-h-full object-contain rounded-lg shadow-md"
              onLoad={() => setLoading(false)}
            />
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}
