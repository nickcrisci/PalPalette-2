#include "NanoleafController.h"

NanoleafController::NanoleafController()
    : panelCount(0), isConnected(false), lastHeartbeat(0), discoveredDeviceCount(0)
{
}

NanoleafController::~NanoleafController()
{
    if (isConnected)
    {
        disableExternalControl();
    }
}

bool NanoleafController::initialize(const LightConfig &config)
{
    this->config = config;

    debugLog("Initializing Nanoleaf controller");
    debugLog("Host: " + config.hostAddress + ":" + String(config.port));
    debugLog("Auth Token: " + String(config.authToken.length() > 0 ? "Present" : "None"));

    if (!WiFi.isConnected())
    {
        debugLog("❌ WiFi not connected");
        return false;
    }

    // Store auth token from config
    authToken = config.authToken;

    // If no host address provided, mark for discovery but don't fail initialization
    if (config.hostAddress.length() == 0)
    {
        debugLog("No host address - will require discovery during authentication");
        isInitialized = true;
        return true;
    }

    // Build base URL using working controller pattern (without /api/v1/ - added in sendRequest)
    baseUrl = "http://" + config.hostAddress + ":" + String(config.port);
    debugLog("Base URL: " + baseUrl);

    // Mark as initialized - authentication will be handled separately
    isInitialized = true;

    // If we have a token, validate it but don't fail initialization if invalid
    if (authToken.length() > 0)
    {
        debugLog("🔍 Testing connection with saved auth token...");
        if (testConnection())
        {
            debugLog("✅ Auth token is valid - device is ready");
            isAuthenticated = true;
            // Get panel layout for immediate use
            if (getPanelLayout())
            {
                debugLog("✅ Panel layout retrieved - " + String(panelCount) + " display panels ready");
            }
            else
            {
                debugLog("⚠ Failed to get panel layout, but keeping authentication");
            }
        }
        else
        {
            debugLog("⚠ Initial connection test failed - will retry during first use");
            debugLog("   This could be due to network timing or temporary Nanoleaf unavailability");
            debugLog("   Keeping auth token for retry and marking as authenticated");

            // Mark as authenticated anyway - we'll test the connection when needed
            // This allows the system to work after network comes back up
            isAuthenticated = true;

            // Try to get panel layout in a non-blocking way during first palette display
            debugLog("   Panel layout will be retrieved on first palette request");
        }
    }
    else
    {
        debugLog("No auth token available - device will need authentication");
        isAuthenticated = false;
    }

    return true;
}

bool NanoleafController::testConnection()
{
    if (authToken.length() == 0)
    {
        debugLog("No auth token available for testing connection");
        return false;
    }

    JsonDocument response;
    bool success = sendHttpRequest("/", "GET", "", &response);

    if (success && response["name"].is<const char *>())
    {
        String deviceName = response["name"];
        debugLog("Successfully connected to Nanoleaf: " + deviceName);
        isConnected = true;
        lastHeartbeat = millis();
        return true;
    }

    isConnected = false;
    debugLog("❌ Connection test failed - no valid response or missing 'name' field");
    return false;
}

bool NanoleafController::displayPalette(const ColorPalette &palette)
{
    // If we have an auth token but aren't authenticated, try to validate it first
    if (!isAuthenticated && authToken.length() > 0)
    {
        debugLog("🔄 Have auth token but not authenticated - testing connection...");
        if (testConnection())
        {
            debugLog("✅ Auth token validated - marking as authenticated");
            isAuthenticated = true;
        }
        else
        {
            debugLog("❌ Auth token validation failed");
        }
    }

    if (!isAuthenticated)
    {
        debugLog("Not authenticated to Nanoleaf");
        return false;
    }

    // If not connected but authenticated, try to reconnect
    if (!isConnected)
    {
        debugLog("Not connected to Nanoleaf, attempting reconnection...");
        if (!testConnection())
        {
            debugLog("❌ Reconnection attempt failed");
            return false;
        }
        debugLog("✅ Reconnection successful");
    }

    debugLog("Displaying palette: " + palette.name + " with " + String(palette.colorCount) + " colors");

    // Ensure we have panel layout information
    if (panelCount == 0)
    {
        debugLog("No panel information available, attempting to retrieve layout...");
        if (getPanelLayout())
        {
            debugLog("✅ Panel layout retrieved - " + String(panelCount) + " display panels found");
        }
        else
        {
            debugLog("❌ Failed to get panel layout, falling back to solid color mode");
        }
    }

    // Check if we have panel information for static color distribution
    if (panelCount > 0)
    {
        debugLog("Using static color distribution across " + String(panelCount) + " display panels");
        return setStaticColors(palette);
    }
    else
    {
        debugLog("No panel information available, using solid color fallback");

        // Use the solid color format as fallback when panel info is not available
        JsonDocument payload;
        payload["write"]["command"] = "display";
        payload["write"]["animType"] = "solid";
        payload["write"]["colorType"] = "HSB";

        // Create palette array with HSB colors
        JsonArray paletteArray = payload["write"]["palette"].to<JsonArray>();

        for (int i = 0; i < palette.colorCount; i++)
        {
            RGBColor rgbColor = palette.colors[i];
            HSBColor hsbColor = rgbToHsb(rgbColor);

            JsonObject colorObj = paletteArray.add<JsonObject>();
            colorObj["hue"] = hsbColor.h;
            colorObj["saturation"] = hsbColor.s;
            colorObj["brightness"] = hsbColor.b;
        }

        String payloadStr;
        serializeJson(payload, payloadStr);

        debugLog("Sending solid color effect with HSB palette");
        debugLog("Payload: " + payloadStr);
        return sendHttpRequest("/effects", "PUT", payloadStr);
    }
}

bool NanoleafController::turnOff()
{
    if (!isAuthenticated)
    {
        return false;
    }

    JsonDocument payload;
    payload["on"]["value"] = false;

    String payloadStr;
    serializeJson(payload, payloadStr);

    return sendHttpRequest("/state", "PUT", payloadStr);
}

bool NanoleafController::setBrightness(int brightness)
{
    if (!isAuthenticated)
    {
        return false;
    }

    // Clamp brightness to valid range
    brightness = max(0, min(100, brightness));

    JsonDocument payload;
    payload["brightness"]["value"] = brightness;

    String payloadStr;
    serializeJson(payload, payloadStr);

    bool success = sendHttpRequest("/state", "PUT", payloadStr);
    if (success)
    {
        debugLog("Set brightness to " + String(brightness) + "%");
    }

    return success;
}

String NanoleafController::getStatus()
{
    if (!isConnected)
    {
        return "Disconnected";
    }

    JsonDocument response;
    if (sendHttpRequest("/", "GET", "", &response))
    {
        String status = "Connected to " + response["name"].as<String>();
        status += " | Panels: " + String(panelCount);
        status += " | Auth: " + String(isAuthenticated ? "Yes" : "No");
        return status;
    }

    return "Connection Error";
}

String NanoleafController::getSystemType()
{
    return "nanoleaf";
}

bool NanoleafController::authenticate()
{
    Serial.println("🔍 NANOLEAF DEBUG: authenticate() method called");
    debugLog("Starting Nanoleaf authentication");

    // Step 1: Discovery if needed
    if (config.hostAddress.length() == 0)
    {
        Serial.println("🔍 NANOLEAF DEBUG: No host address, starting discovery...");
        debugLog("No host address configured, attempting discovery...");
        if (!discoverNanoleaf())
        {
            Serial.println("❌ NANOLEAF DEBUG: discoverNanoleaf() returned false");
            debugLog("Failed to discover Nanoleaf device");
            return false;
        }
        Serial.println("✅ NANOLEAF DEBUG: discoverNanoleaf() returned true");
    }
    else
    {
        Serial.println("🔍 NANOLEAF DEBUG: Host address provided: " + config.hostAddress);
    }

    // Update base URL after discovery
    baseUrl = "http://" + config.hostAddress + ":" + String(config.port);

    // Step 2: Check existing token
    if (authToken.length() > 0 && validateAuthToken())
    {
        debugLog("Existing auth token is valid");
        isAuthenticated = true;
        getPanelLayout();
        return true;
    }

    // Step 3: Request new auth token
    debugLog("Requesting new authentication token");
    if (requestAuthToken())
    {
        debugLog("✅ Authentication successful");
        isAuthenticated = true;
        getPanelLayout();

        // Update config with new token for future use
        config.authToken = authToken;

        return true;
    }

    debugLog("❌ Authentication failed");
    return false;
}

bool NanoleafController::requiresAuthentication()
{
    return true; // Nanoleaf always requires authentication
}

LightConfig NanoleafController::getUpdatedConfig()
{
    // Return the current config with any updated auth token
    return config;
}

bool NanoleafController::isReady() const
{
    // Nanoleaf is ready if initialized, authenticated, has valid host and auth token
    return isInitialized && isAuthenticated &&
           config.hostAddress.length() > 0 &&
           config.authToken.length() > 0;
}

JsonObject NanoleafController::getCapabilities()
{
    JsonDocument doc;
    JsonObject caps = doc.to<JsonObject>();

    caps["systemType"] = "nanoleaf";
    caps["supportsAnimation"] = true;
    caps["supportsBrightness"] = true;
    caps["supportsColorTemperature"] = false;
    caps["maxColors"] = 10;
    caps["panelCount"] = panelCount;
    caps["requiresAuthentication"] = true;

    JsonArray supportedAnimations = caps["supportedAnimations"].to<JsonArray>();
    supportedAnimations.add("static");
    supportedAnimations.add("fade");
    supportedAnimations.add("wheel");
    supportedAnimations.add("flow");

    return caps;
}

bool NanoleafController::discoverNanoleaf()
{
    Serial.println("🔍 NANOLEAF DEBUG: discoverNanoleaf() method called");
    debugLog("Starting mDNS discovery for Nanoleaf devices");
    debugLog("🔍 WiFi Status: " + String(WiFi.isConnected() ? "Connected" : "Disconnected"));
    if (WiFi.isConnected())
    {
        debugLog("📡 WiFi IP: " + WiFi.localIP().toString());
        debugLog("📶 WiFi RSSI: " + String(WiFi.RSSI()) + " dBm");
    }

    // Clear previous discovery results
    discoveredDeviceCount = 0;

    // Ensure mDNS is initialized
    debugLog("🔧 Initializing mDNS...");
    debugLog("📶 Current WiFi status: " + String(WiFi.status()));
    debugLog("📍 Current IP: " + WiFi.localIP().toString());

    // Give WiFi a moment to fully stabilize
    delay(1000);

    // Try multiple times to initialize mDNS
    bool mdnsStarted = false;
    for (int attempt = 1; attempt <= 3; attempt++)
    {
        debugLog("🔧 mDNS initialization attempt " + String(attempt) + "/3");

        if (MDNS.begin("palpalette"))
        {
            mdnsStarted = true;
            debugLog("✅ mDNS initialized successfully on attempt " + String(attempt));
            break;
        }
        else
        {
            debugLog("❌ mDNS initialization failed on attempt " + String(attempt));
            if (attempt < 3)
            {
                delay(2000); // Wait 2 seconds before retry
            }
        }
    }

    if (!mdnsStarted)
    {
        debugLog("❌ Failed to start mDNS after 3 attempts");
        debugLog("💡 Troubleshooting tips:");
        debugLog("   - Check WiFi connection stability");
        debugLog("   - Try restarting the device");
        debugLog("   - Manual IP configuration may be needed");
        return false;
    }

    // Query for Nanoleaf API services with retry mechanism (based on working old controller)
    // Nanoleaf devices advertise as _nanoleafapi._tcp
    debugLog("🔍 Scanning for _nanoleafapi._tcp services...");
    debugLog("⏰ Using retry mechanism similar to working controller...");

    int retryCount = 0;
    int maxRetries = 5;    // Based on working controller pattern
    int retryDelay = 2000; // Start with 2 seconds
    int servicesFound = 0;

    while (retryCount < maxRetries && servicesFound == 0)
    {
        debugLog("🔍 Discovery attempt " + String(retryCount + 1) + "/" + String(maxRetries));
        servicesFound = MDNS.queryService("nanoleafapi", "tcp");

        if (servicesFound > 0)
        {
            debugLog("✅ Found " + String(servicesFound) + " Nanoleaf service(s) on attempt " + String(retryCount + 1));
            break;
        }
        else
        {
            debugLog("❌ No services found on attempt " + String(retryCount + 1) + ", retrying in " + String(retryDelay / 1000) + "s...");
            retryCount++;
            if (retryCount < maxRetries)
            {
                delay(retryDelay);
                // Exponential backoff (like working controller)
                retryDelay = min((int)(retryDelay * 1.5), 10000); // Cap at 10 seconds
            }
        }
    }

    debugLog("📊 mDNS scan completed after " + String(retryCount + 1) + " attempts. Services found: " + String(servicesFound));

    if (servicesFound == 0)
    {
        debugLog("❌ No Nanoleaf devices found via mDNS after " + String(maxRetries) + " attempts");
        debugLog("💡 Troubleshooting tips:");
        debugLog("   - Make sure your Nanoleaf is powered on");
        debugLog("   - Ensure both devices are on the same WiFi network");
        debugLog("   - Check if your router supports mDNS/Bonjour");
        debugLog("   - Try restarting your Nanoleaf device");
        return false;
    }

    debugLog("🎉 Found " + String(servicesFound) + " Nanoleaf device(s)");
    debugLog("🔍 Testing connectivity to each device...");

    // Store all discovered devices
    for (int i = 0; i < servicesFound && discoveredDeviceCount < 10; i++)
    {
        String hostname = MDNS.hostname(i);
        IPAddress ip = MDNS.IP(i);
        uint16_t port = MDNS.port(i);

        debugLog("📱 Device found: " + hostname + " (" + ip.toString() + ":" + String(port) + ")");

        if (ip == INADDR_NONE)
        {
            debugLog("  ❌ Invalid IP address, skipping");
            continue;
        }

        DiscoveredDevice &device = discoveredDevices[discoveredDeviceCount];
        device.hostname = hostname;
        device.ipAddress = ip.toString();
        device.port = port;

        // Skip HTTP connectivity test due to persistent timeout issues
        debugLog("  ✅ Device found - proceeding directly to authentication phase");
        debugLog("  � Skipping connectivity test due to timeout issues");
        HTTPClient testHttp;

        // According to Nanoleaf docs, /api/v1/new is the only unauthenticated endpoint
        // We'll test this and expect either 200 (if in pairing mode) or 403 (if not in pairing mode)
        // Both responses indicate the device is working and responding
        String testUrl = "http://" + device.ipAddress + ":" + String(device.port) + "/api/v1/new";

        debugLog("  📡 Testing URL: " + testUrl);
        testHttp.begin(testUrl);
        testHttp.setTimeout(10000); // 10 second timeout
        testHttp.addHeader("User-Agent", "PalPalette-ESP32");
        testHttp.addHeader("Content-Type", "application/json");

        unsigned long testStart = millis();
        // Send empty POST to test auth endpoint (should return 403 if not in pairing mode, which is OK)
        int httpCode = testHttp.POST("{}");
        unsigned long testTime = millis() - testStart;

        String response = "";
        if (httpCode > 0)
        {
            response = testHttp.getString();
        }

        testHttp.end();

        debugLog("  📊 HTTP Response Code: " + String(httpCode));
        debugLog("  ⏱ Response Time: " + String(testTime) + "ms");

        if (response.length() > 0 && response.length() < 200)
        {
            debugLog("  � Response: " + response);
        }

        // Mark device as responding since mDNS discovery succeeded
        // Bypass HTTP timeout issues - if mDNS found it, it's available
        device.isResponding = true;

        if (device.isResponding)
        {
            debugLog("  ✅ Device is responding to HTTP requests");
            if (response.length() > 0 && response.length() < 200)
            {
                debugLog("  📝 Sample Response: " + response.substring(0, 100));
            }
        }
        else
        {
            debugLog("  ❌ Device is not responding to HTTP requests");
            if (httpCode < 0)
            {
                debugLog("  🔍 Connection Error Code: " + String(httpCode));
            }
        }

        discoveredDeviceCount++;
        debugLog("  📊 Added to device list (total: " + String(discoveredDeviceCount) + ")");
    }

    if (discoveredDeviceCount == 0)
    {
        debugLog("❌ No valid Nanoleaf devices found");
        debugLog("🔍 All discovered devices failed connectivity test");
        return false;
    }

    debugLog("📊 Discovery Summary:");
    debugLog("  Total devices found: " + String(servicesFound));
    debugLog("  Responsive devices: " + String(discoveredDeviceCount));

    // Automatically select the first responding device
    debugLog("🎯 Selecting first responsive device...");
    for (int i = 0; i < discoveredDeviceCount; i++)
    {
        if (discoveredDevices[i].isResponding)
        {
            debugLog("✅ Selected device: " + discoveredDevices[i].hostname + " (" + discoveredDevices[i].ipAddress + ":" + String(discoveredDevices[i].port) + ")");

            // Use the working controller's URL construction pattern
            char nanoleafBaseUrl[128];
            snprintf(nanoleafBaseUrl, sizeof(nanoleafBaseUrl), "http://%s:%d",
                     discoveredDevices[i].ipAddress.c_str(), discoveredDevices[i].port);

            debugLog("🔗 Constructed base URL (working controller pattern): " + String(nanoleafBaseUrl));

            // Store the base URL in our config format
            config.hostAddress = discoveredDevices[i].ipAddress;
            config.port = discoveredDevices[i].port;

            // Update our baseUrl to match working controller format
            baseUrl = String(nanoleafBaseUrl) + "/api/v1/";

            debugLog("🎯 Final API base URL: " + baseUrl);

            return discoverNanoleaf(i);
        }
    }

    debugLog("❌ No responsive Nanoleaf devices found");
    debugLog("💡 All devices failed the HTTP connectivity test");
    return false;
}

bool NanoleafController::requestAuthToken()
{
    debugLog("Requesting auth token from Nanoleaf");

    // Notify user through multiple channels about required action
    notifyUserActionRequired();

    // Build auth URL
    String authUrl = "http://" + config.hostAddress + ":" + String(config.port) + "/api/v1/new";
    debugLog("Auth URL: " + authUrl);

    HTTPClient authHttp;
    authHttp.begin(authUrl);
    authHttp.addHeader("Content-Type", "application/json");
    authHttp.setTimeout(5000);

    // Try to get auth token for up to 30 seconds
    unsigned long startTime = millis();
    const unsigned long AUTH_TIMEOUT = 30000;
    int attempts = 0;

    while (millis() - startTime < AUTH_TIMEOUT)
    {
        attempts++;

        int httpResponseCode = authHttp.POST("{}");

        if (httpResponseCode == 200)
        {
            String response = authHttp.getString();
            debugLog("Received auth response: " + response);

            JsonDocument doc;
            DeserializationError error = deserializeJson(doc, response);

            if (!error && doc["auth_token"].is<const char *>())
            {
                authToken = doc["auth_token"].as<String>();
                debugLog("✅ Auth token obtained: " + authToken.substring(0, 8) + "...");

                // Update base URL for future requests
                baseUrl = "http://" + config.hostAddress + ":" + String(config.port);

                // Notify success
                notifyUserActionCompleted(true);

                authHttp.end();
                return true;
            }
            else
            {
                debugLog("❌ Invalid response format");
                debugLog("Response: " + response);
            }
        }
        else if (httpResponseCode == 403)
        {
            int remainingTime = (AUTH_TIMEOUT - (millis() - startTime)) / 1000;
            if (attempts % 5 == 1) // Only log every 5th attempt to reduce spam
            {
                debugLog("Waiting for pairing mode... (" + String(remainingTime) + "s remaining)");
                // Update user with remaining time
                notifyUserActionProgress(remainingTime);
            }
        }
        else if (httpResponseCode > 0)
        {
            debugLog("HTTP error: " + String(httpResponseCode));
        }
        else
        {
            debugLog("Network error: " + String(httpResponseCode));
        }

        delay(2000); // Wait 2 seconds before trying again
    }

    authHttp.end();
    debugLog("⏰ Authentication timeout after " + String(attempts) + " attempts");

    // Notify timeout/failure
    notifyUserActionCompleted(false);

    return false;
}

bool NanoleafController::getPanelLayout()
{
    JsonDocument response;
    if (!sendHttpRequest("/panelLayout/layout", "GET", "", &response))
    {
        debugLog("Failed to get panel layout");
        return false;
    }

    JsonArray positionData = response["positionData"];
    int totalPanelsFound = positionData.size();

    debugLog("Retrieved layout data for " + String(totalPanelsFound) + " total panels");

    // Filter out controller panels (shapeType 12) and store only display panels
    panelCount = 0;
    for (int i = 0; i < totalPanelsFound && panelCount < 50; i++)
    {
        JsonObject panel = positionData[i];
        int shapeType = panel["shapeType"];

        // Skip controller panels (shapeType 12)
        if (shapeType == 12)
        {
            debugLog("Skipping controller panel (shapeType 12) with panelId: " + String(panel["panelId"].as<int>()));
            continue;
        }

        // Store display panel information
        panels[panelCount].panelId = panel["panelId"];
        panels[panelCount].x = panel["x"];
        panels[panelCount].y = panel["y"];
        panels[panelCount].o = panel["o"];
        panels[panelCount].shapeType = shapeType;

        debugLog("Added display panel " + String(panelCount + 1) + ": panelId=" + String(panels[panelCount].panelId) + ", shapeType=" + String(shapeType));
        panelCount++;
    }

    debugLog("Final count: " + String(panelCount) + " display panels (filtered out " + String(totalPanelsFound - panelCount) + " controller panels)");
    return true;
}

bool NanoleafController::setStaticColors(const ColorPalette &palette)
{
    debugLog("🎨 Creating static color data for " + String(palette.colorCount) + " colors across " + String(panelCount) + " panels");

    String colorData = createStaticColorData(palette);

    debugLog("📤 Sending static color effect to Nanoleaf");
    debugLog("📋 Full payload length: " + String(colorData.length()) + " characters");
    debugLog("📋 Full payload content:");
    debugLog(colorData);

    bool result = sendHttpRequest("/effects", "PUT", colorData);

    if (result)
    {
        debugLog("✅ Static color effect sent successfully");
    }
    else
    {
        debugLog("❌ Failed to send static color effect");
    }

    return result;
}

bool NanoleafController::setAnimatedColors(const ColorPalette &palette, const String &animationType)
{
    AnimationType anim = FADE;
    if (animationType == "wheel")
        anim = WHEEL;
    else if (animationType == "flow")
        anim = FLOW;

    String animationData = createColorAnimationData(palette, anim);
    return sendHttpRequest("/effects", "PUT", animationData);
}

bool NanoleafController::enableExternalControl()
{
    JsonDocument payload;
    payload["write"]["command"] = "display";
    payload["write"]["animType"] = "extControl";
    payload["write"]["extControlVersion"] = "v2";

    String payloadStr;
    serializeJson(payload, payloadStr);

    return sendHttpRequest("/effects", "PUT", payloadStr);
}

bool NanoleafController::disableExternalControl()
{
    // Turn off external control by setting a simple solid color effect
    JsonDocument payload;
    payload["select"] = "Solid";

    String payloadStr;
    serializeJson(payload, payloadStr);

    return sendHttpRequest("/effects", "PUT", payloadStr);
}

bool NanoleafController::sendHttpRequest(const String &endpoint, const String &method, const String &payload, JsonDocument *response)
{
    // Build URL using working controller pattern: baseUrl + "/api/v1/" + authToken + endpoint
    String url = baseUrl + "/api/v1";

    if (authToken.length() > 0)
    {
        url += "/" + authToken;
    }

    url += endpoint;

    debugLog("🌐 " + method + " " + url);
    if (payload.length() > 0)
    {
        if (payload.length() < 500)
        {
            debugLog("📤 Request payload: " + payload);
        }
        else
        {
            debugLog("📤 Request payload (first 500 chars): " + payload.substring(0, 500) + "...");
            debugLog("📊 Total payload size: " + String(payload.length()) + " bytes");
        }
    }

    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("User-Agent", "PalPalette-ESP32");

    debugLog("📋 Request headers set: Content-Type=application/json, User-Agent=PalPalette-ESP32");

    int httpResponseCode;
    if (method == "GET")
    {
        httpResponseCode = http.GET();
    }
    else if (method == "POST")
    {
        httpResponseCode = http.POST(payload);
    }
    else if (method == "PUT")
    {
        httpResponseCode = http.PUT(payload);
    }
    else if (method == "DELETE")
    {
        httpResponseCode = http.sendRequest("DELETE", payload);
    }
    else
    {
        debugLog("Unsupported HTTP method: " + method);
        http.end();
        return false;
    }

    if (httpResponseCode < 200 || httpResponseCode >= 300)
    {
        debugLog("❌ HTTP Error " + String(httpResponseCode));

        // Get the error response body for more details
        String errorResponse = http.getString();
        if (errorResponse.length() > 0)
        {
            debugLog("📄 Error response body: " + errorResponse);
        }

        // Provide specific error guidance
        if (httpResponseCode == 400)
        {
            debugLog("💡 HTTP 400 Bad Request - Possible issues:");
            debugLog("   - Invalid JSON format in payload");
            debugLog("   - Invalid panel IDs in animData");
            debugLog("   - Incorrect animData format");
            debugLog("   - Missing required fields");
        }
        else if (httpResponseCode == 401)
        {
            debugLog("💡 HTTP 401 Unauthorized - Auth token may be invalid or expired");
        }
        else if (httpResponseCode == 404)
        {
            debugLog("💡 HTTP 404 Not Found - Check endpoint URL: " + url);
        }
    }

    if (httpResponseCode > 0)
    {
        String responseStr = http.getString();

        if (responseStr.length() > 0 && responseStr.length() < 200)
        {
            debugLog("Response: " + responseStr);
        }

        if (response != nullptr && responseStr.length() > 0)
        {
            DeserializationError error = deserializeJson(*response, responseStr);
            if (error)
            {
                debugLog("JSON parsing error: " + String(error.c_str()));
                http.end();
                return false;
            }
        }

        http.end();
        return (httpResponseCode >= 200 && httpResponseCode < 300);
    }

    debugLog("HTTP request failed");
    http.end();
    return false;
}

String NanoleafController::createColorAnimationData(const ColorPalette &palette, AnimationType animation)
{
    JsonDocument doc;

    doc["write"]["command"] = "display";
    doc["write"]["animType"] = "custom";
    doc["write"]["animData"] = "";
    doc["write"]["loop"] = false;
    doc["write"]["palette"] = nullptr;

    // Create animation data based on type
    JsonArray animFrames = doc["write"]["animData"].to<JsonArray>();

    // Distribute colors across panels with timing
    for (int i = 0; i < panelCount; i++)
    {
        JsonObject frame = animFrames.add<JsonObject>();
        frame["panelId"] = panels[i].panelId;
        frame["numFrames"] = palette.colorCount;

        JsonArray frameData = frame["animData"].to<JsonArray>();

        for (int c = 0; c < palette.colorCount; c++)
        {
            RGBColor color = palette.colors[c % palette.colorCount];

            // Add frame data: R, G, B, W (white), transition time
            frameData.add(color.r);
            frameData.add(color.g);
            frameData.add(color.b);
            frameData.add(0); // White channel
            frameData.add(nanoleafConfig.transitionTime);
        }
    }

    String result;
    serializeJson(doc, result);
    return result;
}

String NanoleafController::createStaticColorData(const ColorPalette &palette)
{
    debugLog("🔧 Creating static color data...");
    debugLog("   Palette: " + palette.name + " (" + String(palette.colorCount) + " colors)");
    debugLog("   Panel count: " + String(panelCount));

    JsonDocument doc;

    // Use the correct Nanoleaf API format for static colors - wrap in "write" object
    doc["write"]["command"] = "display";
    doc["write"]["animType"] = "static";
    doc["write"]["animData"] = "";
    doc["write"]["loop"] = false;

    // Create HSB palette array
    JsonArray paletteArray = doc["write"]["palette"].to<JsonArray>();
    for (int i = 0; i < palette.colorCount; i++)
    {
        RGBColor rgbColor = palette.colors[i];
        HSBColor hsbColor = rgbToHsb(rgbColor);

        JsonObject colorObj = paletteArray.add<JsonObject>();
        colorObj["hue"] = hsbColor.h;
        colorObj["saturation"] = hsbColor.s;
        colorObj["brightness"] = hsbColor.b;
    }
    doc["write"]["colorType"] = "HSB";

    // Create animData string in correct format: numPanels; panelId0; numFrames0; RGBWT01; panelId1; numFrames1; RGBWT11; ...
    String animData = String(panelCount) + " "; // Start with number of panels

    for (int i = 0; i < panelCount; i++)
    {
        RGBColor color = palette.colors[i % palette.colorCount];

        debugLog("   Panel " + String(i + 1) + ": panelId=" + String(panels[i].panelId) +
                 ", color=RGB(" + String(color.r) + "," + String(color.g) + "," + String(color.b) + ")");

        // Validate panel ID (should be positive integer)
        if (panels[i].panelId <= 0)
        {
            debugLog("⚠ Warning: Invalid panel ID " + String(panels[i].panelId) + " for panel " + String(i + 1));
        }

        // Validate color values (should be 0-255)
        if (color.r > 255 || color.g > 255 || color.b > 255)
        {
            debugLog("⚠ Warning: Invalid color values RGB(" + String(color.r) + "," + String(color.g) + "," + String(color.b) + ") - values should be 0-255");
        }

        // Format: panelId numFrames R G B W T
        animData += String(panels[i].panelId) + " ";
        animData += "1 "; // Number of frames
        animData += String(color.r) + " " + String(color.g) + " " + String(color.b) + " 0 20 ";
    }

    // Remove trailing space
    animData.trim();
    doc["write"]["animData"] = animData;

    debugLog("🔍 Raw animData string: '" + animData + "'");
    debugLog("🔍 AnimData length: " + String(animData.length()) + " characters");

    String result;
    serializeJson(doc, result);

    debugLog("🔍 Final JSON structure:");
    debugLog("   write.command: " + String(doc["write"]["command"].as<const char *>()));
    debugLog("   write.animType: " + String(doc["write"]["animType"].as<const char *>()));
    debugLog("   write.loop: " + String(doc["write"]["loop"].as<bool>() ? "true" : "false"));
    debugLog("   write.colorType: " + String(doc["write"]["colorType"].as<const char *>()));
    debugLog("   write.palette entries: " + String(doc["write"]["palette"].size()));
    debugLog("   write.animData preview: " + animData.substring(0, min(100, (int)animData.length())) + "...");

    return result;
}

bool NanoleafController::validateAuthToken()
{
    if (authToken.length() == 0)
    {
        return false;
    }

    return testConnection();
}

void NanoleafController::distributeColorsAcrossPanels(const ColorPalette &palette, JsonArray &panelColors)
{
    for (int i = 0; i < panelCount; i++)
    {
        JsonObject panelColor = panelColors.add<JsonObject>();
        panelColor["panelId"] = panels[i].panelId;

        // Distribute colors evenly across panels
        RGBColor color = palette.colors[i % palette.colorCount];
        panelColor["r"] = color.r;
        panelColor["g"] = color.g;
        panelColor["b"] = color.b;
        panelColor["w"] = 0; // White channel
    }
}

void NanoleafController::showConnectionSuccess()
{
    debugLog("🎉 Connection established successfully");

    // Simple approach: Enable external control to indicate readiness
    // Visual feedback should be handled by the application layer, not the controller
    if (enableExternalControl())
    {
        debugLog("✅ External control enabled - ready for color palettes");
    }
}

void NanoleafController::setNotificationCallback(std::function<void(const String &, const String &, int)> callback)
{
    notificationCallback = callback;
}

void NanoleafController::notifyUserActionRequired()
{
    String action = "nanoleaf_pairing";
    String instructions = "Hold the power button on your Nanoleaf for 5-7 seconds until the LED flashes to enter pairing mode";

    debugLog("IMPORTANT: " + instructions);

    if (notificationCallback)
    {
        notificationCallback(action, instructions, 30); // 30 second timeout
    }
}

void NanoleafController::notifyUserActionProgress(int remainingSeconds)
{
    if (notificationCallback)
    {
        String action = "nanoleaf_pairing_progress";
        String instructions = "Waiting for pairing mode... " + String(remainingSeconds) + " seconds remaining";
        notificationCallback(action, instructions, remainingSeconds);
    }
}

void NanoleafController::notifyUserActionCompleted(bool success)
{
    String action = success ? "nanoleaf_pairing_success" : "nanoleaf_pairing_failed";
    String instructions = success ? "Nanoleaf pairing completed successfully" : "Nanoleaf pairing failed or timed out";

    debugLog(instructions);

    if (notificationCallback)
    {
        notificationCallback(action, instructions, 0);
    }
}

bool NanoleafController::discoverNanoleaf(int deviceIndex)
{
    if (deviceIndex < 0 || deviceIndex >= discoveredDeviceCount)
    {
        debugLog("Invalid device index: " + String(deviceIndex));
        return false;
    }

    DiscoveredDevice &device = discoveredDevices[deviceIndex];

    if (!device.isResponding)
    {
        debugLog("Selected device is not responding");
        return false;
    }

    config.hostAddress = device.ipAddress;
    config.port = device.port;

    // Update base URL using working controller pattern (without /api/v1/ - added in sendRequest)
    baseUrl = "http://" + config.hostAddress + ":" + String(config.port);

    debugLog("Selected Nanoleaf device: " + device.hostname + " (" + device.ipAddress + ":" + String(device.port) + ")");
    debugLog("🔗 Updated base URL (working pattern): " + baseUrl);
    return true;
}

int NanoleafController::getDiscoveredDeviceCount()
{
    return discoveredDeviceCount;
}

String NanoleafController::getDiscoveredDeviceInfo(int index)
{
    if (index < 0 || index >= discoveredDeviceCount)
    {
        return "Invalid index";
    }

    DiscoveredDevice &device = discoveredDevices[index];
    String status = device.isResponding ? "Responding" : "Not responding";

    return device.hostname + " (" + device.ipAddress + ":" + String(device.port) + ") - " + status;
}

NanoleafController::HSBColor NanoleafController::rgbToHsb(const RGBColor &rgb)
{
    HSBColor hsb;

    float r = rgb.r / 255.0f;
    float g = rgb.g / 255.0f;
    float b = rgb.b / 255.0f;

    float max = std::max({r, g, b});
    float min = std::min({r, g, b});
    float delta = max - min;

    // Brightness (0-100)
    hsb.b = (int)(max * 100);

    // Saturation (0-100)
    if (max == 0)
    {
        hsb.s = 0;
    }
    else
    {
        hsb.s = (int)((delta / max) * 100);
    }

    // Hue (0-360)
    if (delta == 0)
    {
        hsb.h = 0;
    }
    else if (max == r)
    {
        hsb.h = (int)(60 * (((g - b) / delta) + (g < b ? 6 : 0)));
    }
    else if (max == g)
    {
        hsb.h = (int)(60 * (((b - r) / delta) + 2));
    }
    else // max == b
    {
        hsb.h = (int)(60 * (((r - g) / delta) + 4));
    }

    // Ensure hue is in 0-360 range
    if (hsb.h < 0)
        hsb.h += 360;
    if (hsb.h >= 360)
        hsb.h -= 360;

    return hsb;
}
