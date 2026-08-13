/**
 * Client-side Image Compressor
 * 
 * Resizes and compresses images using HTML5 Canvas before uploading.
 * This saves network bandwidth, increases upload speed, and saves database storage.
 */

export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    // Return early if file is not an image
    if (!file || !file.type.startsWith('image/')) {
      return resolve(file);
    }

    // Keep SVG and transparent GIF as is to avoid losing animation or vector properties
    if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions to maintain aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format for maximum compression and bandwidth savings
        const outputType = 'image/webp';

        canvas.toBlob((blob) => {
          if (blob) {
            // Recreate File object
            const extension = '.webp';
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
            const compressedFile = new File([blob], `${nameWithoutExt}${extension}`, {
              type: outputType,
              lastModified: Date.now()
            });

            console.log(`[ImageCompressor] Compressed from ${(file.size / 1024).toFixed(1)} KB to ${(compressedFile.size / 1024).toFixed(1)} KB`);
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original if blob creation fails
          }
        }, outputType, quality);
      };

      img.onerror = (err) => {
        console.warn('[ImageCompressor] Image loading error, using original file:', err);
        resolve(file);
      };
    };

    reader.onerror = (err) => {
      console.warn('[ImageCompressor] FileReader error, using original file:', err);
      resolve(file);
    };
  });
};
