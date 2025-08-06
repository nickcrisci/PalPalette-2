import React, { useState } from "react";
import {
  IonActionSheet,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonImg,
  IonSpinner,
  IonToast,
} from "@ionic/react";
import { camera, images, close } from "ionicons/icons";
import { CameraService, CameraPhoto } from "../../services/CameraService";
import {
  ColorExtractionService,
  ColorPalette,
} from "../../services/ColorExtractionService";

interface PhotoPickerProps {
  onPaletteExtracted: (palette: ColorPalette) => void;
  onError?: (error: string) => void;
}

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  onPaletteExtracted,
  onError,
}) => {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<CameraPhoto | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showError = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    onError?.(message);
  };

  const extractColorsFromPhoto = async (
    photo: CameraPhoto,
    source: "camera" | "gallery"
  ) => {
    try {
      setIsLoading(true);

      // Convert photo to usable format for color extraction
      const imageUrl = await CameraService.photoToBase64(photo);
      if (!imageUrl) {
        throw new Error("Failed to process image");
      }

      // Extract color palette
      const palette = await ColorExtractionService.extractPalette(imageUrl, 6);
      if (!palette) {
        throw new Error("Failed to extract colors from image");
      }

      // Set the source
      palette.source = source;
      palette.imageUrl = imageUrl;

      onPaletteExtracted(palette);
      setSelectedPhoto(photo);
    } catch (error) {
      console.error("Error extracting colors:", error);
      showError("Failed to extract colors from image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setIsActionSheetOpen(false);
      const photo = await CameraService.takePhoto();

      if (photo) {
        await extractColorsFromPhoto(photo, "camera");
      } else {
        showError("Failed to take photo");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      showError("Failed to access camera");
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      setIsActionSheetOpen(false);
      const photo = await CameraService.selectFromGallery();

      if (photo) {
        await extractColorsFromPhoto(photo, "gallery");
      } else {
        showError("Failed to select photo");
      }
    } catch (error) {
      console.error("Error selecting photo:", error);
      showError("Failed to access gallery");
    }
  };

  return (
    <>
      <IonButton
        expand="block"
        fill="outline"
        onClick={() => setIsActionSheetOpen(true)}
        disabled={isLoading}
        className="photo-picker-button"
      >
        <IonIcon icon={camera} slot="start" />
        {isLoading ? "Processing..." : "Add Photo"}
        {isLoading && <IonSpinner name="crescent" />}
      </IonButton>

      {selectedPhoto && (
        <IonItem className="selected-photo-preview">
          <IonThumbnail slot="start">
            <IonImg src={selectedPhoto.webviewPath} />
          </IonThumbnail>
          <IonLabel>
            <h3>Photo Selected</h3>
            <p>Colors extracted successfully</p>
          </IonLabel>
        </IonItem>
      )}

      <IonActionSheet
        isOpen={isActionSheetOpen}
        onDidDismiss={() => setIsActionSheetOpen(false)}
        header="Select Photo Source"
        buttons={[
          {
            text: "Take Photo",
            icon: camera,
            handler: handleTakePhoto,
          },
          {
            text: "Choose from Gallery",
            icon: images,
            handler: handleSelectFromGallery,
          },
          {
            text: "Cancel",
            icon: close,
            role: "cancel",
          },
        ]}
      />

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color="danger"
      />
    </>
  );
};
