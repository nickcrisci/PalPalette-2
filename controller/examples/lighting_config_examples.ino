/*
 * PalPalette Lighting System Configuration Examples
 *
 * This file shows examples of how to configure different lighting systems
 * in your PalPalette ESP32 device.
 */

#include "LightManager.h"

// Example: Configure Nanoleaf panels
void setupNanoleaf()
{
    LightManager lightManager;

    // Initialize the light manager
    lightManager.begin();

    // Configure for Nanoleaf
    // The auth token will be generated automatically during first setup
    bool success = lightManager.configure(
        "nanoleaf",      // System type
        "192.168.1.100", // IP address of Nanoleaf controller
        16021,           // Port (default Nanoleaf port)
        "",              // Auth token (empty for first setup)
        JsonObject()     // No custom config needed
    );

    if (success)
    {
        Serial.println("✅ Nanoleaf configured successfully!");

        // Trigger authentication (user must press button on Nanoleaf)
        Serial.println("🔐 Press and hold the power button on your Nanoleaf controller...");
        if (lightManager.authenticate())
        {
            Serial.println("✅ Nanoleaf authentication complete!");
        }
    }
}

// Example: Configure WLED LED strips
void setupWLED()
{
    LightManager lightManager;
    lightManager.begin();

    // Configure for WLED
    bool success = lightManager.configure(
        "wled",          // System type
        "192.168.1.101", // IP address of WLED device
        80,              // Port (default HTTP port)
        "",              // No auth token needed
        JsonObject()     // No custom config needed
    );

    if (success)
    {
        Serial.println("✅ WLED configured successfully!");

        // Test the connection
        if (lightManager.testConnection())
        {
            Serial.println("✅ WLED connection test passed!");
        }
    }
}

// Example: Configure WS2812B LED strip (direct connection)
void setupWS2812()
{
    LightManager lightManager;
    lightManager.begin();

    // Create custom configuration for WS2812
    DynamicJsonDocument config(256);
    config["ledPin"] = 2;         // GPIO pin connected to LED strip
    config["ledCount"] = 60;      // Number of LEDs in strip
    config["brightness"] = 200;   // Default brightness (0-255)
    config["colorOrder"] = "GRB"; // Color order for your specific LEDs

    // Configure for WS2812
    bool success = lightManager.configure(
        "ws2812",               // System type
        "",                     // No host address needed
        0,                      // No port needed
        "",                     // No auth token needed
        config.as<JsonObject>() // Custom configuration
    );

    if (success)
    {
        Serial.println("✅ WS2812 configured successfully!");

        // Test with a simple color display
        ColorPalette testPalette;
        testPalette.name = "Test Colors";
        testPalette.colorCount = 3;
        testPalette.colors[0] = {255, 0, 0}; // Red
        testPalette.colors[1] = {0, 255, 0}; // Green
        testPalette.colors[2] = {0, 0, 255}; // Blue

        lightManager.displayPalette(testPalette);
    }
}

// Example: Runtime system switching
void switchLightingSystem()
{
    LightManager lightManager;

    // Get list of supported systems
    String *systems = lightManager.getSupportedSystems();
    int count = lightManager.getSupportedSystemCount();

    Serial.println("🌈 Available lighting systems:");
    for (int i = 0; i < count; i++)
    {
        Serial.println("  " + String(i + 1) + ". " + systems[i]);
    }

    // Example: Switch to different system based on user input
    String selectedSystem = "wled"; // This could come from user input

    if (lightManager.createDefaultConfig(selectedSystem).systemType.length() > 0)
    {
        LightConfig defaultConfig = lightManager.createDefaultConfig(selectedSystem);

        // You would customize the config here based on user input
        defaultConfig.hostAddress = "192.168.1.102";

        lightManager.configure(
            defaultConfig.systemType,
            defaultConfig.hostAddress,
            defaultConfig.port,
            defaultConfig.authToken,
            defaultConfig.customConfig);
    }
}

// Example: Advanced configuration with error handling
void advancedConfiguration()
{
    LightManager lightManager;

    if (!lightManager.begin())
    {
        Serial.println("❌ Failed to initialize lighting system");
        return;
    }

    // Check current system
    String currentSystem = lightManager.getCurrentSystemType();
    if (currentSystem.length() > 0)
    {
        Serial.println("📋 Current system: " + currentSystem);

        // Get system status
        String status = lightManager.getStatus();
        Serial.println("📊 Status: " + status);

        // Get capabilities
        JsonObject caps = lightManager.getCapabilities();
        Serial.println("⚡ Capabilities:");
        serializeJsonPretty(caps, Serial);
    }
    else
    {
        Serial.println("⚠ No lighting system configured");
    }

    // Example of brightness control
    lightManager.setBrightness(128); // 50% brightness

    // Example of turning off all lights
    lightManager.turnOff();
}

// Example: Using the system in your main loop
void mainLoopExample()
{
    static LightManager lightManager;
    static bool initialized = false;

    if (!initialized)
    {
        if (lightManager.begin())
        {
            initialized = true;
            Serial.println("🌈 Lighting system ready!");
        }
        else
        {
            delay(5000); // Retry in 5 seconds
            return;
        }
    }

    // Handle lighting system updates
    lightManager.loop();

    // Example: Process incoming color palette
    // This would normally be called from WSClient when palette is received
    static unsigned long lastPaletteUpdate = 0;
    if (millis() - lastPaletteUpdate > 30000)
    { // Every 30 seconds
        lastPaletteUpdate = millis();

        // Create example palette
        ColorPalette palette;
        palette.name = "Demo Palette";
        palette.colorCount = 4;
        palette.colors[0] = {255, 100, 50}; // Orange
        palette.colors[1] = {100, 255, 50}; // Green
        palette.colors[2] = {50, 100, 255}; // Blue
        palette.colors[3] = {255, 50, 150}; // Pink

        lightManager.displayPalette(palette);
    }
}

// Example: Reset configuration (useful for troubleshooting)
void resetConfiguration()
{
    LightManager lightManager;

    Serial.println("🔄 Resetting lighting configuration...");
    lightManager.resetConfiguration();

    Serial.println("✅ Configuration reset complete");
    Serial.println("💡 Device will use default WS2812 settings on next boot");
    Serial.println("🔧 Connect to setup WiFi to reconfigure");
}
