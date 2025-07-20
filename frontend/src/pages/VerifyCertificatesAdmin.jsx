import React, { useState, useEffect } from "react";
import api from "../lib/axios";

function PendingCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const fetchPending = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/admin/certificates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCerts((res.data.certificates || []).filter(c => c.status === "pending"));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch certificates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      const token = localStorage.getItem("token");
      const url = action === "approve"
        ? `/admin/certificates/approve/${id}`
        : `/admin/certificates/reject/${id}`;
      await api.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
      await fetchPending();
    } catch (err) {
      alert("Action failed: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Pending Certificates (Single)</h3>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : certs.length === 0 ? (
        <div className="text-gray-500">No pending certificates.</div>
      ) : (
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-blue-100">
              <th className="px-4 py-2">Recipient</th>
              <th className="px-4 py-2">Course</th>
              <th className="px-4 py-2">Issued Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {certs.map(cert => (
              <tr key={cert._id} className="border-t">
                <td className="px-4 py-2">{cert.recipientName}</td>
                <td className="px-4 py-2">{cert.courseName}</td>
                <td className="px-4 py-2">{new Date(cert.issuedDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{cert.status}</td>
                <td className="px-4 py-2">
                  <button
                    className="px-3 py-1 bg-green-500 text-white rounded mr-2 disabled:opacity-60"
                    disabled={actionLoading === cert._id + "approve"}
                    onClick={() => handleAction(cert._id, "approve")}
                  >
                    {actionLoading === cert._id + "approve" ? "Approving..." : "Approve"}
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-60"
                    disabled={actionLoading === cert._id + "reject"}
                    onClick={() => handleAction(cert._id, "reject")}
                  >
                    {actionLoading === cert._id + "reject" ? "Rejecting..." : "Reject"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function PendingIssuanceQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const fetchQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/issuance/queue", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQueue(res.data.requests || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch issuance queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      const token = localStorage.getItem("token");
      const url = action === "approve"
        ? `/issuance/approve/${id}`
        : `/issuance/reject/${id}`;
      await api.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
      await fetchQueue();
    } catch (err) {
      alert("Action failed: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Pending Issuance Queue (Bulk)</h3>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : queue.length === 0 ? (
        <div className="text-gray-500">No pending issuance requests.</div>
      ) : (
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-blue-100">
              <th className="px-4 py-2">Company</th>
              <th className="px-4 py-2">Course</th>
              <th className="px-4 py-2">Uploaded By</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {queue.map(req => (
              <tr key={req._id} className="border-t">
                <td className="px-4 py-2">{req.companyId?.name || "-"}</td>
                <td className="px-4 py-2">{req.courseName}</td>
                <td className="px-4 py-2">{req.uploadedBy?.name || "-"}</td>
                <td className="px-4 py-2">{req.status}</td>
                <td className="px-4 py-2">
                  <button
                    className="px-3 py-1 bg-green-500 text-white rounded mr-2 disabled:opacity-60"
                    disabled={actionLoading === req._id + "approve"}
                    onClick={() => handleAction(req._id, "approve")}
                  >
                    {actionLoading === req._id + "approve" ? "Approving..." : "Approve"}
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-60"
                    disabled={actionLoading === req._id + "reject"}
                    onClick={() => handleAction(req._id, "reject")}
                  >
                    {actionLoading === req._id + "reject" ? "Rejecting..." : "Reject"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function VerifyCertificatesAdmin() {
  const [tab, setTab] = useState("single");
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Verify Certificates</h2>
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${tab === "single" ? "bg-blue-600 text-white" : "bg-gray-200 text-blue-700"}`}
          onClick={() => setTab("single")}
        >
          Single
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${tab === "bulk" ? "bg-blue-600 text-white" : "bg-gray-200 text-blue-700"}`}
          onClick={() => setTab("bulk")}
        >
          Bulk
        </button>
      </div>
      {tab === "single" ? <PendingCertificates /> : <PendingIssuanceQueue />}
    </div>
  );
} 