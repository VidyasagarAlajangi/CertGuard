import React, { useState, useEffect } from "react";
import api from "../lib/axios";
import { useSelector, useDispatch } from "react-redux";


const CompanyUploadCertificates = ({ type }) => {
  // Single upload state
  const [singleForm, setSingleForm] = useState({
    recipientName: "",
    recipientEmail: "",
    courseName: "",
    courseProvider: "",
    courseDuration: "",
    remarks: "",
  });
  // Bulk upload state
  const [bulkForm, setBulkForm] = useState({
    courseName: "",
    courseDuration: "",
    courseProvider: "",
    remarks: "",
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { user } = useSelector((state) => state.auth);

  const singleUploadMessages = [
    "Preparing your certificate...",
    "Uploading to the cloud...",
    "Securing on the blockchain...",
    "Finalizing issuance..."
  ];
  const bulkUploadMessages = [
    "Processing CSV file...",
    "Generating certificates...",
    "Uploading all certificates...",
    "Securing all on the blockchain..."
  ];

  const [singleMsgIndex, setSingleMsgIndex] = useState(0);
  const [bulkMsgIndex, setBulkMsgIndex] = useState(0);

  useEffect(() => {
    if (loading) {
      const singleInterval = setInterval(() => {
        setSingleMsgIndex((prev) => (prev + 1) % singleUploadMessages.length);
      }, 2000);
      const bulkInterval = setInterval(() => {
        setBulkMsgIndex((prev) => (prev + 1) % bulkUploadMessages.length);
      }, 2000);
      return () => {
        clearInterval(singleInterval);
        clearInterval(bulkInterval);
      };
    }
  }, [loading]);

  // Handlers for single upload
  const handleSingleChange = (e) => {
    const { name, value } = e.target;
    setSingleForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await api.post("/company/issue/single", singleForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Certificate issued successfully!");
      setSingleForm({
        recipientName: "",
        recipientEmail: "",
        courseName: "",
        courseProvider: "",
        courseDuration: "",
        remarks: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to issue certificate.");
    } finally {
      setLoading(false);
    }
  };

  // Handlers for bulk upload
  const handleBulkChange = (e) => {
    const { name, value } = e.target;
    setBulkForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleBulkFileChange = (e) => {
    setBulkForm((prev) => ({ ...prev, file: e.target.files[0] }));
  };
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("courseName", bulkForm.courseName);
      data.append("courseDuration", bulkForm.courseDuration);
      data.append("courseProvider", bulkForm.courseProvider);
      data.append("remarks", bulkForm.remarks);
      data.append("file", bulkForm.file);
      const res = await api.post("/company/issue/bulk", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage(res.data.message || "Bulk certificates issued!");
      setBulkForm({
        courseName: "",
        courseProvider: "",
        courseDuration: "",
        remarks: "",
        file: null,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl mx-auto mt-8">
      {type === "single" && (
        <form onSubmit={handleSingleSubmit} className="space-y-4">
          <input
            type="text"
            name="recipientName"
            placeholder="Recipient Name"
            value={singleForm.recipientName}
            onChange={handleSingleChange}
            className="w-full border-2 border-blue-200 rounded-lg px-4 py-2"
            required
          />
          <input
            type="email"
            name="recipientEmail"
            placeholder="Recipient Email"
            value={singleForm.recipientEmail}
            onChange={handleSingleChange}
            className="w-full border-2 border-blue-200 rounded-lg px-4 py-2"
            required
          />
          <input
            type="text"
            name="courseName"
            placeholder="Course Name"
            value={singleForm.courseName}
            onChange={handleSingleChange}
            className="w-full border-2 border-blue-200 rounded-lg px-4 py-2"
            required
          />
          <input
            type="text"
            name="courseProvider"
            placeholder="Instructor or Course provider"
            value={singleForm.courseProvider}
            className="w-full border-2 border-blue-200 rounded-lg px-4 py-2"
            onChange={handleSingleChange}
          />

          <input
            type="text"
            name="courseDuration"
            placeholder="Course Duration (optional)"
            value={singleForm.courseDuration}
            onChange={handleSingleChange}
            className="w-full border-2 border-blue-200 rounded-lg px-4 py-2"
          />

          <input
            type="text"
            name="remarks"
            placeholder="Remarks (optional)"
            value={singleForm.remarks}
            onChange={handleSingleChange}
            className="w-full border-2 border-blue-200 rounded-lg px-4 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 font-semibold text-lg shadow-md hover:shadow-lg transition-all w-full flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse text-center w-full">{singleUploadMessages[singleMsgIndex]}</span>
            ) : (
              "Issue Certificate"
            )}
          </button>
        </form>
      )}
      {type === "bulk" && (
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <input
            type="text"
            name="courseName"
            placeholder="Course Name"
            value={bulkForm.courseName}
            onChange={handleBulkChange}
            className="w-full border-2 border-blue-200 rounded-lg px-4 py-2"
            required
          />
          <input
            type="text"
            name="courseProvider"
            placeholder="Instructor or Course provider"
            value={bulkForm.courseProvider}
            onChange={handleBulkChange}
            className="w-full border-2 border-blue-200 rounded-lg px-4 py-2"
            required
          />
          <input
            type="text"
            name="courseDuration"
            placeholder="Course Duration (optional)"
            value={bulkForm.courseDuration}
            onChange={handleBulkChange}
            className="w-full border-2 border-blue-200 rounded-lg px-4 py-2"
          />
          <input
            type="text"
            name="remarks"
            placeholder="Remarks (optional)"
            value={bulkForm.remarks}
            onChange={handleBulkChange}
            className="w-full border-2 border-blue-200 rounded-lg px-4 py-2"
          />
          <input
            type="file"
            accept=".csv"
            onChange={handleBulkFileChange}
            className="border-2 border-blue-200 rounded-lg px-4 py-2 w-full text-lg bg-blue-50 hover:bg-blue-100 transition"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 font-semibold text-lg shadow-md hover:shadow-lg transition-all w-full flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse text-center w-full">{bulkUploadMessages[bulkMsgIndex]}</span>
            ) : (
              "Upload CSV & Issue"
            )}
          </button>
        </form>
      )}
      {(message || error) && (
        <div
          className={`mt-6 p-4 rounded-lg ${
            message ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message || error}
        </div>
      )}
      {type === "bulk" && (
        <div className="mt-4 text-sm text-gray-500">
          <div>
            CSV format: <code>name,email</code>
          </div>
          <div>Example:</div>
          <pre className="bg-gray-100 p-2 rounded">
            John Doe,john@example.com Jane Smith,jane@example.com
          </pre>
        </div>
      )}
    </div>
  );
};

export default CompanyUploadCertificates;
