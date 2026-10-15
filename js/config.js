/**
 * Global Configuration for Event Management Application
 *
 * Connected Backend: Render Live Service
 */
const BACKEND_PROD_URL = "https://eventmanagement-1-gtj6.onrender.com";

const isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "" ||
    window.location.protocol === "file:"
);

// Support optional localStorage override if ever needed
const storedCustomUrl = localStorage.getItem("CUSTOM_API_BASE_URL");

window.API_BASE_URL = storedCustomUrl 
    ? storedCustomUrl.replace(/\/+$/, "")
    : (isLocalhost ? "http://localhost:8080" : BACKEND_PROD_URL.replace(/\/+$/, ""));

console.log("[EventManagement] Connected API Base URL:", window.API_BASE_URL);
