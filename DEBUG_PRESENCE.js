// DEBUGGING SCRIPT - Run this in browser DevTools Console
// This will help identify where the issue is happening

console.log("=== PRESENCE BUG DIAGNOSTIC ===\n");

// 1. Check localStorage
console.log("1️⃣ CHECK STORED TOKENS:");
console.log("userToken:", localStorage.getItem("userToken") ? "EXISTS" : "❌ MISSING (good after logout)");
console.log("adminToken:", localStorage.getItem("adminToken") ? "EXISTS" : "❌ MISSING");
console.log("user:", localStorage.getItem("user") ? localStorage.getItem("user") : "❌ MISSING");

// 2. Check if you're authenticated as admin
console.log("\n2️⃣ CHECK CURRENT AUTHENTICATION:");
const adminToken = localStorage.getItem("adminToken");
if (adminToken) {
  console.log("✅ Admin authenticated");
  
  // 3. Fetch fresh user data directly
  console.log("\n3️⃣ FETCHING /admin/users (with fresh timestamp):");
  fetch(`http://localhost:4000/api/admin/users?_t=${Date.now()}`, {
    headers: {
      "Authorization": `Bearer ${adminToken}`,
      "Content-Type": "application/json"
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log("Response from /admin/users:");
    const users = Array.isArray(data) ? data : (data.users || []);
    users.forEach((user) => {
      console.log(`  📋 ${user.name} (${user.email}):`, {
        isOnline: user.isOnline,
        lastSeenAt: user.lastSeenAt,
        createdAt: user.createdAt
      });
    });
  })
  .catch(err => console.error("Error fetching /admin/users:", err));
  
  // 4. Also check /users/me if you still have user token
  const userToken = localStorage.getItem("userToken");
  if (userToken) {
    console.log("\n4️⃣ FETCHING /users/me (current user data):");
    fetch(`http://localhost:4000/api/users/me?_t=${Date.now()}`, {
      headers: {
        "Authorization": `Bearer ${userToken}`,
        "Content-Type": "application/json"
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log("Response from /users/me:", {
        id: data.id,
        name: data.name,
        email: data.email,
        isOnline: data.isOnline,
        lastSeenAt: data.lastSeenAt
      });
    })
    .catch(err => console.error("Error fetching /users/me:", err));
  }
} else {
  console.log("❌ Not authenticated as admin. Please login to admin dashboard first.");
}

console.log("\n📝 NEXT STEPS:");
console.log("1. Log in as regular user (e.g., testing guest)");
console.log("2. Note the time");
console.log("3. Log out");
console.log("4. Open DevTools Console");
console.log("5. Run this script");
console.log("6. Log in again as admin");
console.log("7. Run this script again");
console.log("8. Compare the 'isOnline' values - they should be FALSE after logout");
console.log("\nIf isOnline is still TRUE after logout, the backend is not updating the database!");
