// Paste this in browser console to diagnose the issue

console.log('%c=== CONNECTION DIAGNOSTIC ===', 'color: blue; font-size: 14px; font-weight: bold');

// Check 1: API URL
console.log('%c1. API Configuration:', 'color: green; font-weight: bold');
const apiUrl = 'http://localhost:5000/api';
console.log(`   API Base URL: ${apiUrl}`);
console.log(`   Current Origin: ${window.location.origin}`);
console.log(`   Frontend Port: ${window.location.port}`);

// Check 2: Token
console.log('%c2. Authentication Token:', 'color: green; font-weight: bold');
const token = localStorage.getItem('authToken') || localStorage.getItem('coordinatorToken');
if (token) {
  console.log(`   ✅ Token found: ${token.substring(0, 30)}...`);
} else {
  console.log(`   ❌ No token found - user may not be logged in`);
}

// Check 3: Axios Configuration
console.log('%c3. Axios Configuration:', 'color: green; font-weight: bold');
console.log(`   withCredentials: true`);
console.log(`   Headers: Content-Type: application/json`);

// Check 4: Test API Connection
console.log('%c4. Testing API Connection...', 'color: green; font-weight: bold');

fetch('http://localhost:5000/health', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log(`   ✅ Backend is reachable: ${response.status}`);
  return response.json();
})
.then(data => {
  console.log('   Backend Health:', data);
})
.catch(error => {
  console.error(`   ❌ Backend not reachable: ${error.message}`);
});

// Check 5: Current Programs State
console.log('%c5. Current Programs State:', 'color: green; font-weight: bold');
const programsStr = localStorage.getItem('programs') || 'Not stored';
console.log(`   Stored programs: ${programsStr}`);

console.log('%c=== END DIAGNOSTIC ===', 'color: blue; font-size: 14px; font-weight: bold');
