/**
 * Global Configuration for Event Management Application
 *
 * How this works:
 * 1. LOCAL DEVELOPMENT:
 *    When you open the site via localhost (127.0.0.1 or file://),
 *    it automatically connects to: http://localhost:8080
 *
 * 2. LIVE PRODUCTION (Vercel / Render):
 *    When deployed to Vercel, it automatically uses BACKEND_PROD_URL.
 *    Replace the URL below with your live Render backend URL once deployed,
 *    e.g. "https://event-management-backend-xxxx.onrender.com"
 *
 * 3. RUNTIME OVERRIDE:
 *    You can also override the backend URL at any time in the browser console:
 *    localStorage.setItem("CUSTOM_API_BASE_URL", "https://your-service.onrender.com");
 */
const BACKEND_PROD_URL = "https://event-management-backend.onrender.com";

const isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "" ||
    window.location.protocol === "file:"
);

const customBackendUrl = localStorage.getItem("CUSTOM_API_BASE_URL");

window.API_BASE_URL = customBackendUrl 
    ? customBackendUrl.replace(/\/+$/, "")
    : (isLocalhost ? "http://localhost:8080" : BACKEND_PROD_URL.replace(/\/+$/, ""));

console.log("[EventManagement] Connected API Base URL:", window.API_BASE_URL);
