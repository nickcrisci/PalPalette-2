import React, { useState } from "react";
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonCard,
  IonCardContent,
} from "@ionic/react";
import { add, remove, colorPalette } from "ionicons/icons";

interface ColorPickerProps {
  onColorsSelected: (colors: string[]) => void;
  maxColors?: number;
  minColors?: number;
  showConfirmButton?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  onColorsSelected,
  maxColors = 6,
  minColors = 2,
  showConfirmButton = true,
}) => {
  const [colors, setColors] = useState<string[]>(["#FF5733", "#33FF57"]);
  const [customColor, setCustomColor] = useState("#3357FF");

  // Predefined color palette suggestions
  const presetColors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#FF33F1",
    "#F1FF33",
    "#33FFF1",
    "#FF8C33",
    "#8C33FF",
    "#33FF8C",
    "#FF3333",
    "#33FFFF",
    "#FFFF33",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#F8C471",
    "#82E0AA",
  ];

  const addColor = (color?: string) => {
    if (colors.length >= maxColors) return;

    const newColor = color || customColor;
    if (!colors.includes(newColor)) {
      const newColors = [...colors, newColor];
      setColors(newColors);
      // Only call onColorsSelected if showConfirmButton is false (immediate mode)
      if (!showConfirmButton) {
        onColorsSelected(newColors);
      }
    }
  };

  const removeColor = (index: number) => {
    if (colors.length <= minColors) return;

    const newColors = colors.filter((_, i) => i !== index);
    setColors(newColors);
    // Only call onColorsSelected if showConfirmButton is false (immediate mode)
    if (!showConfirmButton) {
      onColorsSelected(newColors);
    }
  };

  const updateColor = (index: number, newColor: string) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    setColors(newColors);
    // Only call onColorsSelected if showConfirmButton is false (immediate mode)
    if (!showConfirmButton) {
      onColorsSelected(newColors);
    }
  };

  const confirmSelection = () => {
    if (colors.length >= minColors) {
      onColorsSelected(colors);
    }
  };

  const isValidColor = (color: string) => {
    return /^#[0-9A-F]{6}$/i.test(color);
  };

  return (
    <IonCard>
      <IonCardContent>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <IonIcon
            icon={colorPalette}
            style={{
              fontSize: "48px",
              color: "var(--ion-color-primary)",
            }}
          />
          <IonText>
            <h3 style={{ margin: "8px 0" }}>Create Custom Palette</h3>
            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              Pick colors manually or choose from presets
            </p>
          </IonText>
        </div>

        {/* Current Colors */}
        <div style={{ marginBottom: "20px" }}>
          <IonText>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
              Your Colors ({colors.length}/{maxColors})
            </h4>
          </IonText>
          <IonGrid style={{ padding: "0" }}>
            <IonRow>
              {colors.map((color, index) => (
                <IonCol
                  size="6"
                  sizeMd="4"
                  sizeLg="3"
                  key={index}
                  style={{ padding: "4px" }}
                >
                  <div style={{ position: "relative" }}>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      style={{
                        width: "100%",
                        height: "60px",
                        border: "2px solid #ddd",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "4px",
                        left: "4px",
                        right: "4px",
                        background: "rgba(0,0,0,0.7)",
                        color: "white",
                        fontSize: "10px",
                        textAlign: "center",
                        borderRadius: "4px",
                        padding: "2px",
                      }}
                    >
                      {color}
                    </div>
                    {colors.length > minColors && (
                      <IonButton
                        fill="clear"
                        size="small"
                        color="danger"
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "white",
                          minHeight: "24px",
                          minWidth: "24px",
                        }}
                        onClick={() => removeColor(index)}
                      >
                        <IonIcon icon={remove} style={{ fontSize: "14px" }} />
                      </IonButton>
                    )}
                  </div>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>

        {/* Add Custom Color */}
        {colors.length < maxColors && (
          <div style={{ marginBottom: "20px" }}>
            <IonItem>
              <IonLabel position="stacked">Add Custom Color</IonLabel>
              <IonInput
                value={customColor}
                placeholder="#3357FF"
                onIonInput={(e) => setCustomColor(e.detail.value!)}
                maxlength={7}
                style={{ fontSize: "16px" }}
              />
              <IonButton
                slot="end"
                fill="clear"
                onClick={() => addColor()}
                disabled={
                  !isValidColor(customColor) || colors.includes(customColor)
                }
                style={{ minHeight: "44px", minWidth: "44px" }}
              >
                <IonIcon icon={add} />
              </IonButton>
            </IonItem>
          </div>
        )}

        {/* Preset Color Suggestions */}
        {colors.length < maxColors && (
          <div>
            <IonText>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
                Quick Add
              </h4>
            </IonText>
            <IonGrid style={{ padding: "0" }}>
              <IonRow>
                {presetColors
                  .filter((color) => !colors.includes(color))
                  .slice(0, 12)
                  .map((color, index) => (
                    <IonCol
                      size="4"
                      sizeMd="3"
                      sizeLg="2"
                      key={index}
                      style={{ padding: "4px" }}
                    >
                      <div
                        onClick={() => addColor(color)}
                        style={{
                          backgroundColor: color,
                          height: "44px",
                          borderRadius: "6px",
                          border: "2px solid #ddd",
                          cursor: "pointer",
                          transition: "transform 0.2s ease",
                        }}
                        onMouseOver={(e) => {
                          (e.target as HTMLElement).style.transform =
                            "scale(1.05)";
                        }}
                        onMouseOut={(e) => {
                          (e.target as HTMLElement).style.transform =
                            "scale(1)";
                        }}
                      />
                    </IonCol>
                  ))}
              </IonRow>
            </IonGrid>
          </div>
        )}

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <IonText color="medium">
            <p style={{ fontSize: "14px", margin: "8px 0" }}>
              💡 Tap a color square to edit it, or use the color presets below.
              You need at least {minColors} colors and can have up to{" "}
              {maxColors}.
            </p>
          </IonText>
        </div>

        {/* Confirmation Button */}
        {showConfirmButton && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <IonButton
              expand="block"
              color="primary"
              onClick={confirmSelection}
              disabled={colors.length < minColors}
            >
              Continue with {colors.length} Color
              {colors.length !== 1 ? "s" : ""}
            </IonButton>
          </div>
        )}
      </IonCardContent>
    </IonCard>
  );
};
