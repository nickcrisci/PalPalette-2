#include "DeviceManager.h"
#include "config.h"
#include <HTTPClient.h>
#include <ArduinoJson.h>

DeviceManager::DeviceManager() : lastStatusUpdate(0)
{
}

void DeviceManager::begin()
{
    preferences.begin(DEVICE_PREF_NAMESPACE, false);

    // Load existing device info or generate new
    if (!loadDeviceInfo())
    {
        generateDeviceInfo();
        saveDeviceInfo();
    }

    Serial.println("📱 DeviceManager initialized");
    Serial.println("🆔 Device ID: " + deviceInfo.deviceId);
    Serial.println("📡 MAC Address: " + deviceInfo.macAddress);
    Serial.println("🔧 Firmware Version: " + deviceInfo.firmwareVersion);

    if (deviceInfo.isProvisioned)
    {
        Serial.println("✅ Device is provisioned");
    }
    else
    {
        Serial.println("⚠ Device needs provisioning");
        Serial.println("🔑 Pairing Code: " + deviceInfo.pairingCode);
    }
}

void DeviceManager::generateDeviceInfo()
{
    // Generate device ID from MAC address for consistency
    String macAddr = WiFi.macAddress();
    macAddr.replace(":", "");
    macAddr.toLowerCase();
    deviceInfo.deviceId = "esp32-" + macAddr;

    deviceInfo.macAddress = WiFi.macAddress();
    deviceInfo.firmwareVersion = FIRMWARE_VERSION;
    deviceInfo.isProvisioned = false;
    deviceInfo.isOnline = false;

    // Generate a simple 6-character pairing code based on MAC
    String pairingBase = macAddr.substring(6); // Last 6 chars of MAC
    deviceInfo.pairingCode = "";
    for (int i = 0; i < 6; i++)
    {
        char c = pairingBase[i];
        if (c >= '0' && c <= '9')
        {
            deviceInfo.pairingCode += c;
        }
        else
        {
            // Convert hex letters to numbers (A=1, B=2, etc.)
            deviceInfo.pairingCode += String((c >= 'A' ? c - 'A' + 1 : c - 'a' + 1) % 10);
        }
    }

    Serial.println("🔄 Generated new device info");
}

bool DeviceManager::saveDeviceInfo()
{
    preferences.putString(PREF_DEVICE_ID, deviceInfo.deviceId);
    preferences.putString(PREF_MAC_ADDRESS, deviceInfo.macAddress);
    preferences.putBool(PREF_IS_PROVISIONED, deviceInfo.isProvisioned);

    Serial.println("💾 Device info saved");
    return true;
}

bool DeviceManager::loadDeviceInfo()
{
    String savedDeviceId = preferences.getString(PREF_DEVICE_ID, "");

    if (savedDeviceId.length() == 0)
    {
        return false;
    }

    deviceInfo.deviceId = savedDeviceId;
    deviceInfo.macAddress = preferences.getString(PREF_MAC_ADDRESS, WiFi.macAddress());
    deviceInfo.isProvisioned = preferences.getBool(PREF_IS_PROVISIONED, false);
    deviceInfo.firmwareVersion = FIRMWARE_VERSION;
    deviceInfo.isOnline = false;

    // Regenerate pairing code if needed
    if (!deviceInfo.isProvisioned)
    {
        String macAddr = deviceInfo.macAddress;
        macAddr.replace(":", "");
        String pairingBase = macAddr.substring(6);
        deviceInfo.pairingCode = "";
        for (int i = 0; i < 6; i++)
        {
            char c = pairingBase[i];
            if (c >= '0' && c <= '9')
            {
                deviceInfo.pairingCode += c;
            }
            else
            {
                deviceInfo.pairingCode += String((c >= 'A' ? c - 'A' + 1 : c - 'a' + 1) % 10);
            }
        }
    }

    Serial.println("📂 Device info loaded from preferences");
    return true;
}

bool DeviceManager::registerWithServer(const String &serverUrl)
{
    if (serverUrl.length() == 0)
    {
        Serial.println("❌ No server URL provided for registration");
        return false;
    }

    // Convert WebSocket URL to HTTP URL for registration
    String httpUrl = serverUrl;
    httpUrl.replace("ws://", "http://");
    httpUrl.replace("wss://", "https://");

    // Remove port if it's the WebSocket port, add API endpoint
    int portIndex = httpUrl.lastIndexOf(':');
    if (portIndex > 7)
    { // After http://
        String baseUrl = httpUrl.substring(0, portIndex);
        httpUrl = baseUrl + ":3000/devices/register"; // Assume API is on port 3000
    }
    else
    {
        httpUrl += "/devices/register";
    }

    HTTPClient http;
    http.begin(httpUrl);
    http.addHeader("Content-Type", "application/json");

    // Prepare registration data
    JsonDocument doc;
    doc["macAddress"] = deviceInfo.macAddress;
    doc["deviceType"] = DEVICE_TYPE;
    doc["firmwareVersion"] = deviceInfo.firmwareVersion;

    // Update IP address
    deviceInfo.ipAddress = WiFi.localIP().toString();
    doc["ipAddress"] = deviceInfo.ipAddress;

    // Include lighting configuration if available
    Preferences lightingPrefs;
    lightingPrefs.begin(DEVICE_PREF_NAMESPACE, true);
    String lightingSystem = lightingPrefs.getString("lighting_system", "");

    Serial.println("🔍 DEBUG: Checking device preferences for lighting config...");
    Serial.println("  - lighting_system: '" + lightingSystem + "'");

    if (lightingSystem.length() > 0)
    {
        doc["lightingSystemType"] = lightingSystem;

        String lightingHost = lightingPrefs.getString("lighting_host", "");
        int lightingPort = lightingPrefs.getInt("lighting_port", 0);

        Serial.println("  - lighting_host: '" + lightingHost + "'");
        Serial.println("  - lighting_port: " + String(lightingPort));

        if (lightingHost.length() > 0)
        {
            doc["lightingHostAddress"] = lightingHost;
        }

        if (lightingPort > 0)
        {
            doc["lightingPort"] = lightingPort;
        }

        Serial.println("📡 Including lighting configuration in registration:");
        Serial.println("💡 System: " + lightingSystem);
        if (lightingHost.length() > 0)
        {
            Serial.println("🌐 Host: " + lightingHost + (lightingPort > 0 ? ":" + String(lightingPort) : ""));
        }
    }
    else
    {
        Serial.println("⚠ No lighting configuration found in device preferences");
    }
    lightingPrefs.end();

    String payload;
    serializeJson(doc, payload);

    Serial.println("📡 Registering device with server...");
    Serial.println("🌐 URL: " + httpUrl);
    Serial.println("📦 Payload: " + payload);

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode == 200 || httpResponseCode == 201)
    {
        String response = http.getString();
        Serial.println("✅ Device registered successfully!");
        // Only print first 200 chars of response to avoid memory issues
        if (response.length() > 200)
        {
            Serial.println("📨 Response: " + response.substring(0, 200) + "...");
        }
        else
        {
            Serial.println("📨 Response: " + response);
        }

        // Parse response to get device ID and pairing code
        JsonDocument responseDoc;
        if (deserializeJson(responseDoc, response) == DeserializationError::Ok)
        {
            if (responseDoc["id"].is<String>())
            {
                deviceInfo.deviceId = responseDoc["id"].as<String>();
                Serial.println("🆔 Server assigned Device ID: " + deviceInfo.deviceId);
            }
            if (responseDoc["pairingCode"].is<String>())
            {
                deviceInfo.pairingCode = responseDoc["pairingCode"].as<String>();
                Serial.println("🔑 Server assigned Pairing Code: " + deviceInfo.pairingCode);
            }
        }

        saveDeviceInfo();
        http.end();
        return true;
    }
    else
    {
        Serial.println("❌ Device registration failed");
        Serial.println("📊 HTTP Response Code: " + String(httpResponseCode));
        if (httpResponseCode > 0)
        {
            Serial.println("📨 Response: " + http.getString());
        }
        http.end();
        return false;
    }
}

bool DeviceManager::updateStatus(const String &serverUrl)
{
    if (serverUrl.length() == 0 || deviceInfo.deviceId.length() == 0)
    {
        return false;
    }

    // Convert WebSocket URL to HTTP URL for status update
    String httpUrl = serverUrl;
    httpUrl.replace("ws://", "http://");
    httpUrl.replace("wss://", "https://");

    int portIndex = httpUrl.lastIndexOf(':');
    if (portIndex > 7)
    {
        String baseUrl = httpUrl.substring(0, portIndex);
        httpUrl = baseUrl + ":3000/devices/" + deviceInfo.deviceId + "/status";
    }
    else
    {
        httpUrl += "/devices/" + deviceInfo.deviceId + "/status";
    }

    HTTPClient http;
    http.begin(httpUrl);
    http.addHeader("Content-Type", "application/json");

    JsonDocument doc;
    doc["isOnline"] = true;
    doc["ipAddress"] = WiFi.localIP().toString();
    doc["firmwareVersion"] = deviceInfo.firmwareVersion;
    doc["freeHeap"] = ESP.getFreeHeap();
    doc["uptime"] = millis();

    String payload;
    serializeJson(doc, payload);

    int httpResponseCode = http.PUT(payload);
    http.end();

    if (httpResponseCode == 200)
    {
        markStatusUpdated();
        return true;
    }

    return false;
}

void DeviceManager::setProvisioned(bool provisioned)
{
    deviceInfo.isProvisioned = provisioned;
    preferences.putBool(PREF_IS_PROVISIONED, provisioned);

    if (provisioned)
    {
        Serial.println("✅ Device marked as provisioned");
    }
    else
    {
        Serial.println("⚠ Device marked as not provisioned");
    }
}

bool DeviceManager::isProvisioned()
{
    return deviceInfo.isProvisioned;
}

String DeviceManager::getDeviceId()
{
    return deviceInfo.deviceId;
}

String DeviceManager::getMacAddress()
{
    return deviceInfo.macAddress;
}

String DeviceManager::getPairingCode()
{
    return deviceInfo.pairingCode;
}

DeviceInfo DeviceManager::getDeviceInfo()
{
    return deviceInfo;
}

void DeviceManager::resetDevice()
{
    Serial.println("🔄 Resetting device...");

    // Clear all stored data
    preferences.clear();

    // Regenerate device info
    generateDeviceInfo();
    saveDeviceInfo();

    Serial.println("✅ Device reset complete");
    Serial.println("🆔 New Device ID: " + deviceInfo.deviceId);
    Serial.println("🔑 New Pairing Code: " + deviceInfo.pairingCode);
}

bool DeviceManager::shouldUpdateStatus()
{
    return (millis() - lastStatusUpdate) > STATUS_UPDATE_INTERVAL;
}

void DeviceManager::markStatusUpdated()
{
    lastStatusUpdate = millis();
}

void DeviceManager::setOnlineStatus(bool online)
{
    deviceInfo.isOnline = online;
}

bool DeviceManager::isOnline()
{
    return deviceInfo.isOnline;
}
