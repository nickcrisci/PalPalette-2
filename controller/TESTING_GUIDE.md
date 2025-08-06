# PalPalette Controller Testing Guide

## Quick Setup for Testing

### 1. Backend Configuration ✅

- Backend is already configured to accept external connections
- Listens on `0.0.0.0:3000` instead of localhost
- CORS enabled for all origins

### 2. Find Your Computer's IP Address

**Windows (Command Prompt):**

```cmd
ipconfig
```

Look for "IPv4 Address" under your active network adapter (e.g., `192.168.1.100`)

### 3. Update Controller Code

Open `controller/palpalette-edge-device-testing.ino` and update these lines:

```cpp
// *** UPDATE THESE VALUES ***
const char* ssid = "YOUR_WIFI_SSID";           // Your WiFi network name
const char* password = "YOUR_WIFI_PASSWORD";   // Your WiFi password
const char* BACKEND_IP = "192.168.1.100";      // *** CHANGE THIS TO YOUR COMPUTER'S IP ***
```

### 4. Upload and Test

1. **Start the backend:**

   ```cmd
   cd backend
   npm run start:dev
   ```

2. **Upload the testing code to your ESP32/ESP8266**

   - Use Arduino IDE
   - Install required libraries: `ArduinoWebsockets`, `ArduinoJson`
   - Upload `palpalette-edge-device-testing.ino`

3. **Open Serial Monitor**
   - Set baud rate to 115200
   - Watch for connection messages

### 5. Test Color Sending

1. **Open the mobile app** and login
2. **Take a photo** and extract colors
3. **Send to a friend** - the controller should receive and display the colors in Serial Monitor
4. **Check Messages page** - replay messages to see them appear on controller

## What You'll See in Serial Monitor

```
=== PalPalette Edge Device (Testing Mode) ===
Version: Test build without LED hardware
==========================================

Connecting to WiFi: YOUR_NETWORK
✓ WiFi Connected!
IP Address: 192.168.1.150
Backend Server: ws://192.168.1.100:3000

🔌 Connecting to WebSocket server: ws://192.168.1.100:3000
✓ Connected to WebSocket server
📋 Registering device with server...
Device ID: test-device-001
✅ Device successfully registered with server!

📨 Received WebSocket message:
🎨 ===== COLOR PALETTE RECEIVED =====
Message ID: msg_123456
From: John Doe (user_123)
Timestamp: 1640995200000
Number of colors: 5

🌈 Color Palette:
+---------+----------+
| Color # | Hex Code |
+---------+----------+
|    1    |  #FF5733  |
|    2    |  #33FF57  |
|    3    |  #3357FF  |
|    4    |  #F333FF  |
|    5    |  #FFE633  |
+---------+----------+

💡 [LED SIMULATION] Displaying colors on light strip:
   Strip: [#FF5733]-[#33FF57]-[#3357FF]-[#F333FF]-[#FFE633]
   RGB Values:
   Color 1: RGB(255, 87, 51)
   Color 2: RGB(51, 255, 87)
   Color 3: RGB(51, 87, 255)
   Color 4: RGB(243, 51, 255)
   Color 5: RGB(255, 230, 51)
   💡 Colors displayed for 30 seconds
🎨 =====================================
```

## Troubleshooting

### Controller Can't Connect

- Check WiFi credentials
- Verify your computer's IP address
- Make sure backend is running on port 3000
- Check firewall settings (Windows Defender might block port 3000)

### No Messages Received

- Test with mobile app first
- Check device registration in backend logs
- Use browser dev tools to verify WebSocket connection from app

### Backend Access Issues

```cmd
# Test if backend is accessible from network
# Replace 192.168.1.100 with your IP
curl http://192.168.1.100:3000/health
```

## Production Version

After testing works, you can use the original `palpalette-edge-device.ino` file with:

- Real LED strips connected
- FastLED library installed
- Proper device registration tokens from your user account
