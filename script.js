const API_URL = "http://localhost:3000";

// ==================== CREATE EVENT ====================
document.getElementById("eventForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById("eventName").value.trim();
    const date = document.getElementById("eventDate").value;
    const location = document.getElementById("eventLocation").value.trim();
    const type = document.getElementById("eventType").value;

    // Validation
    if (!name || !date || !location || !type) {
        alert("❌ All fields are required!");
        return;
    }

    // Prepare data
    const eventData = { name, date, location, type };

    console.log("📤 Sending event data:", eventData);

    try {
        const response = await fetch(`${API_URL}/add-event`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(eventData)
        });

        const result = await response.json();

        if (response.ok) {
            console.log("✅ Event added:", result);
            alert("✅ Event added successfully!");
            
            // Reset form
            e.target.reset();
            
            // Reload events
            loadEvents();
        } else {
            console.error("❌ Server error:", result);
            alert(`❌ Error: ${result.error || "Failed to add event"}`);
        }

    } catch (error) {
        console.error("❌ Network error:", error);
        alert("❌ Cannot connect to server. Make sure server is running on port 3000.");
    }
});

// ==================== READ EVENTS ====================
async function loadEvents() {
    const container = document.getElementById("eventCards");
    container.innerHTML = `<p class="text-gray-400 col-span-full text-center">⏳ Loading events...</p>`;

    try {
        console.log("📥 Fetching events from server...");
        
        const response = await fetch(`${API_URL}/events`);
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const events = await response.json();
        console.log(`✅ Received ${events.length} events`);

        // Check if no events
        if (events.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center text-gray-400 py-12">
                    <p class="text-2xl mb-2">📅</p>
                    <p>No events yet. Add your first event!</p>
                </div>
            `;
            return;
        }

        // Display events
        container.innerHTML = events.map(event => `
            <div class="event-card bg-black/60 p-6 rounded-xl border border-gray-800 hover:border-red-700">
                <h3 class="text-xl font-bold text-white mb-3">${escapeHtml(event.name)}</h3>
                <p class="text-gray-300 mb-2">📅 ${formatDate(event.event_date)}</p>
                <p class="text-gray-300 mb-3">📍 ${escapeHtml(event.location)}</p>
                <span class="bg-red-700 text-white text-sm px-3 py-1 rounded inline-block">
                    ${escapeHtml(event.type)}
                </span>
            </div>
        `).join("");

    } catch (error) {
        console.error("❌ Error loading events:", error);
        container.innerHTML = `
            <div class="col-span-full text-center text-red-500 py-12">
                <p class="text-2xl mb-2">⚠️</p>
                <p class="font-bold mb-2">Server Error</p>
                <p class="text-sm">Cannot connect to server. Please check:</p>
                <ul class="text-sm mt-2 text-left max-w-md mx-auto">
                    <li>✓ Server is running (node server.js)</li>
                    <li>✓ Server is on port 3000</li>
                    <li>✓ No CORS issues</li>
                </ul>
            </div>
        `;
    }
}

// ==================== HELPER FUNCTIONS ====================

// Format date to readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== PAGE LOAD ====================
window.addEventListener("DOMContentLoaded", () => {
    console.log("🎪 EventHub loaded");
    console.log("🔗 API URL:", API_URL);
    loadEvents();
});