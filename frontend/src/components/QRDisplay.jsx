import React from 'react';
import { Download } from 'lucide-react';

const QRDisplay = ({ title, qrData, loading, error, onDownload }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Generating QR code...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : qrData ? (
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-6">
            <img 
              src={qrData.qrImage} 
              alt="QR Code"
              className="w-64 h-64 object-contain"
            />
          </div>
          
          <p className="text-sm text-gray-600 mb-4 text-center max-w-sm">
            <strong>URL:</strong> {qrData.url}
          </p>
          
          <button
            onClick={() => onDownload(qrData.qrImage, qrData.filename)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            <Download size={20} />
            Download QR Code
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No QR code available. Select an event to generate.</p>
        </div>
      )}
    </div>
  );
};

export default QRDisplay;
