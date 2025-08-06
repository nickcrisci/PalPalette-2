# ESP32 Controller Code Restructure Plan

## Current Issues

- All files are in the same `src/` directory
- Hard to distinguish between core system files and lighting controller files
- No clear separation of concerns
- Difficult to navigate and maintain

## Proposed Structure

```
controller/
├── src/
│   ├── main.ino                 # Main application entry point
│   ├── config.h                 # Global configuration
│   │
│   ├── core/                    # Core system functionality
│   │   ├── DeviceManager.h
│   │   ├── DeviceManager.cpp
│   │   ├── WiFiManager.h
│   │   ├── WiFiManager.cpp
│   │   └── WSClient.h
│   │   └── WSClient.cpp
│   │
│   └── lighting/                # Lighting system controllers
│       ├── LightManager.h
│       ├── LightManager.cpp
│       ├── LightController.h    # Base class
│       ├── LightController.cpp
│       │
│       └── controllers/         # Specific lighting implementations
│           ├── WS2812Controller.h
│           ├── WS2812Controller.cpp
│           ├── WLEDController.h
│           ├── WLEDController.cpp
│           ├── NanoleafController.h
│           └── NanoleafController.cpp
```

## Benefits

1. **Clear separation of concerns**: Core system vs lighting functionality
2. **Easier navigation**: Related files are grouped together
3. **Better maintainability**: Changes to lighting don't affect core system
4. **Scalability**: Easy to add new lighting controllers
5. **Cleaner includes**: More organized include paths

## Migration Steps

1. Create folder structure
2. Move files to appropriate locations
3. Update include paths in all files
4. Update PlatformIO configuration if needed
5. Test compilation

## Include Path Updates

- Core files: `#include "core/DeviceManager.h"`
- Lighting: `#include "lighting/LightManager.h"`
- Controllers: `#include "lighting/controllers/WS2812Controller.h"`
