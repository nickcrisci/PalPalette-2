import React, { useState } from "react";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonText,
} from "@ionic/react";
import { save, shuffle, copy } from "ionicons/icons";
import { ExtractedColor } from "../../services/ColorExtractionService";

interface SortableColorPaletteProps {
  colors: ExtractedColor[];
  onColorsReordered: (colors: ExtractedColor[]) => void;
  onSave?: (name: string, description?: string) => void;
  imageUrl?: string;
  initialName?: string;
  initialDescription?: string;
}

export const SortableColorPalette: React.FC<SortableColorPaletteProps> = ({
  colors,
  onColorsReordered,
  onSave,
  imageUrl,
  initialName = "",
  initialDescription = "",
}) => {
  const [paletteName, setPaletteName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reorderedColors = [...colors];
    const draggedColor = reorderedColors[draggedIndex];

    // Remove dragged item
    reorderedColors.splice(draggedIndex, 1);

    // Insert at new position
    reorderedColors.splice(dropIndex, 0, draggedColor);

    onColorsReordered(reorderedColors);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleShuffle = () => {
    const shuffled = [...colors].sort(() => Math.random() - 0.5);
    onColorsReordered(shuffled);
  };

  const copyColorToClipboard = async (color: ExtractedColor) => {
    try {
      await navigator.clipboard.writeText(color.hex);
      // Could add a toast notification here
    } catch (error) {
      console.error("Failed to copy color:", error);
    }
  };

  const handleSave = () => {
    if (onSave && paletteName.trim()) {
      onSave(paletteName.trim(), description.trim() || undefined);
    }
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Color Palette</IonCardTitle>
      </IonCardHeader>

      <IonCardContent>
        {imageUrl && (
          <div
            className="source-image-preview"
            style={{ marginBottom: "16px" }}
          >
            <img
              src={imageUrl}
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

        <div className="palette-actions" style={{ marginBottom: "16px" }}>
          <IonButton fill="outline" size="small" onClick={handleShuffle}>
            <IonIcon icon={shuffle} slot="start" />
            Shuffle
          </IonButton>
        </div>

        <IonGrid>
          <IonRow>
            {colors.map((color, index) => (
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
                    position: "relative",
                    opacity: draggedIndex === index ? 0.5 : 1,
                    transform:
                      dragOverIndex === index ? "scale(1.05)" : "scale(1)",
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
                    {color.name && (
                      <div style={{ fontSize: "10px" }}>{color.name}</div>
                    )}
                  </div>
                </div>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        <div className="color-list" style={{ marginTop: "16px" }}>
          {colors.map((color, index) => (
            <IonChip
              key={`chip-${color.hex}-${index}`}
              style={{ backgroundColor: color.hex, color: "white" }}
              onClick={() => copyColorToClipboard(color)}
            >
              <IonIcon icon={copy} />
              <IonLabel>{color.hex}</IonLabel>
            </IonChip>
          ))}
        </div>

        {onSave && (
          <div className="palette-form" style={{ marginTop: "24px" }}>
            <IonItem>
              <IonLabel position="stacked">Palette Name</IonLabel>
              <IonInput
                value={paletteName}
                onIonInput={(e) => setPaletteName(e.detail.value!)}
                placeholder="Enter palette name..."
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Description (Optional)</IonLabel>
              <IonTextarea
                value={description}
                onIonInput={(e) => setDescription(e.detail.value!)}
                placeholder="Describe this palette..."
                rows={3}
              />
            </IonItem>

            <IonButton
              expand="block"
              onClick={handleSave}
              disabled={!paletteName.trim()}
              style={{ marginTop: "16px" }}
            >
              <IonIcon icon={save} slot="start" />
              Save Palette
            </IonButton>
          </div>
        )}

        <IonText color="medium" style={{ fontSize: "14px", marginTop: "16px" }}>
          <p>
            💡 Tip: Drag colors to reorder them, or tap to copy hex codes to
            clipboard. Tap "Shuffle" to randomize the order.
          </p>
        </IonText>
      </IonCardContent>
    </IonCard>
  );
};
