# QR Page System - Complete Implementation

## Quick Summary

A comprehensive QR code management system for the Planora event platform supporting:
- ✅ Single & multiple events
- ✅ Event hierarchies with sub-events
- ✅ Conditional QR visibility (based on `qrEnabled` flag)
- ✅ Smart attendance routing (direct or selection mode)
- ✅ Download & share QR codes

---

## 📁 Files Created

### Core Components
| File | Purpose |
|------|---------|
| `QRPage.jsx` | Main QR management dashboard |
| `AttendanceSelectionPage.jsx` | Multi-event selection UI for scans |
| `EventSelector.jsx` | Event dropdown selector |
| `QRDisplay.jsx` | QR code viewer & downloader |
| `EventList.jsx` | Sub-events status display |

### API Integration
| File | Purpose |
|------|---------|
| `api/qrApi.js` | Axios API client for all QR operations |

### Documentation
| File | Purpose |
|------|---------|
| `QR_INTEGRATION_GUIDE.md` | Complete integration & routing guide |

---

## 🚀 Installation & Setup

### 1. Dependencies Already Installed?
Check your `package.json` for:
```json
{
  "axios": "^1.6.2",
  "react-router-dom": "^6.20.0",
  "lucide-react": "^0.263.0"
}
```

If missing, install:
```bash
npm install axios react-router-dom lucide-react
```

### 2. Environment Variables
Add to `.env` in frontend:
```
VITE_API_URL=http://localhost:3000/api
```

### 3. Update Your Router
Add these routes to your routing configuration:

```jsx
import QRPage from './pages/QRPage';
import AttendanceSelectionPage from './pages/AttendanceSelectionPage';

const routes = [
  {
    path: '/qr-manager',
    element: <QRPage />,
    requireAuth: true,
    roles: ['admin', 'organizer']
  },
  {
    path: '/attendance/:eventId',
    element: <AttendanceSelectionPage />,
    requireAuth: false
  }
];
```

---

## 🎯 How It Works

### User Flow: Organizer

```
1. Visit /qr-manager
   ↓
2. Select event from dropdown
   ↓
3. View enabled/disabled sub-events
   ↓
4. Select sub-event → Generate Registration QR
   ↓
5. Generate Attendance QR (handles selection automatically)
   ↓
6. Download QRs
```

### User Flow: Participant (QR Scan)

```
Registration QR Scan:
  → /register/:eventId/:subEventId
  → Registration form
  → Submit

Attendance QR Scan:
  → /attendance/:eventId
  → Check enabled sub-events
  ↓
  If 1 enabled: Auto-redirect to marking
  If >1 enabled: Show selection UI
  ↓
  Mark attendance
```

---

## 💾 State Management

```javascript
// Main QRPage state
const [selectedEvent, setSelectedEvent]         // Currently selected main event
const [subEvents, setSubEvents]                 // All sub-events (enabled + disabled)
const [enabledEvents, setEnabledEvents]         // Only qrEnabled = true
const [selectedSubEvent, setSelectedSubEvent]   // For registration QR
const [registrationQR, setRegistrationQR]       // Generated registration QR
const [attendanceQR, setAttendanceQR]           // Generated attendance QR

// UI states
const [loadingEvents, setLoadingEvents]         // Events loading
const [loadingSubEvents, setLoadingSubEvents]   // Sub-events loading
const [loadingRegistrationQR, setLoadingRegistrationQR]
const [loadingAttendanceQR, setLoadingAttendanceQR]
const [registrationError, setRegistrationError]
const [attendanceError, setAttendanceError]
```

---

## 🔌 API Endpoints Required

Your backend must implement:

### 1. Get All Events
```
GET /api/events
Response: Array of events with id, name, description
```

### 2. Get Sub-events
```
GET /api/subevents/:eventId
Response: Array of sub-events with qrEnabled flag
```

### 3. Generate Registration QR
```
GET /api/qr?type=registration&eventId=X&subEventId=Y
Response: {qrImage, url, filename}
```

### 4. Generate Attendance QR
```
GET /api/qr?type=attendance&eventId=X
Response: {qrImage, url, filename}
```

---

## 🎨 Component Architecture

### QRPage (Main Container)
```
├── EventSelector (Event dropdown)
├── Registration QR Section
│   ├── Sub-event selector
│   └── QRDisplay component
├── Attendance QR Section
│   ├── Generate button
│   └── QRDisplay component
├── EventList (Status preview)
└── Info box
```

### QRDisplay (Reusable)
```
├── Loading spinner
├── Error message
├── QR Image
├── URL Preview
└── Download button
```

### EventList (Status Indicator)
```
├── Mode badge (Direct/Selection/None)
├── Event list with status
│   ├── Enabled (green)
│   └── Disabled (gray)
└── Summary stats
```

### AttendanceSelectionPage (Smart Route)
```
├── Auto-redirect logic (if 1 enabled)
├── Selection cards (if >1 enabled)
└── Error handling
```

---

## 🔐 Key Logic Rules

### Rule 1: Filter Enabled Events
```javascript
const enabledEvents = subEvents.filter(e => e.qrEnabled === true);
```
**Only events with qrEnabled=true are shown anywhere.**

### Rule 2: Smart Attendance Redirect
```javascript
if (enabledEvents.length === 1) {
  // Direct mode - auto navigate
  navigate(`/attendance-marking/${eventId}/${enabledEvents[0].id}`);
} else if (enabledEvents.length > 1) {
  // Selection mode - show UI
  // User picks which event
}
```

### Rule 3: Registration QR Needs Sub-event
```javascript
// Registration QR REQUIRES both:
const registrationQR = await generateRegistrationQR(
  selectedEvent.id,      // Main event
  selectedSubEvent.id    // Sub-event (required)
);
```

### Rule 4: Attendance QR Needs Only Event
```javascript
// Attendance QR needs only main event:
const attendanceQR = await generateAttendanceQR(
  selectedEvent.id       // No sub-event needed
);
```

---

## 🎁 Event Structure Examples

### Example 1: Single Event
```
Event: Hackathon
└── qrEnabled: true
```
**Result**: 1 enabled event = Direct attendance mode

### Example 2: Multiple Sub-events (Mixed Enabled)
```
Event: TechFest
├── Hackathon (qrEnabled: true)     ✅
├── Paper Presentation (qrEnabled: true)  ✅
└── Auction (qrEnabled: false)      ❌
```
**Result**: 2 enabled events = Selection mode (Auction hidden)

### Example 3: Hierarchical
```
Event: Rhythm
├── Technical
│   ├── Hackathon (qrEnabled: true)    ✅
│   └── Codex (qrEnabled: true)        ✅
└── Non-Technical
    ├── Gaming (qrEnabled: false)      ❌
    └── Auction (qrEnabled: true)      ✅
```
**Result**: 3 enabled events = Selection mode for all 3

---

## 📊 UI Features

### EventSelector Component
- **Dropdown**: Select from all events
- **Info Box**: Shows selected event details
- **Loading State**: Spinner while fetching

### QRDisplay Component
- **QR Image**: Large, centered display
- **URL Preview**: Shows where QR points to
- **Download Button**: Saves as PNG
- **Error Messages**: If generation fails
- **Loading State**: Spinner while generating

### EventList Component
- **Mode Indicator**: 
  - 🎯 Direct Attendance Mode (1 event)
  - 🔄 Selection Mode (>1 events)
  - ⚠️ No Enabled Events (0 events)
- **Status Icons**: ✓ for enabled, ✗ for disabled
- **Color Coding**: Green for enabled, gray for disabled
- **Summary**: X of Y events enabled

---

## ⚙️ Configuration

### Tailwind Classes Used
```
Background: bg-white, bg-gray-50, bg-blue-50, bg-green-50
Text: text-gray-800, text-blue-900, text-green-800
Borders: border-gray-200, border-blue-200, border-green-200
Buttons: hover:bg-blue-600, transition-colors
Icons: lucide-react (CheckCircle, XCircle, Download, ArrowRight)
```

### Responsive Design
- **Mobile**: Full width, stacked layout
- **Desktop**: 2-column grid for QR sections
- **Tablet**: Flexible grid

---

## 🔍 Debugging Tips

### QR codes not showing?
1. Check browser console for API errors
2. Verify event IDs are correct
3. Check `/api/qr` endpoint returns proper image data

### Selection mode not appearing?
1. Verify sub-events have `qrEnabled` field
2. Check at least 2 sub-events are enabled
3. Log `enabledEvents` array

### Events not loading?
1. Check `/api/events` endpoint works
2. Verify CORS headers
3. Check network tab in browser DevTools

### Download not working?
1. Verify QR image is proper base64 PNG
2. Check filename is valid
3. Check browser download settings

---

## 📦 Export Summary

### Components
```
✅ QRPage.jsx - Main page (1000+ lines)
✅ AttendanceSelectionPage.jsx - Selection UI (200+ lines)
✅ EventSelector.jsx - Dropdown component (60 lines)
✅ QRDisplay.jsx - QR viewer (90 lines)
✅ EventList.jsx - Status display (110 lines)
```

### API
```
✅ qrApi.js - Axios client (60 lines)
```

### Documentation
```
✅ QR_INTEGRATION_GUIDE.md - Full guide (500+ lines)
✅ QR_SYSTEM_README.md - This file
```

---

## 🚀 Next Steps

1. **Setup API endpoints** on backend
2. **Add routes** to your router
3. **Test with sample data** - create test events
4. **Create companion pages**:
   - `RegistrationPage.jsx`
   - `AttendanceMarkingPage.jsx`
5. **Add role-based guards** to routes
6. **Implement QR printing** feature
7. **Add email delivery** with QR codes

---

## 📝 Notes

- All components use **functional React** hooks
- **Axios** handles all API calls
- **Lucide React** provides icons
- **Tailwind CSS** for styling (no custom CSS needed)
- **React Router v6** for navigation
- **Smart logic** handles all event structures
- **No backend** code included (frontend only)

---

## ✨ Features Included

- ✅ Dynamic event selection
- ✅ Smart QR generation
- ✅ Conditional filtering (qrEnabled)
- ✅ Auto-redirect logic
- ✅ Multi-event selection UI
- ✅ QR download capability
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ Status indicators
- ✅ Mode detection
- ✅ API integration

---

## 🎯 Performance Optimizations

- Event list fetched once on mount
- Sub-events cached in state
- Lazy QR generation (on-demand)
- No unnecessary re-renders
- Proper dependency arrays in useEffect
- Error boundaries for failed API calls

---

## 📚 References

- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- [React Router](https://reactrouter.com/)
- [Lucide Icons](https://lucide.dev/)

---

## 📧 Support

If you have questions about implementation or integration, refer to:
1. `QR_INTEGRATION_GUIDE.md` for detailed setup
2. Component files for code examples
3. API documentation for endpoint specs

---

**Created for: Planora Event Management System**
**Version: 1.0.0**
**Last Updated: April 2024**
