// Simple WebSocket test client
const io = require("socket.io-client");

// Device info from registration
const deviceId = "b2656fa4-9d15-4a1c-8360-c9a142297a31";
const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMjY1NmZhNC05ZDE1LTRhMWMtODM2MC1jOWExNDIyOTdhMzEiLCJ0eXBlIjoiZGV2aWNlIiwiaWF0IjoxNzUzMzU4MDQzLCJleHAiOjE3NTMzNjE2NDN9.goJZtxPdY4q1kPqnCVB9txpwwZGuRqAMEh0es6z92ek";

console.log("Connecting to WebSocket gateway...");

const socket = io("ws://localhost:3000", {
    auth: { token: jwtToken },
    extraHeaders: {
        Authorization: `Bearer ${jwtToken}`
    }
});

socket.on("connect", () => {
    console.log("✅ Connected to backend WebSocket!");
    console.log("Socket ID:", socket.id);
});

socket.on("color-message", (data) => {
    console.log("🎨 Received color-message:", data);
});

socket.on("message", (data) => {
    console.log("📨 Received message:", data);
});

socket.on("disconnect", () => {
    console.log("❌ Disconnected from backend");
});

socket.on("connect_error", (err) => {
    console.error("❌ Connection error:", err.message);
});

// Keep the script running
console.log("WebSocket test client started. Press Ctrl+C to exit.");
