import { useEffect, useState } from "react";
import { FileText, ExternalLink } from "lucide-react";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";

export default function ViewCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/certificates");
        setCertificates(res.data.certificates);
        setError(null);
      } catch (err) {
        console.error("Error fetching certificates:", err);
        setError(err.response?.data?.message || "Failed to fetch certificates");
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 rounded-lg bg-red-50 border border-red-200">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-purple-700 mb-6 flex items-center gap-2">
        <FileText className="w-7 h-7" /> Certificates
      </h2>
      {certificates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No certificates found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl shadow p-6 flex flex-col gap-2 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="font-semibold text-lg text-purple-800">
                  {cert.title}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    cert.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : cert.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Issued to: {cert.recipientName}
                <br />
                Email: {cert.recipientEmail}
              </div>
              <div className="text-xs text-gray-400">
                Issued by: {cert.issuerName}
                <br />
                Date: {new Date(cert.issueDate).toLocaleDateString()}
              </div>
              {cert.certId && (
                <button
                  onClick={() => navigate(`/certificate/${cert.certId}`)}
                  className="mt-2 text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  Verify Certificate
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}