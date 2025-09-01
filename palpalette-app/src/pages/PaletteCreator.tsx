import React, { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonToast,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonLabel,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import { send, camera, shuffle, colorPalette, brush } from "ionicons/icons";
import { PhotoPicker } from "../components/common";
import { ColorPicker } from "../components/common/ColorPicker";
import { FriendSelector } from "../components/common";
import {
  ColorPalette,
  ExtractedColor,
} from "../services/ColorExtractionService";
import { MessagesService } from "../services/openapi/services/MessagesService";
import { CreateMessageDto } from "../services/openapi/models/CreateMessageDto";
import { useAuth } from "../hooks";

type CreationMode = "photo" | "manual";

const PaletteCreator: React.FC = () => {
  const { user } = useAuth();
  const [creationMode, setCreationMode] = useState<CreationMode>("photo");
  const [currentPalette, setCurrentPalette] = useState<ColorPalette | null>(
    null
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<"success" | "danger">("success");

  const showMessage = (
    message: string,
    color: "success" | "danger" = "success"
  ) => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const handlePaletteExtracted = (palette: ColorPalette) => {
    setCurrentPalette(palette);
    showMessage("Colors extracted! Arrange them and send to friends!");
  };

  const handleManualColorsSelected = (colors: string[]) => {
    const extractedColors: ExtractedColor[] = colors.map((hex) => ({
      hex,
      rgb: hexToRgb(hex),
      name: getColorName(hex),
    }));

    // Find the most vibrant color as dominant
    const dominantColor = extractedColors[0] || extractedColors[0];

    setCurrentPalette({
      colors: extractedColors,
      dominantColor,
      source: "gallery", // Use gallery as closest match for manual
      imageUrl: undefined, // No image for manual palettes
    });
    showMessage("Custom palette created! Arrange colors and send to friends!");
  };

  // Helper function to convert hex to RGB as tuple
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  };

  // Simple color name approximation
  const getColorName = (hex: string) => {
    const rgb = hexToRgb(hex);
    const [r, g, b] = rgb;
    if (r > g && r > b) return "Red-ish";
    if (g > r && g > b) return "Green-ish";
    if (b > r && b > g) return "Blue-ish";
    if (r > 200 && g > 200 && b > 200) return "Light";
    if (r < 50 && g < 50 && b < 50) return "Dark";
    return "Mixed";
  };

  const handleColorsReordered = (colors: ExtractedColor[]) => {
    if (currentPalette) {
      setCurrentPalette({
        ...currentPalette,
        colors,
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (
      !currentPalette ||
      draggedIndex === null ||
      draggedIndex === dropIndex
    ) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reorderedColors = [...currentPalette.colors];
    const draggedColor = reorderedColors[draggedIndex];

    reorderedColors.splice(draggedIndex, 1);
    reorderedColors.splice(dropIndex, 0, draggedColor);

    handleColorsReordered(reorderedColors);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleShuffle = () => {
    if (!currentPalette) return;
    const shuffled = [...currentPalette.colors].sort(() => Math.random() - 0.5);
    handleColorsReordered(shuffled);
  };

  const handleSendToFriends = async (friendIds: string[]) => {
    if (!user) {
      showMessage("Please login to send palettes", "danger");
      return;
    }

    if (!currentPalette) {
      showMessage("No palette to send", "danger");
      return;
    }

    try {
      setIsLoading(true);

      // Send color palette to each friend using the OpenAPI MessagesService
      const sendPromises = friendIds.map((friendId) =>
        MessagesService.messagesControllerCreate({
          senderId: user.id,
          recipientId: friendId,
          deviceId: friendId, // Using friendId as deviceId - this might need adjustment based on your backend logic
          colors: currentPalette.colors.map((color) => color.hex),
          content: "Shared a color palette with you!",
        })
      );

      await Promise.all(sendPromises);

      showMessage(
        `Palette sent to ${friendIds.length} friend${
          friendIds.length !== 1 ? "s" : ""
        }!`
      );

      setTimeout(() => {
        setCurrentPalette(null);
        setShowFriendSelector(false);
      }, 2000);
    } catch (error) {
      console.error("Error sending palette:", error);
      showMessage("Failed to send palette", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const copyColorToClipboard = async (color: ExtractedColor) => {
    try {
      await navigator.clipboard.writeText(color.hex);
      showMessage(`Copied ${color.hex} to clipboard`);
    } catch (error) {
      console.error("Failed to copy color:", error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Share Colors</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div style={{ padding: "16px" }}>
          {!currentPalette ? (
            <div className="empty-state">
              {/* Mode Selection */}
              <IonCard>
                <IonCardContent
                  style={{ textAlign: "center", padding: "24px" }}
                >
                  <IonText>
                    <h2>🎨 Create Color Palette</h2>
                    <p>Choose how you want to create your palette</p>
                  </IonText>

                  <IonSegment
                    value={creationMode}
                    onIonChange={(e) =>
                      setCreationMode(e.detail.value as CreationMode)
                    }
                    style={{ marginTop: "16px", marginBottom: "24px" }}
                  >
                    <IonSegmentButton value="photo">
                      <IonIcon icon={camera} />
                      <IonLabel>From Photo</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="manual">
                      <IonIcon icon={brush} />
                      <IonLabel>Pick Colors</IonLabel>
                    </IonSegmentButton>
                  </IonSegment>

                  {creationMode === "photo" ? (
                    <div>
                      <IonIcon
                        icon={camera}
                        style={{
                          fontSize: "64px",
                          color: "var(--ion-color-primary)",
                          marginBottom: "16px",
                        }}
                      />
                      <IonText>
                        <h3>Extract from Photo</h3>
                        <p>
                          Take a photo or select one from your gallery to
                          extract colors and send them to your friends' devices.
                        </p>
                      </IonText>

                      <div style={{ marginTop: "24px" }}>
                        <PhotoPicker
                          onPaletteExtracted={handlePaletteExtracted}
                          onError={(error) => showMessage(error, "danger")}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <ColorPicker
                        onColorsSelected={handleManualColorsSelected}
                        maxColors={6}
                        minColors={2}
                      />
                    </div>
                  )}
                </IonCardContent>
              </IonCard>
            </div>
          ) : (
            <div className="palette-editor">
              <IonCard>
                <IonCardContent>
                  {currentPalette.imageUrl && (
                    <div style={{ marginBottom: "16px" }}>
                      <img
                        src={currentPalette.imageUrl}
                        alt="Source"
                        style={{
                          width: "100%",
                          maxHeight: "200px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: "16px", textAlign: "center" }}>
                    <IonButton
                      fill="outline"
                      size="small"
                      onClick={handleShuffle}
                    >
                      <IonIcon icon={shuffle} slot="start" />
                      Shuffle Colors
                    </IonButton>
                  </div>

                  <IonGrid>
                    <IonRow>
                      {currentPalette.colors.map((color, index) => (
                        <IonCol
                          size="6"
                          sizeMd="4"
                          sizeLg="2"
                          key={`${color.hex}-${index}`}
                        >
                          <div
                            className={`color-tile ${
                              dragOverIndex === index ? "drag-over" : ""
                            }`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onClick={() => copyColorToClipboard(color)}
                            style={{
                              backgroundColor: color.hex,
                              height: "80px",
                              borderRadius: "8px",
                              border: "2px solid #ddd",
                              cursor: "grab",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginBottom: "8px",
                              opacity: draggedIndex === index ? 0.5 : 1,
                              transform:
                                dragOverIndex === index
                                  ? "scale(1.05)"
                                  : "scale(1)",
                              transition: "transform 0.2s ease",
                            }}
                          >
                            <div
                              style={{
                                background: "rgba(0,0,0,0.7)",
                                color: "white",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                textAlign: "center",
                              }}
                            >
                              <div>{color.hex}</div>
                            </div>
                          </div>
                        </IonCol>
                      ))}
                    </IonRow>
                  </IonGrid>

                  <div style={{ marginTop: "16px" }}>
                    {currentPalette.colors.map((color, index) => (
                      <IonChip
                        key={`chip-${color.hex}-${index}`}
                        style={{
                          backgroundColor: color.hex,
                          color: "white",
                          margin: "4px",
                        }}
                        onClick={() => copyColorToClipboard(color)}
                      >
                        <IonLabel>{color.hex}</IonLabel>
                      </IonChip>
                    ))}
                  </div>

                  <div style={{ marginTop: "24px" }}>
                    <IonButton
                      expand="block"
                      onClick={() => setShowFriendSelector(true)}
                      disabled={isLoading}
                    >
                      <IonIcon icon={send} slot="start" />
                      Send to Friends
                    </IonButton>
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <IonButton
                      expand="block"
                      fill="outline"
                      onClick={() => setCurrentPalette(null)}
                    >
                      Start Over
                    </IonButton>
                  </div>

                  {creationMode === "photo" && (
                    <div style={{ marginTop: "12px" }}>
                      <PhotoPicker
                        onPaletteExtracted={handlePaletteExtracted}
                        onError={(error) => showMessage(error, "danger")}
                      />
                    </div>
                  )}
                </IonCardContent>
              </IonCard>

              <IonText
                color="medium"
                style={{ fontSize: "14px", marginTop: "16px" }}
              >
                <p>
                  💡 Drag colors to reorder them, tap to copy hex codes. Once
                  you're happy with the arrangement, send them to your friends!
                </p>
              </IonText>
            </div>
          )}
        </div>

        <FriendSelector
          isOpen={showFriendSelector}
          onClose={() => setShowFriendSelector(false)}
          onSendToFriends={handleSendToFriends}
          isLoading={isLoading}
        />

        {isLoading && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <IonSpinner name="crescent" color="primary" />
          </div>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default PaletteCreator;
