# QR System - Setup Verification Checklist

## 📋 Pre-Flight Checklist

Before deploying, verify everything is correctly set up using this checklist.

---

## Phase 1: File Installation ✅

### Frontend Files
- [ ] `frontend/src/api/qrApi.js` - exists
- [ ] `frontend/src/components/EventSelector.jsx` - exists
- [ ] `frontend/src/components/QRDisplay.jsx` - exists
- [ ] `frontend/src/components/EventList.jsx` - exists
- [ ] `frontend/src/pages/QRPage.jsx` - exists
- [ ] `frontend/src/pages/AttendanceSelectionPage.jsx` - exists

### Documentation Files
- [ ] `frontend/src/pages/QR_QUICK_START.md` - exists
- [ ] `frontend/src/pages/QR_INTEGRATION_GUIDE.md` - exists
- [ ] `frontend/src/pages/QR_SYSTEM_README.md` - exists
- [ ] `frontend/src/pages/QR_ARCHITECTURE.md` - exists
- [ ] `frontend/src/pages/QR_DELIVERY_SUMMARY.md` - exists

### Backend Files
- [ ] `backend/QR_API_EXAMPLES.js` - exists (for reference)

---

## Phase 2: Dependencies ✅

### Check Installation
```bash
cd frontend
npm list axios react-router-dom lucide-react
```

- [ ] axios >= 1.6.2 - installed
- [ ] react-router-dom >= 6.20.0 - installed
- [ ] lucide-react >= 0.260.0 - installed
- [ ] react >= 18.0.0 - already in project
- [ ] react-dom >= 18.0.0 - already in project

### If Missing, Install:
```bash
npm install axios react-router-dom lucide-react
```

---

## Phase 3: Environment Configuration ✅

### Frontend .env
Check `frontend/.env` contains:
```
VITE_API_URL=http://localhost:3000/api
```

- [ ] .env file exists in frontend root
- [ ] VITE_API_URL is set correctly
- [ ] URL points to correct backend (localhost:3000 for dev, or production URL)

### Backend .env (for backend development)
Check `backend/.env` contains:
```
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost/planora
PORT=3000
```

- [ ] Backend .env has FRONTEND_URL pointing to frontend
- [ ] Database connection configured
- [ ] Backend running on port 3000 (or update VITE_API_URL accordingly)

---

## Phase 4: Router Configuration ✅

### Add Routes
In your `App.tsx` or main router file, add:

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

- [ ] Routes added to router
- [ ] /qr-manager route configured
- [ ] /attendance/:eventId route configured
- [ ] Authentication guard on /qr-manager (admin/organizer only)
- [ ] /attendance/:eventId is public (no auth required)

---

## Phase 5: API Endpoints ✅

### Required Endpoints (Backend must implement)

Using the examples in `backend/QR_API_EXAMPLES.js`:

- [ ] **GET /api/events** - Returns all main events
  - Response: `[{id, name, description, date, ...}]`
  - Status: 200 OK or error message

- [ ] **GET /api/subevents/:eventId** - Returns sub-events for event
  - Response: `[{id, eventId, name, qrEnabled, ...}]`
  - Status: 200 OK or error message
  - **CRITICAL**: Must include `qrEnabled` field

- [ ] **GET /api/qr?type=registration&eventId=X&subEventId=Y** - Registration QR
  - Response: `{qrImage: "data:image/png;...", url, filename}`
  - Status: 200 OK or error message

- [ ] **GET /api/qr?type=attendance&eventId=X** - Attendance QR
  - Response: `{qrImage: "data:image/png;...", url, filename}`
  - Status: 200 OK or error message

### Verification Steps:
```bash
# Test endpoints with curl
curl http://localhost:3000/api/events
curl http://localhost:3000/api/subevents/evt_1
curl "http://localhost:3000/api/qr?type=registration&eventId=evt_1&subEventId=sub_1"
curl "http://localhost:3000/api/qr?type=attendance&eventId=evt_1"
```

- [ ] All 4 endpoints respond with 200 OK
- [ ] Events endpoint returns array of events
- [ ] SubEvents endpoint returns array with qrEnabled field
- [ ] QR endpoints return base64 image data
- [ ] No CORS errors in browser console

---

## Phase 6: Test Event Data ✅

### Create Test Events in Database

```javascript
// Example test data structure
const testEvent = {
  id: "evt_test_1",
  name: "Test Event",
  description: "Testing QR system"
};

const testSubEvents = [
  {
    id: "sub_test_1",
    eventId: "evt_test_1",
    name: "Test Sub-Event 1",
    qrEnabled: true
  },
  {
    id: "sub_test_2",
    eventId: "evt_test_1",
    name: "Test Sub-Event 2",
    qrEnabled: true
  },
  {
    id: "sub_test_3",
    eventId: "evt_test_1",
    name: "Test Sub-Event 3 (Disabled)",
    qrEnabled: false
  }
];
```

- [ ] At least 1 main event exists in database
- [ ] At least 1 main event has 2+ sub-events
- [ ] At least 1 main event has mixed qrEnabled (some true, some false)
- [ ] Test data includes disabled events (qrEnabled: false)

---

## Phase 7: Frontend Startup ✅

### Development Server
```bash
cd frontend
npm run dev
```

- [ ] Frontend starts without errors
- [ ] No console errors on load
- [ ] Vite dev server running on http://localhost:5173
- [ ] Hot reload working

### Browser Check
- [ ] Open http://localhost:5173 in browser
- [ ] No red error overlay in dev mode
- [ ] Check browser console (F12 → Console tab)
- [ ] No import errors
- [ ] No dependency warnings

---

## Phase 8: Backend Startup ✅

### Backend Server
```bash
cd backend
npm start
# OR
node server.js
```

- [ ] Backend starts without errors
- [ ] Listening on port 3000 (or configured port)
- [ ] Database connection successful
- [ ] No console errors
- [ ] CORS headers configured (if needed)

### Network Check
- [ ] Backend accessible at http://localhost:3000
- [ ] API endpoints responding
- [ ] Check backend console for requests from frontend

---

## Phase 9: QR Manager Access ✅

### Navigate to QR Manager
1. Open browser: http://localhost:5173
2. Navigate to: http://localhost:5173/qr-manager
3. (If auth required, login as admin/organizer first)

### Verify Page Loads:
- [ ] Page loads without errors
- [ ] Page title shows "QR Code Manager"
- [ ] Page shows header and content
- [ ] No blank screen or infinite loader
- [ ] Browser console has no errors

### Check Network Requests:
- [ ] Open DevTools (F12 → Network tab)
- [ ] Look for GET requests to /api/events
- [ ] Request should return 200 OK
- [ ] Response should be JSON array

---

## Phase 10: Event Selection ✅

### Test Event Dropdown:
1. Look for "Select Event" dropdown
2. Click dropdown
3. Should show list of events

- [ ] Dropdown loads (not stuck in loading state)
- [ ] Events from API appear in dropdown
- [ ] No loading spinner after 2 seconds
- [ ] Can click and select an event
- [ ] Selected event info shows below

### Check Network Requests:
- [ ] GET /api/events returned data
- [ ] Network tab shows request success

---

## Phase 11: Sub-Events Loading ✅

### After Selecting Event:
1. Event should be selected
2. Page should auto-fetch sub-events
3. Sub-events list should appear below

- [ ] Sub-events load automatically after event select
- [ ] Sub-events appear in "Sub-Events Status" section
- [ ] Can see enabled (✓) and disabled (✗) events
- [ ] Color coding visible (green/gray)
- [ ] Mode indicator shows (Direct/Selection/None)

### Check Network Requests:
- [ ] GET /api/subevents/:eventId request made
- [ ] Request returns 200 OK
- [ ] Response includes qrEnabled field for each sub-event

---

## Phase 12: Registration QR Generation ✅

### For Single Event:
1. Select event from dropdown
2. If only 1 enabled sub-event, it auto-selects
3. Click "Generate Registration QR"
4. Wait for QR to load

### For Multiple Events:
1. Select event with multiple enabled sub-events
2. Choose sub-event from "Select Sub-Event" dropdown
3. Click "Generate Registration QR"
4. Wait for QR to load

- [ ] QR generation button clickable
- [ ] Loading spinner appears (briefly)
- [ ] QR image displays (not blank/broken)
- [ ] QR image is visible and clear
- [ ] URL preview shows: /register/:eventId/:subEventId
- [ ] Download button appears and is clickable

### Check Network Requests:
- [ ] GET /api/qr?type=registration&... request made
- [ ] Request returns 200 OK
- [ ] Response includes qrImage (base64 PNG data)

---

## Phase 13: Attendance QR Generation ✅

### Generate Attendance QR:
1. Event still selected from previous step
2. Click "Generate Attendance QR" button
3. Wait for QR to load

- [ ] Attendance QR generation button clickable
- [ ] Loading spinner appears (briefly)
- [ ] QR image displays (different from registration)
- [ ] URL preview shows: /attendance/:eventId
- [ ] Download button appears and is clickable

### Check Smart Logic Indicator:
- [ ] Shows appropriate mode (Direct/Selection/None)
- [ ] If 1 enabled event: shows "Direct Attendance Mode"
- [ ] If >1 enabled events: shows "Selection Mode"

### Check Network Requests:
- [ ] GET /api/qr?type=attendance&eventId=... request made
- [ ] Request returns 200 OK
- [ ] Response includes qrImage data

---

## Phase 14: QR Download ✅

### Test Registration QR Download:
1. Click "Download QR Code" button in Registration section
2. Browser download should trigger
3. File should be named: registration_evt_X_sub_Y.png

- [ ] Download dialog appears
- [ ] File downloads successfully
- [ ] File is PNG image
- [ ] File size > 0 bytes
- [ ] File can be opened in image viewer

### Test Attendance QR Download:
1. Click "Download QR Code" button in Attendance section
2. Browser download should trigger
3. File should be named: attendance_evt_X.png

- [ ] Download dialog appears
- [ ] File downloads successfully
- [ ] File is PNG image
- [ ] File size > 0 bytes

---

## Phase 15: Sub-Events List Display ✅

### Verify Events List Section:
1. Scroll to "Sub-Events Status" section
2. Should show all sub-events

- [ ] All sub-events displayed
- [ ] Enabled events show green checkmark (✓)
- [ ] Disabled events show gray X (✗)
- [ ] Status badges show "Enabled" or "Disabled"
- [ ] Summary shows: "X of Y sub-events enabled"

### Verify Mode Indicator:
- [ ] Shows 🎯 for Direct Mode (1 enabled)
- [ ] Shows 🔄 for Selection Mode (>1 enabled)
- [ ] Shows ⚠️ for No Enabled Mode (0 enabled)

---

## Phase 16: Attendance Selection Page ✅

### Test Attendance QR Scan Flow:
1. Copy the Attendance QR URL: /attendance/:eventId
2. Navigate to that URL directly in browser
3. Attendance selection page should appear

### If 1 Event Enabled:
- [ ] Auto-redirect to attendance marking page
- [ ] OR show loading then redirect
- [ ] Should NOT show selection UI

### If >1 Events Enabled:
- [ ] Shows event selection UI
- [ ] Each enabled sub-event appears as a button
- [ ] Button labels show event names
- [ ] Can click on button to proceed
- [ ] Disabled events NOT shown

### If 0 Events Enabled:
- [ ] Shows "No events available" message
- [ ] Shows "Go Home" button
- [ ] Does NOT show broken selection UI

---

## Phase 17: Error Handling ✅

### Test Missing Event:
1. Navigate to: /attendance/invalid_event_id
2. Should show error message

- [ ] Error message appears
- [ ] Error is user-friendly
- [ ] "Go Home" button provided
- [ ] No JavaScript errors in console

### Test API Failures (simulate):
1. Stop backend server
2. Try to generate QR
3. Should show error message

- [ ] Error message appears in QR section
- [ ] Not entire page broken
- [ ] Can retry after backend comes back online
- [ ] Loading state eventually clears

---

## Phase 18: UI/UX Checks ✅

### Layout Verification:
- [ ] Page responsive on mobile (< 768px width)
- [ ] Page responsive on tablet (768px - 1024px)
- [ ] Page responsive on desktop (> 1024px)
- [ ] QR sections stack on mobile
- [ ] QR sections side-by-side on desktop (2 columns)

### Visual Verification:
- [ ] Colors are correct (blue, green, gray)
- [ ] Icons from lucide-react display correctly
- [ ] Buttons have hover effects
- [ ] Loading spinners animate smoothly
- [ ] Text is readable (no overlapping)
- [ ] Spacing and padding look good
- [ ] No broken images or icons

### Accessibility:
- [ ] Can navigate with Tab key
- [ ] Form inputs are focusable
- [ ] Buttons have proper text labels
- [ ] Error messages visible and clear
- [ ] No color-only information (icons + text)

---

## Phase 19: Performance Checks ✅

### Load Time:
- [ ] QR Manager loads in < 2 seconds
- [ ] Events dropdown populates in < 1 second
- [ ] Sub-events load in < 1 second
- [ ] QR generation in < 2 seconds

### Network:
- [ ] Minimal API calls (1 per action)
- [ ] No duplicate requests
- [ ] Requests complete successfully
- [ ] Response times reasonable

### Memory:
- [ ] No memory leaks (open DevTools → Memory)
- [ ] Heap size stable during usage
- [ ] No warnings in console

---

## Phase 20: Final Verification ✅

### Complete Workflow Test:
1. [ ] Open /qr-manager
2. [ ] Select event
3. [ ] See sub-events (mix of enabled/disabled)
4. [ ] Select sub-event
5. [ ] Generate registration QR
6. [ ] Download registration QR
7. [ ] Generate attendance QR
8. [ ] Download attendance QR
9. [ ] Navigate to /attendance/:eventId
10. [ ] See selection UI (if multiple) or auto-redirect (if single)

- [ ] All steps complete without errors
- [ ] QR codes generate successfully
- [ ] Downloads work properly
- [ ] Responsive on different screen sizes
- [ ] No console errors or warnings

---

## 🎯 Sign-Off Checklist

- [ ] All files present and correct
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Routes added to router
- [ ] API endpoints implemented (or examples understood)
- [ ] Test data exists in database
- [ ] Frontend server running
- [ ] Backend server running
- [ ] QR Manager page loads
- [ ] Events load in dropdown
- [ ] Sub-events load and display
- [ ] Registration QR generates
- [ ] Attendance QR generates
- [ ] QR codes download
- [ ] Sub-events list displays correctly
- [ ] Mode indicators work
- [ ] Attendance selection page works
- [ ] Error handling works
- [ ] UI looks good and responsive
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Complete workflow works end-to-end

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All development dependencies installed
- [ ] Production build created: `npm run build`
- [ ] Build completes without errors
- [ ] No warnings in build output
- [ ] API URLs updated for production
- [ ] Environment variables set on server
- [ ] HTTPS enabled for API calls
- [ ] CORS configured for production domain
- [ ] Database backups in place
- [ ] Rate limiting configured
- [ ] Authentication properly enforced
- [ ] Role-based access control tested
- [ ] QR code generation rate limited
- [ ] Security headers set
- [ ] All endpoints secured

---

## 🐛 Troubleshooting Reference

| Issue | Solution |
|-------|----------|
| Events not loading | Check `/api/events` endpoint returns data |
| Sub-events not loading | Verify `/api/subevents/:eventId` endpoint |
| QR not generating | Check `/api/qr` endpoint and qrImage response |
| CORS errors | Configure CORS headers in backend |
| Blank QR image | Verify base64 data is valid PNG |
| Styling broken | Ensure Tailwind CSS is installed and working |
| Icons not showing | Check lucide-react is installed |
| Routes not working | Verify routes added to router correctly |
| Auth not working | Check if route has authentication guard |
| API timeout | Check backend is running and accessible |

---

## 📞 Support

If any checks fail:
1. Review error message in browser console
2. Check network tab for API responses
3. Review relevant documentation file
4. Check backend implementation examples
5. Verify data structure matches expected format

---

**Version**: 1.0.0
**Last Updated**: April 2024
**Status**: Ready for Verification

All checks passing? You're ready to go! 🎉
