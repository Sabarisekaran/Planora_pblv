import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import qrApi from '../api/qrApi';
import { ArrowRight } from 'lucide-react';

/**
 * AttendanceSelectionPage
 * 
 * This page appears when an attendance QR code is scanned and there are multiple enabled events.
 * Users can select which event they want to mark attendance for.
 * 
 * Route: /attendance/:eventId
 * Behavior:
 * - Fetch all sub-events for eventId
 * - Filter only qrEnabled = true
 * - If 1 event: auto-redirect to attendance marking page
 * - If >1 events: show selection UI
 */

const AttendanceSelectionPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [subEvents, setSubEvents] = useState([]);
  const [enabledEvents, setEnabledEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch main event details
        const events = await qrApi.getEvents();
        const mainEvent = events.find(e => e.id === eventId);
        setEvent(mainEvent);

        if (!mainEvent) {
          setError('Event not found');
          return;
        }

        // Fetch all sub-events
        const subs = await qrApi.getSubEvents(eventId);
        setSubEvents(subs || []);

        // Filter enabled events
        const enabled = (subs || []).filter(e => e.qrEnabled === true);
        setEnabledEvents(enabled);

        // Smart logic: If only one enabled event, auto-redirect
        if (enabled.length === 1) {
          navigate(`/attendance-marking/${eventId}/${enabled[0].id}`);
        }
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Failed to load event details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, navigate]);

  const handleSelectEvent = (subEvent) => {
    // Navigate to the actual attendance marking page
    navigate(`/attendance-marking/${eventId}/${subEvent.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (enabledEvents.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-amber-600 mb-2">No Events Available</h1>
          <p className="text-gray-600 mb-6">There are no enabled events for attendance marking at this time.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {event?.name}
          </h1>
          <p className="text-lg text-gray-600">Select an event to mark your attendance</p>
        </div>

        {/* Selection Cards */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Available Events</h2>
          
          <div className="space-y-3">
            {enabledEvents.map((subEvent) => (
              <button
                key={subEvent.id}
                onClick={() => handleSelectEvent(subEvent)}
                className="w-full p-4 text-left bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 rounded-lg transition-all hover:shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                      {subEvent.name}
                    </h3>
                    {subEvent.description && (
                      <p className="text-sm text-gray-600 mt-1">{subEvent.description}</p>
                    )}
                    {subEvent.date && (
                      <p className="text-xs text-gray-500 mt-2">
                        📅 {new Date(subEvent.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="text-blue-500 group-hover:translate-x-1 transition-transform" size={24} />
                </div>
              </button>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Showing {enabledEvents.length} available event{enabledEvents.length !== 1 ? 's' : ''} for attendance marking.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSelectionPage;
