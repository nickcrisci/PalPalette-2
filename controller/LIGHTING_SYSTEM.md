# PalPalette Modular Lighting System

## Overview

The PalPalette ESP32 firmware now supports multiple lighting systems through a pluggable architecture. Friends can use different lighting hardware while still receiving and displaying shared color palettes.

## Supported Lighting Systems

### 1. Nanoleaf Panels

- **System Type**: `nanoleaf`
- **Hardware**: Nanoleaf Aurora, Canvas, or Shapes panels
- **Connection**: WiFi/HTTP REST API
- **Authentication**: Required (automatic token generation)
- **Features**:
  - Panel layout discovery
  - Smooth color transitions
  - Multiple animation modes
  - Brightness control

### 2. WLED LED Strips

- **System Type**: `wled`
- **Hardware**: ESP8266/ESP32 running WLED firmware
- **Connection**: WiFi/HTTP JSON API
- **Authentication**: None (optional API key support)
- **Features**:
  - Segment-based control
  - Built-in effects integration
  - RGB and RGBW support
  - Multiple strip support

### 3. WS2812B LED Strips (Direct)

- **System Type**: `ws2812`
- **Hardware**: Direct-connected WS2812B/NeoPixel strips
- **Connection**: GPIO pin (default: pin 2)
- **Authentication**: None
- **Features**:
  - Direct hardware control
  - Smooth animations
  - Rainbow effects
  - Configurable LED count

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile App    │ -> │  WebSocket API   │ -> │  LightManager   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                              ┌──────────────────────────┼──────────────────────────┐
                              │                          │                          │
                    ┌─────────▼──────────┐    ┌─────────▼──────────┐    ┌─────────▼──────────┐
                    │ NanoleafController │    │  WLEDController    │    │ WS2812Controller   │
                    └────────────────────┘    └────────────────────┘    └────────────────────┘
                              │                          │                          │
                    ┌─────────▼──────────┐    ┌─────────▼──────────┐    ┌─────────▼──────────┐
                    │   Nanoleaf API     │    │    WLED API       │    │   FastLED/GPIO     │
                    │  (HTTP REST)       │    │  (HTTP JSON)      │    │   (Direct SPI)     │
                    └────────────────────┘    └────────────────────┘    └────────────────────┘
```

## Installation & Setup

### 1. Hardware Setup

#### For Nanoleaf:

- Ensure Nanoleaf panels are on the same network
- Note the IP address of your Nanoleaf controller

#### For WLED:

- Flash WLED firmware to your ESP8266/ESP32
- Configure WiFi and note the device IP address

#### For WS2812B:

- Connect LED strip data pin to GPIO 2 (configurable)
- Connect power and ground appropriately
- Note the number of LEDs in your strip

### 2. Device Configuration

When the ESP32 starts in setup mode, it will:

1. Create a WiFi access point (PalPalette-XXXXXX)
2. Provide a web interface for configuration
3. Allow selection of lighting system type
4. Guide through system-specific setup

### 3. First-Time Setup

#### Nanoleaf Setup:

1. Select "Nanoleaf" as lighting system
2. Enter Nanoleaf controller IP address
3. Press and hold power button on Nanoleaf controller
4. ESP32 will automatically generate auth token
5. Test connection to verify setup

#### WLED Setup:

1. Select "WLED" as lighting system
2. Enter WLED device IP address
3. Optionally configure segments
4. Test connection to verify setup

#### WS2812B Setup:

1. Select "WS2812" as lighting system
2. Configure GPIO pin (default: 2)
3. Set number of LEDs
4. Set initial brightness
5. Test colors to verify connection

## Usage

### Mobile App Integration

The mobile app remains unchanged - all lighting system complexity is handled by the ESP32 firmware. When a friend sends a color palette:

1. Mobile app sends palette to backend
2. Backend forwards to all friend devices via WebSocket
3. Each ESP32 displays the palette using its configured lighting system
4. Different friends can have completely different hardware setups

### WebSocket API

The ESP32 receives color palettes in this format:

```json
{
  "event": "colorPalette",
  "messageId": "msg_123",
  "senderId": "user_456",
  "senderName": "Alice",
  "timestamp": 1680000000,
  "colors": [{ "hex": "#FF5733" }, { "hex": "#33FF57" }, { "hex": "#3357FF" }]
}
```

### Configuration Persistence

All lighting configurations are stored in ESP32 EEPROM:

- System type selection
- Network addresses and ports
- Authentication tokens
- Custom parameters (LED count, pin assignments, etc.)

## Development

### Adding New Lighting Systems

To add support for a new lighting system:

1. **Create Controller Class**:

   ```cpp
   class MyLightController : public LightController {
   public:
       bool initialize(const LightConfig& config) override;
       bool displayPalette(const ColorPalette& palette) override;
       bool turnOff() override;
       // ... implement all abstract methods
   };
   ```

2. **Update Factory**:

   ```cpp
   // In LightController.cpp
   if (type == "mysystem") {
       return new MyLightController();
   }
   ```

3. **Add to Supported Systems**:
   ```cpp
   static String supportedSystems[] = {
       "nanoleaf", "wled", "ws2812", "mysystem"
   };
   ```

### Testing

Each controller implements a `testConnection()` method for validation:

- Nanoleaf: Attempts to fetch device info
- WLED: Sends a simple state query
- WS2812: Displays a test pattern

### Debugging

Enable serial debugging to see detailed operation logs:

```cpp
Serial.println("🔧 System: " + systemType);
Serial.println("🌐 Host: " + hostAddress);
Serial.println("🎨 Displaying palette: " + palette.name);
```

## Troubleshooting

### Common Issues

1. **Nanoleaf Authentication Failed**

   - Ensure you press and hold the power button during setup
   - Check that ESP32 and Nanoleaf are on same network
   - Verify IP address is correct

2. **WLED Not Responding**

   - Verify WLED is powered and connected to WiFi
   - Check IP address and ensure no firewall blocking
   - Try accessing WLED web interface directly

3. **WS2812 Not Lighting**

   - Check GPIO pin configuration
   - Verify power supply can handle LED strip
   - Ensure proper ground connection between ESP32 and strip
   - Check LED count matches configuration

4. **WiFi Connection Issues**
   - Reset WiFi credentials via captive portal
   - Check network password and SSID
   - Ensure 2.4GHz network (not 5GHz)

### Configuration Reset

To reset all configurations:

1. Hold device boot button during power-on
2. Connect to setup WiFi network
3. Use web interface to clear all settings
4. Reconfigure from scratch

## Technical Specifications

### Memory Usage

- Base system: ~80KB flash, ~12KB RAM
- Nanoleaf controller: +15KB flash, +3KB RAM
- WLED controller: +8KB flash, +2KB RAM
- WS2812 controller: +12KB flash, +1KB RAM

### Network Requirements

- 2.4GHz WiFi network
- Internet connectivity for initial setup
- Local network access for lighting control
- WebSocket connection to PalPalette backend

### Performance

- Color palette display latency: <500ms
- Animation frame rate: 30-60 FPS (system dependent)
- Maximum supported LEDs: 1000 (WS2812), unlimited (networked systems)
- Concurrent palette support: 1 active + queue

## Future Enhancements

### Planned Features

- [ ] Philips Hue integration
- [ ] DMX/Art-Net support for professional lighting
- [ ] Bluetooth LE for battery-powered strips
- [ ] Audio-reactive modes
- [ ] Multi-zone lighting support
- [ ] Custom animation scripting

### API Extensions

- [ ] Real-time brightness adjustment via mobile app
- [ ] Custom animation speed control
- [ ] Lighting schedule/timer support
- [ ] Group synchronization for multiple devices
- [ ] Cloud-based lighting templates

## Contributing

To contribute to the lighting system:

1. Fork the repository
2. Create feature branch for new lighting controller
3. Implement controller following existing patterns
4. Add comprehensive testing
5. Update documentation
6. Submit pull request

### Code Standards

- Follow existing naming conventions
- Add comprehensive error handling
- Include debug logging for troubleshooting
- Test with actual hardware when possible
- Document all configuration parameters

## License

This modular lighting system is part of PalPalette and follows the same open-source license. See main project README for details.
