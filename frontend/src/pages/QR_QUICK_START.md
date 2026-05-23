# QR Page System - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd frontend
npm install axios react-router-dom lucide-react
```

### Step 2: Add Environment Variable
Create/update `frontend/.env`:
```
VITE_API_URL=http://localhost:3000/api
```

### Step 3: Add Routes
In your `App.tsx` or router file:
```jsx
import QRPage from './pages/QRPage';
import AttendanceSelectionPage from './pages/AttendanceSelectionPage';

const routes = [
  {
    path: '/qr-manager',
    element: <QRPage />,
    requireAuth: true
  },
  {
    path: '/attendance/:eventId',
    element: <AttendanceSelectionPage />,
    requireAuth: false
  }
];
```

### Step 4: Done! ✅
Visit `http://localhost:5173/qr-manager` to test.

---

## 📁 Files Location

All files created in your project:

```
frontend/
├── src/
│   ├── api/
│   │   └── qrApi.js                    ✅ New
│   ├── components/
│   │   ├── EventSelector.jsx           ✅ New
│   │   ├── QRDisplay.jsx               ✅ New
│   │   └── EventList.jsx               ✅ New
│   └── pages/
│       ├── QRPage.jsx                  ✅ New
│       ├── AttendanceSelectionPage.jsx ✅ New
│       ├── QR_INTEGRATION_GUIDE.md     ✅ New
│       └── QR_SYSTEM_README.md         ✅ New
└── .env                                 (Update)

backend/
└── QR_API_EXAMPLES.js                  ✅ New
```

---

## 🎯 What Each Component Does

| Component | Purpose | Lines |
|-----------|---------|-------|
| **QRPage.jsx** | Main dashboard - event selection & QR generation | 450+ |
| **AttendanceSelectionPage.jsx** | Smart selection UI when scanning attendance QR | 200+ |
| **EventSelector.jsx** | Dropdown to select events | 60 |
| **QRDisplay.jsx** | Shows QR code with download button | 90 |
| **EventList.jsx** | Shows which sub-events are enabled/disabled | 110 |
| **qrApi.js** | Axios API client for all endpoints | 60 |

---

## 🔑 Key Features

✅ **Smart Event Filtering**
- Only shows events where `qrEnabled = true`
- Disabled events completely hidden

✅ **Two QR Types**
- Registration: `/register/:eventId/:subEventId`
- Attendance: `/attendance/:eventId`

✅ **Smart Attendance Logic**
- 1 event enabled → Auto-redirect
- >1 events enabled → Show selection UI
- 0 events enabled → Show warning

✅ **Download QR Codes**
- One-click PNG download
- Properly formatted filename

✅ **Responsive Design**
- Mobile friendly
- Tailwind CSS styling
- Zero custom CSS needed

---

## 📊 How It Works

### Flow 1: Admin/Organizer
```
1. Open /qr-manager
2. Select event from dropdown
3. See which sub-events are enabled/disabled
4. Generate Registration QR (select sub-event first)
5. Generate Attendance QR (auto-handles selection)
6. Download both QRs
```

### Flow 2: Participant Scanning QR
```
Registration QR:
  ↓
/register/:eventId/:subEventId
  ↓
Registration form (you create this)

Attendance QR:
  ↓
/attendance/:eventId
  ↓
[SMART LOGIC]
  ↓
If 1 event enabled:
  → Auto-go to attendance marking
If >1 events enabled:
  → Show selection UI (AttendanceSelectionPage)
```

---

## 🔌 API Endpoints Needed

Your backend must provide these 4 endpoints:

```
GET /api/events
GET /api/subevents/:eventId
GET /api/qr?type=registration&eventId=X&subEventId=Y
GET /api/qr?type=attendance&eventId=X
```

See `backend/QR_API_EXAMPLES.js` for complete implementation.

---

## 📋 Testing Checklist

- [ ] Dependencies installed
- [ ] Environment variable set
- [ ] Routes added to router
- [ ] Can access `/qr-manager`
- [ ] Events dropdown loads
- [ ] Sub-events display
- [ ] Can generate registration QR
- [ ] Can generate attendance QR
- [ ] QR download works
- [ ] Attendance selection page works

---

## ❌ Troubleshooting

### "Cannot find qrApi"
→ Make sure `api/qrApi.js` is created in the right location

### "Events not loading"
→ Check API endpoints are running on `http://localhost:3000/api/events`

### "QR not generating"
→ Verify backend returns proper response with `qrImage` and `url` fields

### "Icons not showing"
→ Run `npm install lucide-react`

### "Styles look wrong"
→ Make sure Tailwind CSS is installed and configured

---

## 📚 Documentation Files

| File | Use |
|------|-----|
| **QR_SYSTEM_README.md** | Comprehensive system overview |
| **QR_INTEGRATION_GUIDE.md** | Detailed integration instructions |
| **QR_API_EXAMPLES.js** | Backend implementation examples |
| **This file** | Quick start guide |

---

## 🚀 Next Steps

1. **Implement Backend** using `QR_API_EXAMPLES.js`
2. **Create Registration Page** (`RegistrationPage.jsx`)
   - Route: `/register/:eventId/:subEventId`
3. **Create Attendance Marking Page** (`AttendanceMarkingPage.jsx`)
   - Route: `/attendance-marking/:eventId/:subEventId`
4. **Add Role Guards** to routes
5. **Test with Real Data**

---

## 💡 Example Event Structure

```json
{
  "id": "evt_techfest",
  "name": "TechFest 2024",
  "subEvents": [
    {
      "id": "sub_hackathon",
      "name": "Hackathon",
      "qrEnabled": true     ← Will be in QR system
    },
    {
      "id": "sub_presentation",
      "name": "Paper Presentation",
      "qrEnabled": true     ← Will be in QR system
    },
    {
      "id": "sub_auction",
      "name": "Auction",
      "qrEnabled": false    ← Hidden from QR system
    }
  ]
}
```

**Result**: Registration & Attendance QR will only show Hackathon and Paper Presentation.

---

## 🎨 Customization

### Change Colors
Open components and update Tailwind classes:
```jsx
// Change blue to green
className="px-4 py-2 bg-blue-500" 
// →
className="px-4 py-2 bg-green-500"
```

### Change Icons
Edit `QRDisplay.jsx` and `EventList.jsx`:
```jsx
// From lucide-react
import { Download, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

// Change to other icons
import { FileDown, Check, X, ChevronRight } from 'lucide-react';
```

### Change API URL
Update `frontend/.env`:
```
VITE_API_URL=https://api.planora.app
```

---

## 🔐 Security Notes

- Add authentication to `/qr-manager` route
- Restrict QR generation to admins/organizers
- Validate event ownership before generating QR
- Use HTTPS in production
- Sanitize user input from URLs

---

## 📊 State Variables Summary

```javascript
// Selected data
selectedEvent        // Main event user chose
selectedSubEvent     // Sub-event for registration QR
subEvents           // All sub-events
enabledEvents       // Filtered: qrEnabled = true

// Generated QRs
registrationQR      // {qrImage, url, filename}
attendanceQR        // {qrImage, url, filename}

// UI states
loadingEvents       // Fetching events
loadingSubEvents    // Fetching sub-events
loadingRegistrationQR
loadingAttendanceQR
registrationError
attendanceError
```

---

## 🎯 Smart Logic Summary

```javascript
// Filter enabled events
enabledEvents = subEvents.filter(e => e.qrEnabled === true)

// Determine mode
if (enabledEvents.length === 1) {
  mode = "Direct"        // Auto-redirect on attendance QR scan
} else if (enabledEvents.length > 1) {
  mode = "Selection"     // Show selection UI on attendance QR scan
} else {
  mode = "None"          // No enabled events
}

// Registration QR
Needs: eventId + subEventId
Points to: /register/eventId/subEventId

// Attendance QR
Needs: eventId only (no subEventId)
Points to: /attendance/eventId
Smart logic: Fetches enabled sub-events and handles selection
```

---

## ✨ Features at a Glance

```
Dashboard (/qr-manager)
├── Event selector
├── Sub-events status (enabled/disabled)
├── Registration QR section
│   ├── Sub-event selector
│   └── QR + Download
├── Attendance QR section
│   └── QR + Download
└── Summary stats

Attendance Scan (/attendance/:eventId)
├── Auto-fetch enabled sub-events
├── If 1 event: Auto-redirect to marking page
└── If >1 events: Show selection UI
    └── User picks event → Redirect to marking page
```

---

## 📞 Support

- Check `QR_INTEGRATION_GUIDE.md` for detailed setup
- See `QR_API_EXAMPLES.js` for backend code
- Review component files for implementation details
- Check browser console for error messages

---

## ✅ Completion Checklist

- [ ] All files created in correct locations
- [ ] Dependencies installed
- [ ] Environment variable configured
- [ ] Routes added
- [ ] API endpoints implemented (or in progress)
- [ ] System tested locally
- [ ] Ready for production deployment

---

**Status: Ready to Use** ✅

All frontend components are complete and production-ready. Backend API endpoints need implementation using examples provided.

**Time to Full Implementation: ~2-3 hours** ⏱️

Good luck! 🚀
