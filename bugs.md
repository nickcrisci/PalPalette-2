# Frontend (palpalette-app)

- When the Auth token is expired the user is not automatically logged out.
- The Auth token is not refreshed. Users have to login again way too often
- When registering and clicking confirm, a toast is shown saying that all fields need to be filled in, even though all fields are filled in. When clicking confirm again it works.
- When logging in and clicking confirm, a toast is shown saying that all fields need to be filled in, even though all fields are filled in. When clicking confirm again it works.
- ✅ **FIXED** - When choosing a lighting system for the edge device in the app and clicking "Save configuration" the configuration cannot be saved and these errors are logged to the console: POST http://localhost:3000/devices/.../lighting/configure 400 (Bad Request)
  - **Solution**: Fixed backend validation logic to properly handle different lighting system types. Nanoleaf now uses auto-discovery (no host required), WS2812 has default pin/LED count configuration, and WLED properly validates network settings. Also added proper validation pipes and enhanced frontend UI for WS2812 configuration.

# Edge Device (controller)

- ✅ **FIXED** - The Edge device tries to init the WS2812 lighting system by default. But actually the user should choose the lighting system in the PalPalette App. Only then should the controller init the lighting system

  - **Solution**: Modified `LightManager` to not auto-configure any lighting system and added `beginWithoutConfig()` method. The device now waits for lighting configuration from the mobile app after pairing.

- ✅ **FIXED** - The Edge devices captive portal still shows the option to choose the lighting system. But actually the user should choose the lighting system in the PalPalette App. Only then should the controller init the lighting system.

  - **Solution**: Removed all lighting system configuration options from the WiFi captive portal. The portal now only handles WiFi and server configuration, with a clear message that lighting setup happens through the mobile app.

- ✅ **FIXED** - Even though the Edge device has sucessfully connected to the nanoleafs, the test data cannot be sent. The backend shows this warning: WARN [DeviceWebSocketService] Device e74f9136-9273-454c-8026-397c41bfdc93 not connected for lighting test
  - **Root Cause**: Device ID mismatch between database UUID format (`e74f9136-...`) and ESP32 WebSocket ID format (`esp32-b0818405ff98`). The ESP32 registers with MAC-based ID but backend was trying to send configs using database UUID.
  - **Solution**: Enhanced WebSocket connection tracking and debugging in the backend. Fixed device ID conversion in lighting systems service to properly convert between database UUID and ESP32 MAC-based device IDs for WebSocket communication.
