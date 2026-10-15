/**
 * Global Configuration for Event Management Application
 *
 * - When testing locally (localhost, 127.0.0.1, or file://), it connects to:
 *     http://localhost:8080
 *
 * - In production (Vercel), it connects to your live Render backend URL:
 *     Update BACKEND_PROD_URL below with your actual Render service URL.
 */
const BACKEND_PROD_URL = "https://event-management-backend.onrender.com";

const isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "" ||
    window.location.protocol === "file:"
);

// Check if user set a custom URL in localStorage
const storedCustomUrl = localStorage.getItem("CUSTOM_API_BASE_URL");

window.API_BASE_URL = storedCustomUrl 
    ? storedCustomUrl.replace(/\/+$/, "")
    : (isLocalhost ? "http://localhost:8080" : BACKEND_PROD_URL.replace(/\/+$/, ""));

console.log("[EventManagement] Connected API Base URL:", window.API_BASE_URL);

/**
 * Helper to show a friendly banner if the backend URL is still the default placeholder
 * or if the user needs to update their Render URL.
 */
window.showBackendConfigBanner = function(customMessage) {
    if (document.getElementById("backend-config-banner")) return;

    const banner = document.createElement("div");
    banner.id = "backend-config-banner";
    banner.style.cssText = `
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        z-index: 999999;
        background: linear-gradient(135deg, #1e293b, #0f172a);
        border-bottom: 2px solid #3b82f6;
        color: #f8fafc;
        padding: 12px 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.35);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    `;

    const isPlaceholder = window.API_BASE_URL.includes("event-management-backend.onrender.com");
    const currentVal = isPlaceholder ? "" : window.API_BASE_URL;

    banner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">ACTION REQUIRED</span>
            <span>${customMessage || "Connect your live Render backend URL:"}</span>
            <input id="custom-backend-url-input" type="url" placeholder="https://your-service-name.onrender.com" value="${currentVal}" style="padding: 7px 12px; border-radius: 6px; border: 1px solid #475569; background: #0f172a; color: #fff; width: 320px; max-width: 90vw; font-size: 13px;" />
            <button id="save-backend-url-btn" style="background: #2563eb; color: white; border: none; padding: 7px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; transition: background 0.2s;">Save & Connect</button>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 12px; opacity: 0.7;">Current: ${window.API_BASE_URL}</span>
            <button onclick="document.getElementById('backend-config-banner').remove()" style="background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 18px; line-height: 1;">&times;</button>
        </div>
    `;

    document.body.prepend(banner);

    const saveBtn = document.getElementById("save-backend-url-btn");
    const input = document.getElementById("custom-backend-url-input");

    saveBtn.addEventListener("click", () => {
        const val = input.value.trim();
        if (!val) {
            alert("Please enter a valid Render backend URL (e.g. https://your-service.onrender.com)");
            return;
        }
        if (!val.startsWith("http://") && !val.startsWith("https://")) {
            alert("URL must start with https:// or http://");
            return;
        }
        localStorage.setItem("CUSTOM_API_BASE_URL", val.replace(/\/+$/, ""));
        alert("Backend URL saved! Connecting now...");
        window.location.reload();
    });
};

// Auto-display if running on live domain (Vercel) with placeholder URL
if (!isLocalhost && window.API_BASE_URL.includes("event-management-backend.onrender.com")) {
    window.addEventListener("DOMContentLoaded", () => {
        window.showBackendConfigBanner("Please enter your actual live Render Backend URL:");
    });
}
