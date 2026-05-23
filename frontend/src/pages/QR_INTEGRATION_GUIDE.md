# QR Page Integration Guide

## Overview

The QR Page is a comprehensive system for managing QR codes in the Planora event management system. It supports:

- **Single Events**: Simple event QR codes
- **Events with Sub-events**: Multiple registration paths
- **Multiple Main Events**: Complex hierarchical structures
- **Smart Attendance QR**: Automatic selection or manual choice

---

## Features

### 1. **Smart Event Filtering**
- Only displays events where `qrEnabled = true`
- Disabled events are completely hidden from the UI
- Real-time status display of enabled vs disabled events

### 2. **Registration QR**
- URL Format: `/register/:eventId/:subEventId`
- Shows all enabled sub-events for selection
- One QR code per sub-event
- Download capability

### 3. **Attendance QR**
- URL Format: `/attendance/:eventId`
- **Direct Mode**: If 1 enabled sub-event → auto-redirect to attendance page
- **Selection Mode**: If >1 enabled sub-events → show selection UI
- One QR code per main event

### 4. **Mode Indicators**
- **🎯 Direct Attendance Mode**: Shown when only 1 sub-event is enabled
- **🔄 Selection Mode**: Shown when multiple sub-events are enabled
- **⚠️ No Enabled Events**: Shown when all sub-events are disabled

---

## File Structure

```
frontend/src/
├── api/
│   └── qrApi.js                    # API integration with Axios
├── components/
│   ├── EventSelector.jsx           # Event dropdown selector
│   ├── QRDisplay.jsx               # QR code display & download
│   └── EventList.jsx               # Sub-events status list
└── pages/
    ├── QRPage.jsx                  # Main QR management page
    └── AttendanceSelectionPage.jsx # Multi-event selection UI
```

---

## Routes Configuration

Add these routes to your `App.tsx` or router configuration:

```jsx
import QRPage from './pages/QRPage';
import AttendanceSelectionPage from './pages/AttendanceSelectionPage';

const routes = [
  // QR Management (Admin/Organizer)
  {
    path: '/qr-manager',
    element: <QRPage />,
    requireAuth: true,
    roles: ['admin', 'organizer']
  },

  // Attendance Selection (Public - scanned from QR)
  {
    path: '/attendance/:eventId',
    element: <AttendanceSelectionPage />,
    requireAuth: false // Can be accessed without login
  },

  // Registration Page (Public - scanned from QR)
  {
    path: '/register/:eventId/:subEventId',
    element: <RegistrationPage />, // Create this component
    requireAuth: false
  },

  // Attendance Marking (Protected - after selection)
  {
    path: '/attendance-marking/:eventId/:subEventId',
    element: <AttendanceMarkingPage />, // Create this component
    requireAuth: true,
    roles: ['coordinator', 'admin']
  }
];
```

---

## API Endpoints Required

The backend must provide these endpoints:

### 1. **GET /api/events**
Returns all main events.

**Response:**
```json
[
  {
    "id": "evt_1",
    "name": "TechFest 2024",
    "description": "Annual tech festival",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  ...
]
```

---

### 2. **GET /api/subevents/:eventId**
Returns all sub-events for a main event, **including disabled ones** for admin view.

**Response:**
```json
[
  {
    "id": "sub_1",
    "name": "Hackathon",
    "description": "24-hour coding challenge",
    "qrEnabled": true,
    "date": "2024-03-15T09:00:00Z"
  },
  {
    "id": "sub_2",
    "name": "Workshop",
    "description": "Advanced topics",
    "qrEnabled": false,
    "date": "2024-03-15T14:00:00Z"
  }
]
```

**Important**: The `qrEnabled` field controls whether the event appears in registration QR and attendance selection.

---

### 3. **GET /api/qr?type=registration&eventId=X&subEventId=Y**
Generates a registration QR code.

**Response:**
```json
{
  "qrImage": "data:image/png;base64,...",
  "url": "https://planora.app/register/evt_1/sub_1",
  "filename": "registration_hackathon.png",
  "type": "registration",
  "eventId": "evt_1",
  "subEventId": "sub_1"
}
```

---

### 4. **GET /api/qr?type=attendance&eventId=X**
Generates an attendance QR code.

**Response:**
```json
{
  "qrImage": "data:image/png;base64,...",
  "url": "https://planora.app/attendance/evt_1",
  "filename": "attendance_techfest.png",
  "type": "attendance",
  "eventId": "evt_1"
}
```

---

## Event Structure Examples

### Example 1: Single Event (No Sub-events)

```
TechFest
├── qrEnabled: true
└── No sub-events
```

**Behavior:**
- Shows as single event in dropdown
- Registration QR points to: `/register/evt_techfest/evt_techfest`
- Attendance QR: `/attendance/evt_techfest`
- **Direct Mode**: 1 event enabled

---

### Example 2: Event with Multiple Sub-events

```
TechFest
├── Hackathon (qrEnabled: true)
├── Paper Presentation (qrEnabled: true)
└── Auction (qrEnabled: false)
```

**Behavior:**
- Dropdown shows "TechFest"
- Sub-events list shows: 2 enabled, 1 disabled
- Registration QR for: Hackathon, Paper Presentation (not Auction)
- Attendance QR: `/attendance/evt_techfest` → shows 2-event selection
- **Selection Mode**: Multiple events enabled

---

### Example 3: Hierarchical Events

```
Rhythm (Main Category)
├── Technical
│   ├── Hackathon (qrEnabled: true)
│   └── Codex (qrEnabled: true)
└── Non-Technical
    ├── Gaming (qrEnabled: false)
    └── Auction (qrEnabled: true)
```

**Behavior:**
- Dropdown shows "Rhythm"
- Fetch sub-events returns flattened list: [Hackathon, Codex, Gaming, Auction]
- Filter enabled: [Hackathon, Codex, Auction]
- Show all enabled events in registration & attendance selection
- **Selection Mode**: 3 events available

---

## Usage Instructions

### For Organizers/Admins:

1. **Access QR Manager**
   - Navigate to `/qr-manager`
   
2. **Select Event**
   - Choose event from dropdown
   - Sub-events automatically load
   
3. **View Status**
   - See which sub-events are enabled/disabled
   - See mode indicator (Direct or Selection)

4. **Generate Registration QR**
   - Select sub-event (optional if single)
   - Click "Generate Registration QR"
   - Download the QR code

5. **Generate Attendance QR**
   - Click "Generate Attendance QR"
   - Download the QR code
   - QR will handle selection automatically if needed

---

### For Participants (QR Scanning):

#### Registration QR Scan:
1. Scan QR code
2. Opens: `/register/:eventId/:subEventId`
3. Fill registration form
4. Submit

#### Attendance QR Scan:
1. Scan QR code
2. Opens: `/attendance/:eventId`
3. **If 1 enabled event**: Auto-redirect to attendance marking
4. **If >1 enabled events**: Show selection UI
5. Select event → Mark attendance

---

## State Management Flow

```
1. Component Mount
   └─ Fetch all events

2. Select Event
   ├─ Clear previous selections
   ├─ Fetch sub-events for event
   ├─ Filter enabled events
   └─ Check smart logic:
      ├─ If 1 enabled → Auto-generate attendance QR
      └─ If >1 enabled → Show selection dropdown

3. Generate Registration QR
   ├─ Use selectedEvent.id
   ├─ Use selectedSubEvent.id
   └─ Call API

4. Generate Attendance QR
   ├─ Use selectedEvent.id (only)
   ├─ No sub-event needed
   └─ Call API

5. Download QR
   └─ Trigger browser download
```

---

## Key Logic Points

### Filtering Enabled Events

```javascript
const enabledEvents = subEvents.filter(e => e.qrEnabled === true);
```

**Important**: This happens after fetching. Disabled events are fetched but not shown.

---

### Smart Attendance Redirect

```javascript
if (enabledEvents.length === 1) {
  // Direct mode: auto-redirect
  navigate(`/attendance-marking/${eventId}/${enabledEvents[0].id}`);
} else if (enabledEvents.length > 1) {
  // Selection mode: show UI
  return <SelectionButtons events={enabledEvents} />;
}
```

---

## UI Components Breakdown

### EventSelector.jsx
- Dropdown for main events
- Shows selected event details
- Loading state handling

### QRDisplay.jsx
- QR code image display
- URL preview
- Download button
- Error handling
- Loading states

### EventList.jsx
- Shows all sub-events
- Color-coded enabled/disabled
- Mode indicator badge
- Summary statistics

### QRPage.jsx
- Orchestrates all logic
- Manages state
- Handles API calls
- Renders layout

### AttendanceSelectionPage.jsx
- Smart redirect logic
- Multi-event selection UI
- Responsive card layout
- Event details display

---

## Styling

All components use **Tailwind CSS** with:
- Responsive design
- Color-coded statuses (green=enabled, gray=disabled)
- Loading states with spinners
- Error boundaries
- Accessibility considerations

---

## Error Handling

- API failures show error messages
- Invalid event selections show warnings
- Network errors are caught and displayed
- Graceful fallbacks for missing data

---

## Environment Variables

Add to `.env`:
```
VITE_API_URL=http://localhost:3000/api
```

This is used in `qrApi.js` to construct API endpoints.

---

## Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.2",
  "lucide-react": "^0.263.0"  // Icons
}
```

---

## Next Steps

1. **Create Registration Page** (`pages/RegistrationPage.jsx`)
2. **Create Attendance Marking Page** (`pages/AttendanceMarkingPage.jsx`)
3. **Setup Backend API Endpoints**
4. **Add Role-based Access Control**
5. **Implement QR Download/Print Features**
6. **Add Email with QR Codes**

---

## Troubleshooting

### QR codes not generating?
- Check API endpoints are correct
- Verify event IDs are valid
- Check browser console for errors

### Events not loading?
- Verify `/api/events` endpoint
- Check CORS configuration
- Verify authentication headers if needed

### Selection UI not appearing?
- Check `qrEnabled` field in sub-events
- Verify > 1 sub-event is enabled
- Check browser console for errors

---

## Support

For questions or issues, refer to the API documentation or contact the development team.
