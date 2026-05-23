# QR System - Architecture & Data Flow

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PLANORA EVENT SYSTEM                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    FRONTEND (React + Vite)                  ││
│  │                                                               ││
│  │  ┌──────────────────────────────────────────────────────┐  ││
│  │  │              QR MANAGEMENT SYSTEM                    │  ││
│  │  │                                                       │  ││
│  │  │  ┌─────────────────────────────────────────────┐   │  ││
│  │  │  │ QRPage.jsx (Main Dashboard)                │   │  ││
│  │  │  │                                              │   │  ││
│  │  │  │ ✓ Event Selection                          │   │  ││
│  │  │  │ ✓ Sub-events Display                       │   │  ││
│  │  │  │ ✓ QR Generation Logic                      │   │  ││
│  │  │  │ ✓ State Management                         │   │  ││
│  │  │  │                                              │   │  ││
│  │  │  └─────────────────────────────────────────────┘   │  ││
│  │  │           │            │            │              │  ││
│  │  │      ┌────▼────┐  ┌────▼────┐  ┌──▼──────┐        │  ││
│  │  │      │ Event   │  │ QR      │  │ Event   │        │  ││
│  │  │      │Selector │  │Display  │  │ List    │        │  ││
│  │  │      └────┬────┘  └────┬────┘  └────┬────┘        │  ││
│  │  │           │            │            │              │  ││
│  │  │  Components: Handle UI Rendering     │              │  ││
│  │  │                                       │              │  ││
│  │  └───────────────────────────────────────┼──────────────┘  ││
│  │                                           │                 ││
│  │  ┌───────────────────────────────────────▼──────────────┐  ││
│  │  │           qrApi.js (Axios Client)                    │  ││
│  │  │                                                       │  ││
│  │  │  • getEvents()                                       │  ││
│  │  │  • getSubEvents(eventId)                             │  ││
│  │  │  • generateRegistrationQR(eventId, subEventId)      │  ││
│  │  │  • generateAttendanceQR(eventId)                     │  ││
│  │  │                                                       │  ││
│  │  └───────────────────┬──────────────────────────────────┘  ││
│  │                      │                                       ││
│  │  ┌──────────────────────────────────────────────────────┐  ││
│  │  │         AttendanceSelectionPage.jsx                 │  ││
│  │  │                                                       │  ││
│  │  │  Route: /attendance/:eventId                        │  ││
│  │  │                                                       │  ││
│  │  │  Smart Logic:                                       │  ││
│  │  │  - Fetch enabled sub-events                         │  ││
│  │  │  - If 1: Auto-redirect                             │  ││
│  │  │  - If >1: Show selection UI                        │  ││
│  │  │                                                       │  ││
│  │  └──────────────────────────────────────────────────────┘  ││
│  │                                                               ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                    API COMMUNICATION (HTTP)                  ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                  BACKEND (Express + Node.js)                 ││
│  │                                                               ││
│  │  ┌──────────────────────────────────────────────────────┐  ││
│  │  │  API Endpoints (REST)                               │  ││
│  │  │                                                       │  ││
│  │  │  GET /api/events                                    │  ││
│  │  │      └─> Returns: Array of main events              │  ││
│  │  │                                                       │  ││
│  │  │  GET /api/subevents/:eventId                        │  ││
│  │  │      └─> Returns: Array of sub-events               │  ││
│  │  │          (includes qrEnabled field)                 │  ││
│  │  │                                                       │  ││
│  │  │  GET /api/qr?type=registration&eventId=X&subEventId=Y │
│  │  │      └─> Returns: Base64 QR image                   │  ││
│  │  │                                                       │  ││
│  │  │  GET /api/qr?type=attendance&eventId=X              │  ││
│  │  │      └─> Returns: Base64 QR image                   │  ││
│  │  │                                                       │  ││
│  │  └──────────────┬───────────────────────────────────────┘  ││
│  │                 │                                            ││
│  │  ┌──────────────▼───────────────────────────────────────┐  ││
│  │  │  Database (MongoDB/PostgreSQL)                       │  ││
│  │  │                                                       │  ││
│  │  │  Events Collection:                                  │  ││
│  │  │  ├─ id, name, description, date, ...                │  ││
│  │  │                                                       │  ││
│  │  │  SubEvents Collection:                               │  ││
│  │  │  ├─ id, name, description, date, qrEnabled ★       │  ││
│  │  │  └─ ★ CRITICAL: Controls QR visibility              │  ││
│  │  │                                                       │  ││
│  │  └──────────────────────────────────────────────────────┘  ││
│  │                                                               ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Event Selection

```
User Opens /qr-manager
        │
        ▼
[QRPage Component Mounts]
        │
        ├──────────────────────────────┐
        │                              │
        ▼                              ▼
   useEffect()                   Fetch Events
        │                              │
        └──────────────────────────────┘
                      │
        ┌─────────────▼──────────────┐
        │ HTTP GET /api/events       │
        │        ↓                    │
        │ Backend queries DB         │
        │        ↓                    │
        │ Returns: Event[]           │
        └─────────────┬──────────────┘
                      │
                      ▼
        Set: events = [...]
                      │
                      ▼
        [User selects event from dropdown]
                      │
        ┌─────────────▼──────────────┐
        │ handleSelectEvent()         │
        │        │                    │
        │        ├─ Clear prev data   │
        │        ├─ Set selected      │
        │        └─ Fetch sub-events  │
        └─────────────┬──────────────┘
                      │
        ┌─────────────▼──────────────┐
        │ HTTP GET /api/subevents    │
        │        ↓                    │
        │ Backend queries DB         │
        │        ↓                    │
        │ Returns: SubEvent[]        │
        └─────────────┬──────────────┘
                      │
                      ▼
        Set: subEvents = [...]
                      │
                      ▼
        ┌─────────────────────────────┐
        │ Filter enabled events:      │
        │ enabledEvents = subEvents   │
        │   .filter(e=>e.qrEnabled)  │
        └────────────┬────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    Length=1?              Length>1?
         │                       │
         ▼                       ▼
    Direct Mode          Selection Mode
    (Auto-generate        (Show dropdown)
     Attendance QR)
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
            [UI Rendered]
```

---

## Data Flow: QR Generation

```
[User clicks "Generate Registration QR"]
        │
        ▼
[Validate selected sub-event]
        │
        ├─ Check selectedEvent exists ✓
        ├─ Check selectedSubEvent exists ✓
        └─ Check subEvent.qrEnabled = true ✓
        │
        ▼
┌──────────────────────────────────────┐
│ generateRegistrationQR()              │
│        │                              │
│        ├─ eventId = selectedEvent.id  │
│        ├─ subEventId = selectedSub.id │
│        └─ Call API                    │
└────────────┬─────────────────────────┘
             │
┌────────────▼──────────────────────────┐
│ HTTP GET /api/qr                      │
│  ?type=registration                   │
│  &eventId=evt_1                       │
│  &subEventId=sub_1                    │
└────────────┬──────────────────────────┘
             │
             ▼ (Backend)
┌────────────────────────────────────┐
│ Generate URL:                      │
│ /register/evt_1/sub_1              │
│        │                           │
│        ▼                           │
│ Generate QR Code:                  │
│ qrcode.toDataURL(url)              │
│        │                           │
│        ▼                           │
│ Return:                            │
│ {                                  │
│   qrImage: "data:image/png;..."   │
│   url: "/register/evt_1/sub_1"    │
│   filename: "reg_evt_1_sub_1.png" │
│ }                                  │
└────────────┬─────────────────────┘
             │
             ▼ (Frontend)
┌────────────────────────────────────┐
│ Set registrationQR = {qrImage...}  │
│        │                           │
│        ▼                           │
│ [QRDisplay] renders:               │
│  - Display QR image                │
│  - Show URL preview                │
│  - Show download button            │
│        │                           │
│        ▼                           │
│ [User clicks Download]             │
│        │                           │
│        ▼                           │
│ Browser download:                  │
│ reg_evt_1_sub_1.png                │
└────────────────────────────────────┘
```

---

## Event Structure Hierarchy

```
EVENT LEVEL 1: Main Events
├─ TechFest 2024 (id: evt_1)
│   ├─ qrEnabled: N/A (only sub-events have this)
│   │
│   EVENT LEVEL 2: Sub-Events
│   ├─ Hackathon (id: sub_1)
│   │   ├─ qrEnabled: true ✅ [Shows in QR]
│   │   ├─ registrationQR: /register/evt_1/sub_1
│   │   └─ attendanceQR: /attendance/evt_1 ★
│   │
│   ├─ Paper Presentation (id: sub_2)
│   │   ├─ qrEnabled: true ✅ [Shows in QR]
│   │   ├─ registrationQR: /register/evt_1/sub_2
│   │   └─ attendanceQR: /attendance/evt_1 ★
│   │
│   └─ Auction (id: sub_3)
│       ├─ qrEnabled: false ❌ [Hidden from QR]
│       └─ NOT available in any QR
│
├─ Rhythm 2024 (id: evt_2)
│   ├─ Technical (category)
│   │   ├─ Hackathon (id: sub_4)
│   │   │   ├─ qrEnabled: true ✅
│   │   │   └─ registrationQR: /register/evt_2/sub_4
│   │   │
│   │   └─ Codex (id: sub_5)
│   │       ├─ qrEnabled: true ✅
│   │       └─ registrationQR: /register/evt_2/sub_5
│   │
│   └─ Non-Technical (category)
│       ├─ Gaming (id: sub_6)
│       │   ├─ qrEnabled: false ❌
│       │   └─ NOT available
│       │
│       └─ Auction (id: sub_7)
│           ├─ qrEnabled: true ✅
│           └─ registrationQR: /register/evt_2/sub_7

★ Note: All enabled sub-events of same event share same attendance QR
```

---

## Smart Logic Decision Tree

```
┌─────────────────────────────────┐
│ Attendance QR Scanned           │
│ /attendance/:eventId            │
└────────────┬────────────────────┘
             │
    ┌────────▼────────┐
    │ Frontend:       │
    │ AttendanceQR    │
    │ Selection Page  │
    └────────┬────────┘
             │
    ┌────────▼──────────────────┐
    │ Fetch all sub-events      │
    │ for this event            │
    └────────┬──────────────────┘
             │
    ┌────────▼──────────────────┐
    │ Filter qrEnabled = true    │
    │ enabledEvents = [...]      │
    └────────┬──────────────────┘
             │
      ┌──────┴──────┬──────────┐
      │             │          │
    Count=0       Count=1      Count>1
      │             │          │
      ▼             ▼          ▼
   ┌───┐         ┌────┐    ┌──────┐
   │ERR│         │AUTO│    │SELECT│
   └───┘         │REDI│    │ UI   │
                 │RECT│    └──────┘
                 └────┘        │
                   │           │
                   ▼           ▼
             Auto-navigate   Show buttons:
             to marking      [Event 1]
             page directly   [Event 2]
                             [Event 3]
                             │
                             ▼
                        User clicks
                        [Event 2]
                             │
                             ▼
                        Navigate to
                        /attendance-marking
                        /evt/sub_2
```

---

## Component Composition

```
QRPage
├── Header
├── EventSelector
│   ├── Dropdown
│   └── Selected Event Info
├── Registration Section
│   ├── Sub-event Selector
│   ├── Generate Button
│   └── QRDisplay
│       ├── QR Image
│       ├── URL Preview
│       └── Download Button
├── Attendance Section
│   ├── Generate Button
│   └── QRDisplay
│       ├── QR Image
│       ├── URL Preview
│       └── Download Button
├── EventList
│   ├── Mode Indicator
│   ├── Event Cards
│   │   ├── Status Icon
│   │   ├── Event Name
│   │   ├── Description
│   │   └── Enabled/Disabled Badge
│   └── Summary Stats
└── Info Box
    └── Smart QR Info
```

---

## State Management Flow

```
┌──────────────────────────────────────────┐
│         QRPage Component State            │
└──────────────────────────────────────────┘
         │                    │
    ┌────▼────┐         ┌────▼────┐
    │ Selected │         │Sub-Events│
    │ Event    │         │          │
    └─────┬────┘         └────┬─────┘
          │                   │
          └─────────┬─────────┘
                    │
        ┌───────────▼───────────┐
        │  Filter Logic:        │
        │  enabledEvents =      │
        │  subEvents.filter(    │
        │   e => e.qrEnabled    │
        │  )                    │
        └───────────┬───────────┘
                    │
        ┌───────────▼───────────────┐
        │  QR Generation State       │
        ├───────────┬───────────────┤
        │           │               │
    ┌───▼──┐  ┌────▼────┐  ┌────▼──┐
    │Reg QR│  │Att QR   │  │Errors │
    │Image │  │Image    │  │       │
    └──────┘  └─────────┘  └────────┘
```

---

## File Dependencies

```
QRPage.jsx
├─ depends on ──> EventSelector.jsx
├─ depends on ──> QRDisplay.jsx (×2)
├─ depends on ──> EventList.jsx
├─ imports ────> qrApi.js
│   └─ uses ───> axios
├─ imports ────> react-router-dom
└─ imports ────> lucide-react (icons)

AttendanceSelectionPage.jsx
├─ depends on ──> qrApi.js
├─ imports ────> react-router-dom
└─ imports ────> lucide-react

EventSelector.jsx
└─ imports ────> react

QRDisplay.jsx
├─ imports ────> react
└─ imports ────> lucide-react (Download icon)

EventList.jsx
├─ imports ────> react
└─ imports ────> lucide-react (CheckCircle, XCircle)

qrApi.js
└─ imports ────> axios
```

---

## API Call Sequence

```
1️⃣ Component Mount
   └─> GET /api/events
       └─> Display in dropdown

2️⃣ User Selects Event
   └─> GET /api/subevents/:eventId
       ├─> Display all sub-events
       ├─> Filter enabled events
       └─> Update UI accordingly

3️⃣ User Generates Registration QR
   └─> GET /api/qr?type=registration&eventId=X&subEventId=Y
       ├─> Backend generates QR for URL: /register/X/Y
       └─> Display QR image

4️⃣ User Generates Attendance QR
   └─> GET /api/qr?type=attendance&eventId=X
       ├─> Backend generates QR for URL: /attendance/X
       ├─> When scanned, triggers smart logic
       └─> Display QR image

5️⃣ User Downloads QR
   └─> Browser download triggered
       └─> File saved as PNG
```

---

## Environment Setup

```
Frontend Root (.env)
├─ VITE_API_URL = http://localhost:3000/api

Router Configuration
├─ /qr-manager ──────> QRPage.jsx
├─ /attendance/:id ──> AttendanceSelectionPage.jsx
├─ /register/:e/:s ──> RegistrationPage.jsx (create)
└─ /att-mark/:e/:s ──> AttendanceMarkingPage.jsx (create)

Backend (.env)
├─ FRONTEND_URL = http://localhost:5173
├─ MONGODB_URI = mongodb://localhost/planora
└─ PORT = 3000
```

---

## Summary

- **5 React Components**: Modular, reusable architecture
- **1 API Client**: Centralized Axios integration
- **4 API Endpoints**: Backend requirements
- **Smart Logic**: Handles all event structures
- **Clean UI**: Tailwind CSS styling
- **Full Documentation**: Integration guides included

All components work together to provide a complete QR management system for the Planora event platform.
