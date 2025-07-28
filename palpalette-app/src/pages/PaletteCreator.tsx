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
} from "@ionic/react";
import { send, camera, shuffle } from "ionicons/icons";
import { PhotoPicker } from "../components/PhotoPicker";
import { FriendSelector } from "../components/FriendSelector";
import {
  ColorPalette,
  ExtractedColor,
} from "../services/ColorExtractionService";
import { MessagesService } from "../services/MessagesService";

const PaletteCreator: React.FC = () => {
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
    if (!currentPalette) {
      showMessage("No palette to send", "danger");
      return;
    }

    try {
      setIsLoading(true);

      // Send color palette directly to friends
      await MessagesService.sendDirectColorPalette(
        currentPalette.colors.map((color) => color.hex),
        friendIds,
        currentPalette.imageUrl
      );

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
              <IonCard>
                <IonCardContent
                  style={{ textAlign: "center", padding: "32px" }}
                >
                  <IonIcon
                    icon={camera}
                    style={{
                      fontSize: "64px",
                      color: "var(--ion-color-primary)",
                    }}
                  />
                  <IonText>
                    <h2>Share Colors with Friends</h2>
                    <p>
                      Take a photo or select one from your gallery to extract
                      colors and send them to your friends' devices.
                    </p>
                  </IonText>

                  <div style={{ marginTop: "24px" }}>
                    <PhotoPicker
                      onPaletteExtracted={handlePaletteExtracted}
                      onError={(error) => showMessage(error, "danger")}
                    />
                  </div>
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
                    <PhotoPicker
                      onPaletteExtracted={handlePaletteExtracted}
                      onError={(error) => showMessage(error, "danger")}
                    />
                  </div>
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
