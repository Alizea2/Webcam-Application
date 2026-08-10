//cell sixe
let halftoneDotSize = 2;  
//contrast strength
let halftoneContrast = 0.8;   

//clampimg value between limits
function clampHalftone(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

//making a full copy of a p5 image
function createHalftoneCopy(srcImg) {
  if (!srcImg || !srcImg.width || !srcImg.height) return null;
  const copy = createImage(srcImg.width, srcImg.height);
  srcImg.loadPixels();
  copy.loadPixels();
  //verifing pixels lenghts matching
  if (!srcImg.pixels || srcImg.pixels.length !== srcImg.width * srcImg.height * 4) return null;
  //copying pixel values
  for (let i = 0; i < srcImg.pixels.length; i++) copy.pixels[i] = srcImg.pixels[i];
  copy.updatePixels();
  return copy;
}

//checks if image has valid pixels
function ensureValidPixels(img, functionName) {
  if (!img) return false;
  if (!img.width || !img.height) return false;

  img.loadPixels();
  const expectedLength = img.width * img.height * 4;

  //checking array length
  if (!img.pixels || img.pixels.length !== expectedLength) return false;

  //quick check for actual color data
  let hasData = false;
  for (let i = 0; i < Math.min(img.pixels.length, 100); i += 4) {
    if (img.pixels[i] > 0 || img.pixels[i+1] > 0 || img.pixels[i+2] > 0) {
      hasData = true;
      break;
    }
  }
  return hasData;
}

//main halftone algorithm
function createHalftoneEffect(srcImg) {
  const workingCopy = createHalftoneCopy(srcImg);
  if (!workingCopy || !ensureValidPixels(workingCopy, 'createHalftoneEffect')) {
    return createHalftoneCopy(srcImg) || srcImg;
  }

  const out = createImage(workingCopy.width, workingCopy.height);
  out.loadPixels();

  const w = workingCopy.width;
  const h = workingCopy.height;
  const cellSize = Math.max(2, Math.min(20, halftoneDotSize));

  try {
    //fill background with white
    for (let i = 0; i < out.pixels.length; i += 4) {
      out.pixels[i] = out.pixels[i+1] = out.pixels[i+2] = 255;
      out.pixels[i+3] = 255;
    }

    //step through image in cell blocks
    for (let cellY = 0; cellY < h; cellY += cellSize) {
      for (let cellX = 0; cellX < w; cellX += cellSize) {

        //calculatinhg average brightness for this cell
        let totalBrightness = 0;
        let pixelCount = 0;

        for (let y = cellY; y < Math.min(h, cellY + cellSize); y++) {
          for (let x = cellX; x < Math.min(w, cellX + cellSize); x++) {
            const idx = (y * w + x) * 4;
            const r = workingCopy.pixels[idx];
            const g = workingCopy.pixels[idx+1];
            const b = workingCopy.pixels[idx+2];

            //grayscale brightness
            const brightness = (0.299*r + 0.587*g + 0.114*b);
            totalBrightness += brightness;
            pixelCount++;
          }
        }

        if (pixelCount === 0) continue;

        //average brightness
        let avgBrightness = totalBrightness / pixelCount;
        //applying contrast and clamp
        avgBrightness = clampHalftone(avgBrightness * halftoneContrast, 0, 255);

        //converting to dot size 
        const darkness = (255 - avgBrightness) / 255;
        const dotRadius = darkness * cellSize * 0.7;

        //center of this cell
        const centerX = cellX + cellSize / 2;
        const centerY = cellY + cellSize / 2;

        //only draw if radius is large enough
        if (dotRadius > 0.5) {
          drawCircleInImage(out, centerX, centerY, dotRadius, w, h);
        }
      }
    }
  } catch (e) {
    //copy original image
    for (let i = 0; i < workingCopy.pixels.length; i++) {
      out.pixels[i] = workingCopy.pixels[i];
    }
  }

  out.updatePixels();
  return out;
}

//drawing a filled black circle into output image
function drawCircleInImage(img, centerX, centerY, radius, imgWidth, imgHeight) {
  const r2 = radius * radius;

  //finding bounding box of the circle, clamp to image edges
  const minX = Math.max(0, Math.floor(centerX - radius));
  const maxX = Math.min(imgWidth - 1, Math.ceil(centerX + radius));
  const minY = Math.max(0, Math.floor(centerY - radius));
  const maxY = Math.min(imgHeight - 1, Math.ceil(centerY + radius));

  //looping over all pixels in that box
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      //distance in x
      const dx = x - centerX;
      //distance in y
      const dy = y - centerY;

      //checking if pixel is inside the circle
      if (dx*dx + dy*dy <= r2) {
        //pixel index
        const idx = (y * imgWidth + x) * 4;
        //setting pixel to black
        img.pixels[idx] = img.pixels[idx+1] = img.pixels[idx+2] = 0;
        //ful alpha
        img.pixels[idx+3] = 255;
      }
    }
  }
}

function applyHalftoneEffect(srcImg) {
  if (!srcImg) return null;
  //checking pixels are valid before processing
  if (!ensureValidPixels(srcImg, 'applyHalftoneEffect input')) {
    return createHalftoneCopy(srcImg) || srcImg;
  }
  try {
    //runs the halftone effect
    const result = createHalftoneEffect(srcImg);
    //checking output image is valid
    if (result && ensureValidPixels(result, 'applyHalftoneEffect result')) {
      return result;
    } else {
      //returns a copy of original
      return createHalftoneCopy(srcImg) || srcImg;
    }
  } catch (e) {
    return createHalftoneCopy(srcImg) || srcImg;
  }
}

//setting cell size
function setHalftoneDotSize(value) {
  halftoneDotSize = clampHalftone(parseInt(value) || 2, 1, 10);
}

//setting contrast
function setHalftoneContrast(value) {
  halftoneContrast = clampHalftone(parseFloat(value) || 0.8, 0.5, 3.0);
}

//exportting for global use
window.applyHalftoneEffect = applyHalftoneEffect;
window.setHalftoneDotSize = setHalftoneDotSize;
window.setHalftoneContrast = setHalftoneContrast;