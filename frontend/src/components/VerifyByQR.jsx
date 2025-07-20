import { useState, useRef, useEffect } from 'react';
import api from '../lib/axios';
import { CheckCircle, XCircle, Image as ImageIcon, UploadCloud, FileText, QrCode } from 'lucide-react';

const VerifyQr = () => {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef();
  const loadingMessages = [
    "Scanning QR code...",
    "Reading certificate data...",
    "Verifying on the blockchain...",
    "Almost done! Securing your credentials..."
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!(scanning || loading)) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [scanning, loading]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setResult(null);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!image) return setError("Please select an image.");

    try {
      setScanning(true);
      const formData = new FormData();
      formData.append("qrImage", image);

      const { data: scanData } = await api.post('/certificates/scan-qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!scanData.success) throw new Error(scanData.message);
      
      // Extract certificate ID from the QR URL
      const certId = scanData.qrData.split('/').pop();

      if (!certId) throw new Error("Invalid QR code format.");

      setLoading(true);
      const { data: verifyData } = await api.get(`/certificates/public/verify/${certId}`);
      setResult(verifyData);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setScanning(false);
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <ImageIcon className="text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Verify by QR Image</h2>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-3">
          Upload an image containing a QR code to verify certificate authenticity.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <QrCode className="text-blue-600 mt-1 flex-shrink-0" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Supported formats:</p>
              <ul className="space-y-1">
                <li>• <strong>QR Code images</strong> - Standalone QR codes</li>
                <li>• <strong>Certificate images</strong> - Certificates with embedded QR codes</li>
                <li>• <strong>File types:</strong> JPG, PNG, JPEG</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleScan} className="flex flex-col gap-4">
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileRef}
            className="block w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          
          {imagePreview && (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-full h-48 object-contain border rounded-lg"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
              >
                <XCircle size={16} />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={scanning || loading || !image}
          className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 font-semibold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {scanning || loading ? (
            <span className="animate-pulse text-center w-full">{loadingMessages[messageIndex]}</span>
          ) : (
            <>
              <FileText size={20} />
              Verify Certificate
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3">
          <XCircle />
          <div className="flex-1">
            <span className="font-medium">{error}</span>
            {error.includes('No QR code found') && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-2">Suggestions to improve QR code detection:</p>
                <ul className="text-sm space-y-1">
                  <li>• Make sure the QR code is clearly visible in the image</li>
                  <li>• Try taking a photo in better lighting</li>
                  <li>• Ensure the QR code is not blurry or distorted</li>
                  <li>• For certificate images, make sure the QR code area is well-lit</li>
                </ul>
              </div>
            )}
          </div>
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

export default VerifyQr;
