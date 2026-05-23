# React Context Error Fix: usePrograms Hook

## 🔴 The Error

```
Uncaught Error: usePrograms must be used within a ProgramProvider
```

This error occurs when a component tries to call `usePrograms()` but the context is `undefined`.

---

## 🔍 Root Cause Analysis

### What Happens:

1. **usePrograms hook** calls `useContext(ProgramContext)`
2. If the component is **NOT** wrapped by `<ProgramProvider>`, the context is `undefined`
3. The hook throws an error with the message above

### Why It Happened:

The issue is typically **provider nesting order** or **component structure**. Components need to be:

1. ✅ Inside the `ProgramProvider` wrapper
2. ✅ Rendered AFTER the provider is mounted
3. ✅ In the correct component tree

---

## ✅ The Solution

### Provider Hierarchy (Order Matters!)

```
App (Root)
├── ProgramProvider ← MUST be at TOP (provides context)
    ├── QueryClientProvider ← React Query
        ├── TooltipProvider ← UI tooltips
            ├── BrowserRouter ← React Router (MUST wrap routes)
                ├── AppContent (Routes)
                    ├── Route /dashboard
                    │   └── ProtectedRoute
                    │       └── AppLayout
                    │           ├── Navbar ← uses usePrograms() ✓
                    │           └── Dashboard ← uses usePrograms() ✓
                    ├── Route /programs
                    └── ... other routes
```

### Critical Rules:

| Rule | Why | Example |
|------|-----|---------|
| **ProgramProvider at top** | Must wrap everything that uses context | `<ProgramProvider><App /></ProgramProvider>` |
| **BrowserRouter inside Provider** | Routes must access context | `<ProgramProvider><BrowserRouter><Routes /></BrowserRouter></ProgramProvider>` |
| **AppContent inside BrowserRouter** | Allows `useLocation()` + context | `<BrowserRouter><AppContent /></BrowserRouter>` |
| **Components inside Routes** | They're inside both Router + Provider | `<Route path="/dashboard"><Dashboard /></Route>` |

---

## 📋 Correct App.tsx Structure

```typescript
/**
 * Provider Hierarchy (order matters!):
 * 1. ProgramProvider - MUST be at the top level
 * 2. QueryClientProvider - React Query
 * 3. TooltipProvider - UI tooltips
 * 4. BrowserRouter - React Router
 * 5. AppContent - Routes
 */
const App = () => (
  <ProgramProvider>                    {/* ← TOP LEVEL */}
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>               {/* ← WRAPS ROUTES */}
          <AppContent />              {/* ← CONTAINS ROUTES */}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ProgramProvider>
);

export default App;
```

### AppContent (Routes Container)

```typescript
/**
 * AppContent Component
 * Contains all routes
 * MUST be inside BrowserRouter (for useLocation, useParams, etc.)
 * MUST be inside ProgramProvider (for usePrograms)
 */
const AppContent = () => {
  const location = useLocation(); // ✓ Works (inside BrowserRouter)
  
  return (
    <Routes>
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard /> {/* ✓ Can use usePrograms() */}
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      {/* ... other routes */}
    </Routes>
  );
};
```

### AppLayout (UI Layout)

```typescript
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex w-full bg-background">
    <AppSidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />              {/* ✓ Can use usePrograms() */}
      <main className="flex-1 p-6 overflow-auto">
        {children}            {/* ✓ Can use usePrograms() */}
      </main>
    </div>
  </div>
);
```

---

## 🎯 Component Usage

### Navbar Component (Example)

```typescript
import { usePrograms } from "@/contexts/ProgramContext";

const Navbar = () => {
  const { programs, currentProgram } = usePrograms();
  
  return (
    <nav>
      <div>{currentProgram?.eventName}</div>
      {/* ... navbar content */}
    </nav>
  );
};

export default Navbar;
```

### Dashboard Component (Example)

```typescript
import { usePrograms } from "@/contexts/ProgramContext";

const Dashboard = () => {
  const { programs, isLoading } = usePrograms();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Programs: {programs.length}</h1>
      {/* ... dashboard content */}
    </div>
  );
};

export default Dashboard;
```

---

## 🔧 Debugging Checklist

### ✅ Provider is correctly set up:
- [ ] ProgramProvider is at the very top of App component
- [ ] ProgramProvider wraps QueryClientProvider
- [ ] BrowserRouter is INSIDE ProgramProvider
- [ ] AppContent with routes is INSIDE BrowserRouter

### ✅ Context hook is properly defined:
- [ ] `usePrograms` uses `useContext(ProgramContext)` correctly
- [ ] `usePrograms` throws helpful error message if context is undefined
- [ ] Hook is exported from ProgramContext.tsx
- [ ] Import path is correct in components

### ✅ Components are in correct location:
- [ ] Navbar is inside AppLayout
- [ ] AppLayout is rendered inside routes (AppContent)
- [ ] AppContent is inside BrowserRouter
- [ ] BrowserRouter is inside ProgramProvider

### ✅ No async issues:
- [ ] Components don't use hook inside event handlers (they use it at render time)
- [ ] No conditional provider wrapping

---

## ❌ Common Mistakes

### ❌ WRONG: Provider outside BrowserRouter
```typescript
// ❌ WRONG - Routes won't have access to context
const App = () => (
  <BrowserRouter>
    <ProgramProvider>
      <AppContent />
    </ProgramProvider>
  </BrowserRouter>
);
```

### ❌ WRONG: Nested providers incorrectly
```typescript
// ❌ WRONG - AppContent tries to use useLocation outside BrowserRouter
const App = () => (
  <ProgramProvider>
    <AppContent /> {/* useLocation() will fail! */}
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  </ProgramProvider>
);
```

### ❌ WRONG: Using hook at module level
```typescript
// ❌ WRONG - Can't use hooks at module level
const programs = usePrograms(); // ERROR!

const Dashboard = () => {
  return <div>{programs}</div>;
};
```

### ❌ WRONG: Provider mounted after component
```typescript
// ❌ WRONG - Component renders before provider
const Dashboard = () => {
  const { programs } = usePrograms(); // Context not ready!
  return <div>{programs}</div>;
};

// ... later in file
const App = () => (
  <ProgramProvider>
    <Dashboard />
  </ProgramProvider>
);
```

### ✅ CORRECT: Inside component, during render
```typescript
// ✅ CORRECT - Hook called during render, inside provider
const Dashboard = () => {
  const { programs } = usePrograms(); // Context available!
  return <div>{programs.length} programs</div>;
};
```

---

## 🚨 Error Messages Explained

### Error: "usePrograms must be used within a ProgramProvider"
**Meaning**: The component is outside the `<ProgramProvider>` wrapper
**Solution**: Move the component inside the provider, or move the provider higher up

### Error: "Cannot read property 'X' of undefined" after using usePrograms
**Meaning**: The context hook returned undefined
**Solution**: Check provider is correctly wrapping the component

### Error: "useLocation must be used within a <Routes> element"
**Meaning**: AppContent is outside BrowserRouter
**Solution**: Move `<BrowserRouter>` to wrap `<AppContent>`

---

## ✨ Best Practices

### 1. **Type-Safe Context Hook**
```typescript
export const usePrograms = (): ProgramContextType => {
  const context = useContext(ProgramContext);
  
  if (context === undefined) {
    throw new Error(
      "usePrograms must be used within a ProgramProvider. " +
      "Make sure your component is wrapped inside <ProgramProvider>."
    );
  }
  
  return context;
};
```

### 2. **Helpful Error Messages**
```typescript
// ✓ Good error message
throw new Error(
  "usePrograms must be used within a ProgramProvider. " +
  "Make sure your component is wrapped inside <ProgramProvider>."
);

// ✗ Not helpful
throw new Error("Context error");
```

### 3. **Provider at Top Level**
```typescript
// App.tsx
const App = () => (
  <ProgramProvider>
    {/* everything else */}
  </ProgramProvider>
);
```

### 4. **Separate AppContent Component**
```typescript
// Allows AppContent to use useLocation()
const App = () => (
  <ProgramProvider>
    <BrowserRouter>
      <AppContent /> {/* Uses useLocation inside BrowserRouter */}
    </BrowserRouter>
  </ProgramProvider>
);

const AppContent = () => {
  const location = useLocation(); // ✓ Works
  return <Routes>...</Routes>;
};
```

---

## 📚 Complete Working Example

```typescript
// App.tsx
import { ProgramProvider } from "@/contexts/ProgramContext";
import { BrowserRouter } from "react-router-dom";

const App = () => (
  <ProgramProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ProgramProvider>
);

const AppContent = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      {/* ... other routes */}
    </Routes>
  );
};

// Dashboard.tsx - This works because it's inside both Provider and Router
const Dashboard = () => {
  const { programs } = usePrograms(); // ✓ Works!
  return <div>{programs.length} programs</div>;
};
```

---

## 🎓 Key Takeaway

The context hook error happens when:
1. Component tries to use the hook
2. Component is NOT wrapped by the provider
3. Check provider is at top level
4. Check component is inside Routes
5. Check Routes is inside BrowserRouter
6. Check BrowserRouter is inside ProgramProvider

**Correct order matters!**

---

## ✅ After This Fix

Your app should work like:
```
✓ Navbar can use usePrograms()
✓ Dashboard can use usePrograms()
✓ All protected routes can use context
✓ useLocation() works in AppContent
✓ No "outside provider" errors
```

---

**Status**: Fixed ✅
**Changes**: App.tsx + ProgramContext.tsx updated
**Testing**: Try navigating to /dashboard - no errors!
