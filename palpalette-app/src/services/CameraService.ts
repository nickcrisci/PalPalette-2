import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from "@capacitor/camera";
import { Preferences } from "@capacitor/preferences";

export interface CameraPhoto {
  filepath: string;
  webviewPath?: string;
}

export class CameraService {
  private static readonly PHOTO_STORAGE = "photos";

  /**
   * Take a photo using the device camera
   */
  static async takePhoto(): Promise<CameraPhoto | null> {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
        allowEditing: false,
        saveToGallery: true,
      });

      return this.processPhoto(photo);
    } catch (error) {
      console.error("Error taking photo:", error);
      return null;
    }
  }

  /**
   * Select a photo from the device gallery
   */
  static async selectFromGallery(): Promise<CameraPhoto | null> {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        quality: 90,
        allowEditing: false,
      });

      return this.processPhoto(photo);
    } catch (error) {
      console.error("Error selecting photo:", error);
      return null;
    }
  }

  /**
   * Process the photo and convert to usable format
   */
  private static processPhoto(photo: Photo): CameraPhoto {
    return {
      filepath: photo.path || "",
      webviewPath: photo.webPath,
    };
  }

  /**
   * Convert photo to base64 for color extraction
   */
  static async photoToBase64(photo: CameraPhoto): Promise<string | null> {
    try {
      if (!photo.webviewPath) return null;

      // For web, we can use the webPath directly
      if (photo.webviewPath.startsWith("http")) {
        return photo.webviewPath;
      }

      // For native platforms, convert to base64
      const response = await fetch(photo.webviewPath);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting photo to base64:", error);
      return null;
    }
  }

  /**
   * Save photos to device storage
   */
  static async savePhotos(photos: CameraPhoto[]): Promise<void> {
    try {
      await Preferences.set({
        key: this.PHOTO_STORAGE,
        value: JSON.stringify(photos),
      });
    } catch (error) {
      console.error("Error saving photos:", error);
    }
  }

  /**
   * Load saved photos from device storage
   */
  static async loadSavedPhotos(): Promise<CameraPhoto[]> {
    try {
      const result = await Preferences.get({ key: this.PHOTO_STORAGE });
      return result.value ? JSON.parse(result.value) : [];
    } catch (error) {
      console.error("Error loading photos:", error);
      return [];
    }
  }
}
