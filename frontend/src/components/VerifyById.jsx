import { useState, useEffect } from "react";
import api from "../lib/axios";
import { Search, XCircle, CheckCircle } from "lucide-react";


const VerifyById = () => {
  const [certId, setCertId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [messageIndex, setMessageIndex] = useState(0);

  const loadingMessages = [
    "Verifying your certificate on the blockchain...",
    "Securing your credentials...",
    "Almost there! Fetching your certificate...",
    "Hang tight, magic is happening!"
  ];

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.get(`/public/verify/${certId}`);
      if (res.data && res.data.valid) {
        setResult(res.data);
      } else {
        setError(res.data?.message || "Certificate not found or not valid.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Search className="text-blue-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Verify by Certificate ID</h2>
      </div>
      <p className="text-gray-500 mb-6">
        Enter the unique certificate ID to check its validity.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg w-full"
          placeholder="Enter Certificate ID"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 font-semibold text-lg shadow-md hover:shadow-lg transition-all w-full flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="animate-pulse text-center w-full">{loadingMessages[messageIndex]}</span>
          ) : (
            "Verify"
          )}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3">
          <XCircle />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {result && (
        <div className={`mt-6 p-4 rounded-lg flex flex-col gap-2 ${result.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <div className="flex items-center gap-2 mb-2">
            {result.valid ? <CheckCircle /> : <XCircle />}
            <span className="font-bold text-lg">
              {(result.dbVerification && result.blockchainVerification?.valid)
                ? 'Certificate is valid.'
                : 'Certificate is invalid or has been tampered with.'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div><span className="font-semibold">Recipient:</span> {result.cert.recipientName}</div>
            <div><span className="font-semibold">Course:</span> {result.cert.courseName}</div>
            <div><span className="font-semibold">Issued Date:</span> {result.cert.issuedDate ? new Date(result.cert.issuedDate).toLocaleDateString() : 'N/A'}</div>
            <div><span className="font-semibold">Company:</span> {result.cert.companyName}</div>
            <div className="col-span-2"><span className="font-semibold">Certificate ID:</span> {result.cert.certId}</div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <span className="font-semibold">DB Verification:</span> {result.dbVerification ? <span className="text-green-700 font-bold">Passed</span> : <span className="text-red-700 font-bold">Failed</span>}
            </div>
            <div>
              <span className="font-semibold">Blockchain Verification:</span> {result.blockchainVerification?.valid ? <span className="text-green-700 font-bold">Passed</span> : <span className="text-red-700 font-bold">Failed</span>}
            </div>
          </div>
          {result.cert.txHash && (
            <div className="mt-2">
              <span className="font-semibold">Blockchain Tx:</span>               <a href={`https://gnosis-chiado.blockscout.com/tx/${result.cert.txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline break-all">{result.cert.txHash}</a>

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyById;
