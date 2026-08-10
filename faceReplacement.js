//label for each mode 
function faceReplacementLabel(mode) {
  switch (mode) {
    case 0: return 'Face Detection';
    case 1: return 'Face Replacement: Grayscale';
    case 2: return 'Face Replacement: Blurred';
    case 3: return 'Face Replacement: Colour Converted (HSV)';
    case 4: return 'Face Replacement: Pixelated';
    default: return 'Face Detection';
  }
}

//running face detector and returning grouped rectangles
function getGroupedFaceRects(srcImg) {
  if (!srcImg) return [];
  ensureFaceDetector(srcImg.width, srcImg.height);
  if (!faceDetector) return [];

  //getting canvas reference
  const srcCanvas = srcImg.canvas || srcImg.elt;
  if (!srcCanvas) return [];

  //running detection and group overlapping results
  let rects = faceDetector.detect(srcCanvas);
  rects = objectdetect.groupRectangles(rects, 1);

  //keeping only confident results 
  rects = rects.filter(r => (r[4] || 1) >= 2);
  return rects;
}

//picking the largest rectangle 
function getLargestRect(rects) {
  if (!rects || !rects.length) return null;
  let best = rects[0];
  let bestArea = best[2] * best[3];
  for (let i = 1; i < rects.length; i++) {
    const a = rects[i][2] * rects[i][3];
    if (a > bestArea) { best = rects[i]; bestArea = a; }
  }
  return best; 
}

//croping face from source image
function cropFace(srcImg, rect) {
  const [x, y, w, h] = rect.map(v => Math.max(0, Math.floor(v)));
  const out = createImage(w, h);
  out.copy(srcImg, x, y, w, h, 0, 0, w, h);
  return out;
}

//pasting processed face back into base image
function compositeFace(baseImg, rect, faceImg) {
  const [x, y, w, h] = rect.map(v => Math.floor(v));
  const out = createImage(baseImg.width, baseImg.height);
  out.copy(baseImg, 0, 0, baseImg.width, baseImg.height, 0, 0, out.width, out.height);

  //drawing face on top
  const ctx = out.canvas.getContext('2d');
  ctx.drawImage(faceImg.canvas || faceImg.elt, x, y, w, h);
  return out;
}

//converting face to grayscale
function toGrayscale(p) {
  const img = createImage(p.width, p.height);
  img.loadPixels(); p.loadPixels();
  for (let i = 0; i < p.pixels.length; i += 4) {
    const r = p.pixels[i], g = p.pixels[i+1], b = p.pixels[i+2];
    const gray = Math.min(255, Math.round(0.299*r + 0.587*g + 0.114*b));
    img.pixels[i] = img.pixels[i+1] = img.pixels[i+2] = gray;
    img.pixels[i+3] = 255;
  }
  img.updatePixels();
  return img;
}

//bluring by downscaling then upscaling
function toBlurred(p, factor = 0.2) {
  const w = p.width, h = p.height;
  const smallW = Math.max(1, Math.round(w * factor));
  const smallH = Math.max(1, Math.round(h * factor));

  //drawing to small canvas
  const small = document.createElement('canvas');
  small.width = smallW; small.height = smallH;
  const sctx = small.getContext('2d');
  sctx.imageSmoothingEnabled = true;
  sctx.drawImage(p.canvas || p.elt, 0, 0, smallW, smallH);

  //scaling back up
  const out = createImage(w, h);
  const octx = out.canvas.getContext('2d');
  octx.imageSmoothingEnabled = true;
  octx.drawImage(small, 0, 0, w, h);
  return out;
}

//converting to HSV visualization 
function toHSVVisual(p) {
  const out = createImage(p.width, p.height);
  out.loadPixels(); p.loadPixels();
  for (let i = 0; i < p.pixels.length; i += 4) {
    const r = p.pixels[i] / 255, g = p.pixels[i+1] / 255, b = p.pixels[i+2] / 255;
    const maxv = Math.max(r,g,b), minv = Math.min(r,g,b);
    let h, s, v = maxv;
    const d = maxv - minv;
    s = maxv === 0 ? 0 : d / maxv;

    if (maxv === minv) {
      h = 0;
    } else if (maxv === r) {
      h = (g - b) / d + (g < b ? 6 : 0);
    } else if (maxv === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }
    h /= 6;

    out.pixels[i]   = Math.round(h * 255);
    out.pixels[i+1] = Math.round(s * 255);
    out.pixels[i+2] = Math.round(v * 255);
    out.pixels[i+3] = 255;
  }
  out.updatePixels();
  return out;
}

//pixelating by filling 5x5 blocks with average color
function toPixelated(p, block = 5) {
  const out = createImage(p.width, p.height);
  out.loadPixels();
  p.loadPixels();

  //spliting the image into blocks of size 5x5
  for (let by = 0; by < p.height; by += block) {
    for (let bx = 0; bx < p.width; bx += block) {
      
      //calculating average pixel intensity
      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      const maxY = Math.min(p.height, by + block);
      const maxX = Math.min(p.width,  bx + block);

      //looping over pixels inside this block
      for (let y = by; y < maxY; y++) {
        for (let x = bx; x < maxX; x++) {
          const idx = (y * p.width + x) * 4;
          //red channel
          sumR += p.pixels[idx];     
          //green channel  
          sumG += p.pixels[idx + 1]; 
          //blue channel
          sumB += p.pixels[idx + 2];   
          count++;
        }
      }

      //average color for this block
      const aveR = Math.round(sumR / count);
      const aveG = Math.round(sumG / count);
      const aveB = Math.round(sumB / count);

      //painting the entire block with the average color
      for (let y = by; y < maxY; y++) {
        for (let x = bx; x < maxX; x++) {
          const idx = (y * p.width + x) * 4;
          out.pixels[idx]     = aveR;
          out.pixels[idx + 1] = aveG;
          out.pixels[idx + 2] = aveB;
          // full opacity
          out.pixels[idx + 3] = 255;   
        }
      }
    }
  }

  //updating pixels 
  out.updatePixels();
  return out;
}

//replacing face in scaled image depending on mode
function makeFaceReplacementComposite(srcScaledImg, mode) {
  const rects = getGroupedFaceRects(srcScaledImg);
  const rect = getLargestRect(rects);
  
  //face detection 
  if (mode === 0) {
    //drawing bounding boxes
    return detectFaces(srcScaledImg); 
  }
  
  if (!rect) return srcScaledImg;

  //crops the detected face
  const face = cropFace(srcScaledImg, rect);

  //applying the chosen processing
  let processed;
  switch (mode) {
    case 1: processed = toGrayscale(face); break;
    case 2: processed = toBlurred(face, 0.15); break; 
    case 3: processed = toHSVVisual(face); break;
    case 4: processed = toPixelated(face, 5); break;
    default: processed = face; break;
  }

  //puting processed face back into image
  return compositeFace(srcScaledImg, rect, processed);
}