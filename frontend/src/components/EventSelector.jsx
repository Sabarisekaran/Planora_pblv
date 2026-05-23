import React from 'react';

const EventSelector = ({ events, selectedEvent, onSelectEvent, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Event</h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading events...</span>
        </div>
      ) : events.length === 0 ? (
        <p className="text-gray-500 py-4">No events available</p>
      ) : (
        <div className="relative">
          <select
            value={selectedEvent?.id || ''}
            onChange={(e) => {
              const event = events.find(ev => ev.id === e.target.value);
              onSelectEvent(event);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
          >
            <option value="">Choose an event...</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
          
          {selectedEvent && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">
                <strong>Selected:</strong> {selectedEvent.name}
              </p>
              {selectedEvent.description && (
                <p className="text-sm text-gray-500 mt-2">{selectedEvent.description}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventSelector;
