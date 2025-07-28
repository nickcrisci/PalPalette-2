import ColorThief from "colorthief";

export interface ExtractedColor {
  hex: string;
  rgb: [number, number, number];
  name?: string;
}

export interface ColorPalette {
  colors: ExtractedColor[];
  dominantColor: ExtractedColor;
  source: "camera" | "gallery";
  imageUrl?: string;
}

export class ColorExtractionService {
  private static colorThief = new ColorThief();

  /**
   * Extract a color palette from an image
   */
  static async extractPalette(
    imageSource: string | HTMLImageElement,
    colorCount: number = 6
  ): Promise<ColorPalette | null> {
    try {
      let img: HTMLImageElement;

      if (typeof imageSource === "string") {
        img = await this.loadImage(imageSource);
      } else {
        img = imageSource;
      }

      // Extract dominant color
      const dominantRgb = this.colorThief.getColor(img);
      const dominantColor: ExtractedColor = {
        hex: this.rgbToHex(dominantRgb),
        rgb: dominantRgb,
        name: this.getColorName(dominantRgb),
      };

      // Extract color palette
      const paletteRgb = this.colorThief.getPalette(img, colorCount);
      const colors: ExtractedColor[] = paletteRgb.map(
        (rgb: [number, number, number]) => ({
          hex: this.rgbToHex(rgb),
          rgb,
          name: this.getColorName(rgb),
        })
      );

      return {
        colors,
        dominantColor,
        source: "camera", // Will be set by the calling component
        imageUrl: typeof imageSource === "string" ? imageSource : undefined,
      };
    } catch (error) {
      console.error("Error extracting color palette:", error);
      return null;
    }
  }

  /**
   * Load an image from a URL or base64 string
   */
  private static loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Convert RGB values to hex color code
   */
  private static rgbToHex([r, g, b]: [number, number, number]): string {
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  /**
   * Get a human-readable color name (simplified version)
   */
  private static getColorName([r, g, b]: [number, number, number]): string {
    // Simple color naming logic - can be enhanced with a proper color naming library
    const colors = [
      { name: "Red", rgb: [255, 0, 0] },
      { name: "Green", rgb: [0, 255, 0] },
      { name: "Blue", rgb: [0, 0, 255] },
      { name: "Yellow", rgb: [255, 255, 0] },
      { name: "Cyan", rgb: [0, 255, 255] },
      { name: "Magenta", rgb: [255, 0, 255] },
      { name: "Orange", rgb: [255, 165, 0] },
      { name: "Purple", rgb: [128, 0, 128] },
      { name: "Pink", rgb: [255, 192, 203] },
      { name: "Brown", rgb: [165, 42, 42] },
      { name: "Gray", rgb: [128, 128, 128] },
      { name: "Black", rgb: [0, 0, 0] },
      { name: "White", rgb: [255, 255, 255] },
    ];

    let closestColor = colors[0];
    let minDistance = this.colorDistance(
      [r, g, b],
      closestColor.rgb as [number, number, number]
    );

    for (const color of colors) {
      const distance = this.colorDistance(
        [r, g, b],
        color.rgb as [number, number, number]
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    }

    return closestColor.name;
  }

  /**
   * Calculate the distance between two colors
   */
  private static colorDistance(
    [r1, g1, b1]: [number, number, number],
    [r2, g2, b2]: [number, number, number]
  ): number {
    return Math.sqrt((r2 - r1) ** 2 + (g2 - g1) ** 2 + (b2 - b1) ** 2);
  }

  /**
   * Generate complementary colors for a given color
   */
  static getComplementaryColors(hex: string): string[] {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return [];

    const [r, g, b] = rgb;
    const complementary = [255 - r, 255 - g, 255 - b];

    return [
      this.rgbToHex(complementary as [number, number, number]),
      this.rgbToHex([
        Math.min(255, r + 50),
        Math.min(255, g + 50),
        Math.min(255, b + 50),
      ]),
      this.rgbToHex([
        Math.max(0, r - 50),
        Math.max(0, g - 50),
        Math.max(0, b - 50),
      ]),
    ];
  }

  /**
   * Convert hex color to RGB
   */
  private static hexToRgb(hex: string): [number, number, number] | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : null;
  }

  /**
   * Validate if a string is a valid hex color
   */
  static isValidHexColor(hex: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(hex);
  }

  /**
   * Generate random color palette
   */
  static generateRandomPalette(count: number = 5): ExtractedColor[] {
    const colors: ExtractedColor[] = [];

    for (let i = 0; i < count; i++) {
      const rgb: [number, number, number] = [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
      ];

      colors.push({
        hex: this.rgbToHex(rgb),
        rgb,
        name: this.getColorName(rgb),
      });
    }

    return colors;
  }
}
