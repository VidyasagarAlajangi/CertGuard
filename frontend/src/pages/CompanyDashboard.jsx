import { useState } from "react";
import { Upload, FileText } from "lucide-react";
import CompanyUploadCertificates from "./CompanyUploadCertificates";
import CompanyViewCertificates from "./CompanyViewCertificates";

const options = [
  {
    key: "upload",
    label: "Upload Certificates",
    icon: <Upload className="w-8 h-8 text-blue-500 mb-2" />,
  },
  {
    key: "view",
    label: "View Certificates",
    icon: <FileText className="w-8 h-8 text-purple-500 mb-2" />,
  },
];

export default function CompanyDashboard() {
  const [selected, setSelected] = useState(null);
  const [uploadType, setUploadType] = useState("single");

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 pt-32 pb-20 px-2">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-8 tracking-wide drop-shadow">
          Company Panel
        </h1>
        {!selected ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSelected(opt.key)}
                className="flex flex-col items-center justify-center bg-gradient-to-br from-white to-blue-50 border-2 border-indigo-100 rounded-xl shadow-lg p-8 hover:scale-105 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 group"
              >
                {opt.icon}
                <span className="text-xl font-semibold text-gray-800 group-hover:text-indigo-700">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="animate-fade-in">
            <button
              onClick={() => setSelected(null)}
              className="mb-6 px-5 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-full shadow hover:bg-indigo-200 transition"
            >
              ← Back to Company Options
            </button>
            <div className="mt-2">
              {selected === "upload" && (
                <>
                  <div className="flex gap-4 mb-6">
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        uploadType === "single"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-blue-700"
                      }`}
                      onClick={() => setUploadType("single")}
                    >
                      Single Upload
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        uploadType === "bulk"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-blue-700"
                      }`}
                      onClick={() => setUploadType("bulk")}
                    >
                      Bulk Upload (CSV)
                    </button>
                  </div>
                  <CompanyUploadCertificates type={uploadType} />
                </>
              )}
              {selected === "view" && <CompanyViewCertificates />}
            </div>
          </div>
        )}
      </div>
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 0.4s;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </div>
  );
}
