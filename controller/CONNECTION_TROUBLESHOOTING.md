# Microcontroller Connection Troubleshooting Guide

## 🚨 FOUND THE MAIN ISSUE!

Your controller code is still using `localhost:3000` which won't work when the ESP32/ESP8266 is on a different device than your computer.

## 🔧 **Quick Fix Steps:**

### 1. **Find Your Computer's IP Address**

```cmd
ipconfig
```

Look for "IPv4 Address" under your active network (probably something like `192.168.178.x`)

### 2. **Update Controller Code**

In your `palpalette-edge-device.ino` file, change this line:

```cpp
const char *websocket_server = "ws://localhost:3000"; // ❌ THIS WON'T WORK
```

To:

```cpp
const char *websocket_server = "ws://192.168.178.23:3000"; // ✅ Use your actual IP
```

## 🔧 **Complete Troubleshooting Checklist:**

### ✅ **Network Configuration**

- [ ] **Computer IP**: Find with `ipconfig` (likely `192.168.178.x`)
- [ ] **Same Network**: ESP32 and computer on same WiFi network
- [ ] **WiFi Credentials**: Correct SSID and password in controller code
- [ ] **IP Address**: Controller uses computer's IP, not localhost

### ✅ **Backend Configuration**

- [ ] **Backend Running**: `npm run start:dev` in backend folder
- [ ] **Listening on 0.0.0.0**: Backend accepts external connections ✅ (Already fixed)
- [ ] **Port 3000**: Backend accessible on port 3000
- [ ] **CORS Enabled**: WebSocket connections allowed ✅ (Already configured)

### ✅ **Firewall & Network**

- [ ] **Windows Firewall**: Allow Node.js/npm through Windows Defender Firewall
- [ ] **Port 3000 Open**: No blocking on port 3000
- [ ] **Router Settings**: No AP isolation (devices can talk to each other)
- [ ] **Antivirus**: Not blocking network connections

### ✅ **Controller Configuration**

- [ ] **WiFi Connection**: ESP32 successfully connects to WiFi
- [ ] **Serial Monitor**: Check for connection status messages
- [ ] **WebSocket URL**: Uses ws://YOUR_IP:3000 format
- [ ] **Libraries Installed**: ArduinoWebsockets and ArduinoJson

## 🧪 **Testing Steps:**

### **Step 1: Test Network Connectivity**

From another device on your network, try:

```
http://192.168.178.23:3000/health
```

(Replace with your actual IP)

### **Step 2: Test WebSocket from Browser**

Open browser console and run:

```javascript
const ws = new WebSocket("ws://192.168.178.23:3000");
ws.onopen = () => console.log("WebSocket connected!");
ws.onerror = (e) => console.log("WebSocket error:", e);
```

### **Step 3: Check Serial Monitor Output**

Look for these messages:

```
✓ WiFi Connected!
🔌 Connecting to WebSocket server: ws://192.168.178.23:3000
✓ Connected to WebSocket server
✅ Device successfully registered with server!
```

## 🚨 **Common Issues & Solutions:**

### **"Connection Failed" in Serial Monitor**

- ❌ **Wrong IP**: Double-check your computer's IP address
- ❌ **Backend Not Running**: Start with `npm run start:dev`
- ❌ **Firewall Blocking**: Allow Node.js through Windows Firewall
- ❌ **Router Isolation**: Check if AP isolation is enabled

### **WiFi Connection Issues**

- ❌ **Wrong Credentials**: Verify SSID and password
- ❌ **5GHz Network**: Try 2.4GHz network (ESP8266 compatibility)
- ❌ **Special Characters**: Escape special characters in password

### **"Device Not Registered" Errors**

- ❌ **Device ID**: Use consistent device ID in controller
- ❌ **Authentication**: Backend might require proper user tokens

## 🎯 **Expected Serial Monitor Output:**

```
=== PalPalette Edge Device (Testing Mode) ===
Version: Test build without LED hardware
==========================================

Connecting to WiFi: Tapferer kleiner Router
✓ WiFi Connected!
IP Address: 192.168.178.150
Backend Server: ws://192.168.178.23:3000

🔌 Connecting to WebSocket server: ws://192.168.178.23:3000
✓ Connected to WebSocket server
📋 Registering device with server...
Device ID: test-device-001
✅ Device successfully registered with server!
💓 Heartbeat sent
```

## 🔧 **Quick Network Test Commands:**

### **Test if backend is accessible:**

```cmd
curl http://192.168.178.23:3000/health
# OR
telnet 192.168.178.23 3000
```

### **Check if port is listening:**

```cmd
netstat -an | findstr :3000
```

### **Test from mobile device:**

Open browser on phone and go to: `http://192.168.178.23:3000`

---

## 🎯 **Next Steps After Fix:**

1. Update controller IP address
2. Upload new code to ESP32/ESP8266
3. Monitor Serial output for connection success
4. Test color palette sending from mobile app
5. Watch Serial Monitor for received color data
