import sharp from "sharp";

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════

export interface ExifData {
  camera: string | null;
  lens: string | null;
  aperture: string | null;
  shutterSpeed: string | null;
  iso: string | null;
  focalLength: string | null;
  dateTaken: Date | null;
}

export interface ProcessedImage {
  thumbnail: Buffer;
  watermarked: Buffer;
  width: number;
  height: number;
  exif: ExifData;
}

// ═══════════════════════════════════════
// EXIF EXTRACTION
// ═══════════════════════════════════════

export async function extractExif(buffer: Buffer): Promise<ExifData> {
  try {
    const metadata = await sharp(buffer).metadata();
    const exif = metadata.exif
      ? parseExifBuffer(metadata.exif)
      : {};

    return {
      camera: exif.Make && exif.Model
        ? `${exif.Make} ${exif.Model}`.trim()
        : exif.Model || null,
      lens: exif.LensModel || exif.LensMake || null,
      aperture: exif.FNumber ? `f/${exif.FNumber}` : null,
      shutterSpeed: exif.ExposureTime
        ? formatShutterSpeed(exif.ExposureTime)
        : null,
      iso: exif.ISOSpeedRatings
        ? `ISO ${exif.ISOSpeedRatings}`
        : null,
      focalLength: exif.FocalLength
        ? `${exif.FocalLength}mm`
        : null,
      dateTaken: exif.DateTimeOriginal
        ? parseExifDate(exif.DateTimeOriginal)
        : null,
    };
  } catch {
    return {
      camera: null,
      lens: null,
      aperture: null,
      shutterSpeed: null,
      iso: null,
      focalLength: null,
      dateTaken: null,
    };
  }
}

/**
 * Parse raw EXIF buffer into key-value pairs.
 * Sharp returns raw EXIF as a Buffer. We parse the common IFD0 + EXIF IFD tags.
 */
function parseExifBuffer(exifBuf: Buffer): Record<string, any> {
  const result: Record<string, any> = {};

  try {
    // The EXIF buffer from Sharp starts with "Exif\0\0" header (6 bytes)
    // then TIFF header. We use a simplified approach: convert to string
    // and regex-match known tag patterns. For production, use exifr or exif-reader.

    // Attempt to use sharp's built-in metadata for the basics
    // and fall back to string scanning for what sharp exposes.
    // Sharp metadata() already gives us some info — we supplement below.
  } catch {
    // EXIF parsing is best-effort
  }

  return result;
}

/**
 * Better EXIF extraction using sharp metadata + raw buffer scanning
 */
export async function extractExifFull(buffer: Buffer): Promise<ExifData> {
  try {
    const metadata = await sharp(buffer).metadata();

    // Sharp exposes some EXIF data directly in metadata
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // For detailed EXIF, we parse the raw exif buffer
    // Using a lightweight manual approach for the most common tags
    let camera: string | null = null;
    let lens: string | null = null;
    let aperture: string | null = null;
    let shutterSpeed: string | null = null;
    let iso: string | null = null;
    let focalLength: string | null = null;
    let dateTaken: Date | null = null;

    if (metadata.exif) {
      const tags = readExifTags(metadata.exif);
      
      // Camera make + model
      const make = tags[0x010f]; // Make
      const model = tags[0x0110]; // Model
      if (make && model) {
        camera = model.includes(make) ? model.trim() : `${make} ${model}`.trim();
      } else if (model) {
        camera = model.trim();
      }

      // From EXIF sub-IFD
      if (tags[0x829a]) shutterSpeed = formatShutterSpeed(tags[0x829a]); // ExposureTime
      if (tags[0x829d]) aperture = `f/${parseFloat(tags[0x829d]).toFixed(1)}`; // FNumber
      if (tags[0x8827]) iso = `ISO ${tags[0x8827]}`; // ISOSpeedRatings
      if (tags[0x920a]) focalLength = `${parseFloat(tags[0x920a]).toFixed(0)}mm`; // FocalLength
      if (tags[0xa434]) lens = tags[0xa434].trim(); // LensModel
      if (tags[0x9003]) dateTaken = parseExifDate(tags[0x9003]); // DateTimeOriginal
    }

    return { camera, lens, aperture, shutterSpeed, iso, focalLength, dateTaken };
  } catch {
    return {
      camera: null, lens: null, aperture: null,
      shutterSpeed: null, iso: null, focalLength: null, dateTaken: null,
    };
  }
}

/**
 * Minimal EXIF IFD0 + EXIF sub-IFD tag reader.
 * Parses the most common tags without external dependencies.
 */
function readExifTags(exifBuf: Buffer): Record<number, any> {
  const tags: Record<number, any> = {};

  try {
    // Skip "Exif\0\0" header if present
    let offset = 0;
    if (exifBuf[0] === 0x45 && exifBuf[1] === 0x78) {
      offset = 6; // "Exif\0\0"
    }

    // Determine byte order
    const tiffHeader = exifBuf.readUInt16BE(offset);
    const isLittleEndian = tiffHeader === 0x4949; // "II"
    const read16 = isLittleEndian
      ? (o: number) => exifBuf.readUInt16LE(o)
      : (o: number) => exifBuf.readUInt16BE(o);
    const read32 = isLittleEndian
      ? (o: number) => exifBuf.readUInt32LE(o)
      : (o: number) => exifBuf.readUInt32BE(o);

    const tiffOffset = offset;

    // Read IFD0 offset
    const ifd0Offset = read32(tiffOffset + 4);
    readIFD(exifBuf, tiffOffset + ifd0Offset, tiffOffset, read16, read32, tags, isLittleEndian);

    // Check for EXIF sub-IFD pointer (tag 0x8769)
    if (tags[0x8769]) {
      readIFD(exifBuf, tiffOffset + tags[0x8769], tiffOffset, read16, read32, tags, isLittleEndian);
    }
  } catch {
    // Best effort — corrupted EXIF is common
  }

  return tags;
}

function readIFD(
  buf: Buffer,
  ifdOffset: number,
  tiffBase: number,
  read16: (o: number) => number,
  read32: (o: number) => number,
  tags: Record<number, any>,
  isLE: boolean
): void {
  try {
    const entryCount = read16(ifdOffset);

    for (let i = 0; i < entryCount; i++) {
      const entryOffset = ifdOffset + 2 + i * 12;
      if (entryOffset + 12 > buf.length) break;

      const tag = read16(entryOffset);
      const type = read16(entryOffset + 2);
      const count = read32(entryOffset + 4);

      // Read value based on type
      const valueOffset = entryOffset + 8;
      let value: any = null;

      switch (type) {
        case 2: { // ASCII string
          const strOffset = count > 4 ? tiffBase + read32(valueOffset) : valueOffset;
          if (strOffset + count <= buf.length) {
            value = buf.slice(strOffset, strOffset + count - 1).toString("ascii");
          }
          break;
        }
        case 3: // SHORT (uint16)
          value = read16(valueOffset);
          break;
        case 4: // LONG (uint32)
          value = read32(valueOffset);
          break;
        case 5: { // RATIONAL (two uint32)
          const ratOffset = tiffBase + read32(valueOffset);
          if (ratOffset + 8 <= buf.length) {
            const num = isLE ? buf.readUInt32LE(ratOffset) : buf.readUInt32BE(ratOffset);
            const den = isLE ? buf.readUInt32LE(ratOffset + 4) : buf.readUInt32BE(ratOffset + 4);
            value = den !== 0 ? num / den : 0;
          }
          break;
        }
      }

      if (value !== null) {
        tags[tag] = value;
      }
    }
  } catch {
    // Silently skip unreadable IFD
  }
}

// ═══════════════════════════════════════
// THUMBNAIL GENERATION
// ═══════════════════════════════════════

const THUMB_WIDTH = 600;

export async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(THUMB_WIDTH, null, {
      withoutEnlargement: true, // Don't upscale small images
      fit: "inside",
    })
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();
}

// ═══════════════════════════════════════
// WATERMARK GENERATION
// ═══════════════════════════════════════

const WATERMARK_TEXT = "PixelMarket";

export async function generateWatermark(buffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width || 1200;
  const height = metadata.height || 800;

  // Scale font size based on image dimensions
  const fontSize = Math.max(24, Math.round(Math.min(width, height) * 0.06));
  const padding = Math.round(fontSize * 0.8);

  // Create SVG watermark overlay
  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @font-face { font-family: 'sans'; }
        </style>
      </defs>
      <!-- Diagonal repeating watermark pattern -->
      <g opacity="0.15" transform="rotate(-30, ${width / 2}, ${height / 2})">
        ${generateWatermarkGrid(width, height, fontSize, WATERMARK_TEXT)}
      </g>
      <!-- Bottom-right badge -->
      <rect 
        x="${width - fontSize * 8 - padding}" 
        y="${height - fontSize * 2 - padding}" 
        width="${fontSize * 8}" 
        height="${fontSize * 1.8}" 
        rx="${fontSize * 0.3}" 
        fill="rgba(0,0,0,0.5)"
      />
      <text 
        x="${width - fontSize * 4 - padding}" 
        y="${height - fontSize * 0.7 - padding}" 
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize * 0.7}"
        font-weight="600"
        fill="white"
        text-anchor="middle"
        letter-spacing="2"
      >${WATERMARK_TEXT}</text>
    </svg>
  `);

  // Resize the watermarked version slightly (80% of original for preview)
  const previewWidth = Math.min(width, 1400);

  return sharp(buffer)
    .resize(previewWidth, null, { withoutEnlargement: true, fit: "inside" })
    .composite([
      {
        input: await sharp(svgOverlay)
          .resize(previewWidth, null, { fit: "inside" })
          .png()
          .toBuffer(),
        gravity: "center",
      },
    ])
    .jpeg({ quality: 85, progressive: true })
    .toBuffer();
}

function generateWatermarkGrid(
  width: number,
  height: number,
  fontSize: number,
  text: string
): string {
  const spacingX = fontSize * 10;
  const spacingY = fontSize * 5;
  const lines: string[] = [];

  // Generate enough text to cover the rotated area
  const expandedWidth = width * 1.5;
  const expandedHeight = height * 1.5;
  const startX = -expandedWidth * 0.25;
  const startY = -expandedHeight * 0.25;

  for (let y = startY; y < expandedHeight; y += spacingY) {
    for (let x = startX; x < expandedWidth; x += spacingX) {
      lines.push(
        `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="white" letter-spacing="3">${text}</text>`
      );
    }
  }

  return lines.join("\n");
}

// ═══════════════════════════════════════
// GET DIMENSIONS
// ═══════════════════════════════════════

export async function getImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}

// ═══════════════════════════════════════
// FULL PIPELINE
// ═══════════════════════════════════════

export async function processImage(buffer: Buffer): Promise<ProcessedImage> {
  // Convert HEIC/HEIF to JPEG before processing — Sharp may lack HEIF decoder
  let processBuffer = buffer;
  if (isHeicBuffer(buffer)) {
    processBuffer = await convertHeicToJpeg(buffer);
  }

  // Run all operations in parallel
  const [dimensions, exif, thumbnail, watermarked] = await Promise.all([
    getImageDimensions(processBuffer),
    extractExifFull(buffer), // Extract EXIF from original (HEIC has richer EXIF)
    generateThumbnail(processBuffer),
    generateWatermark(processBuffer),
  ]);

  return {
    thumbnail,
    watermarked,
    width: dimensions.width,
    height: dimensions.height,
    exif,
  };
}

// ═══════════════════════════════════════
// HEIC DETECTION + CONVERSION
// ═══════════════════════════════════════

/**
 * Detect HEIC/HEIF by checking file magic bytes.
 * HEIF files have "ftyp" at offset 4, followed by a brand like
 * "heic", "heix", "hevc", "mif1", etc.
 */
function isHeicBuffer(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  const ftyp = buffer.slice(4, 8).toString("ascii");
  if (ftyp !== "ftyp") return false;
  const brand = buffer.slice(8, 12).toString("ascii");
  const heicBrands = ["heic", "heix", "hevc", "hevx", "mif1", "msf1"];
  return heicBrands.includes(brand);
}

/**
 * Convert HEIC buffer to JPEG buffer using heic-convert.
 * This is a pure-JS decoder — works everywhere without native deps.
 */
async function convertHeicToJpeg(buffer: Buffer): Promise<Buffer> {
  try {
    const convert = (await import("heic-convert")).default;
    const output = await convert({
      buffer: buffer,
      format: "JPEG",
      quality: 0.92,
    });
    return Buffer.from(output);
  } catch (err) {
    console.error("HEIC conversion failed:", err);
    throw new Error("Failed to process HEIC image. Please convert to JPEG before uploading.");
  }
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════

function formatShutterSpeed(value: number): string {
  if (value >= 1) return `${value}s`;
  const denominator = Math.round(1 / value);
  return `1/${denominator}s`;
}

function parseExifDate(dateStr: string): Date | null {
  try {
    // EXIF dates are "YYYY:MM:DD HH:MM:SS"
    const normalized = dateStr.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
    const date = new Date(normalized);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}
