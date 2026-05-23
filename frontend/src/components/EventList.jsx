import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const EventList = ({ events, enabledEvents, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Sub-Events Status</h3>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading sub-events...</span>
        </div>
      ) : events.length === 0 ? (
        <p className="text-gray-500 py-4">No sub-events available for this event</p>
      ) : (
        <div className="space-y-3">
          {/* Mode indicator */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            {enabledEvents.length === 1 ? (
              <p className="text-sm font-medium text-blue-800">
                🎯 Direct Attendance Mode: 1 event enabled for QR scanning
              </p>
            ) : enabledEvents.length > 1 ? (
              <p className="text-sm font-medium text-blue-800">
                🔄 Selection Mode: {enabledEvents.length} events available for selection
              </p>
            ) : (
              <p className="text-sm font-medium text-amber-800">
                ⚠️ No enabled events: All sub-events are disabled for QR access
              </p>
            )}
          </div>

          {/* Events list */}
          <div className="space-y-2">
            {events.map((event) => {
              const isEnabled = enabledEvents.some(e => e.id === event.id);
              return (
                <div
                  key={event.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    isEnabled
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {isEnabled ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <XCircle className="text-gray-400" size={20} />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      isEnabled ? 'text-green-900' : 'text-gray-600'
                    }`}>
                      {event.name}
                    </p>
                    {event.description && (
                      <p className="text-xs text-gray-500">{event.description}</p>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    isEnabled
                      ? 'bg-green-200 text-green-800'
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>{enabledEvents.length}</strong> of <strong>{events.length}</strong> sub-events enabled for QR scanning
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;
