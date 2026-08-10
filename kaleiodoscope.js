//total mirrored segments
let kaleidoscopeSegments = 6;
//rotation angle      
let kaleidoscopeRotation = 0;       

//keeping value between lo and hi
function limitRange(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

//making a deep copy of a p5 image
function copyImage(srcImg) {
  if (!srcImg || !srcImg.width || !srcImg.height) return null;
  
  const copy = createImage(srcImg.width, srcImg.height);
  srcImg.loadPixels();
  copy.loadPixels();
  
  if (!srcImg.pixels || srcImg.pixels.length !== srcImg.width * srcImg.height * 4) {
    return null;
  }
  for (let i = 0; i < srcImg.pixels.length; i++) {
    copy.pixels[i] = srcImg.pixels[i];
  }
  copy.updatePixels();
  return copy;
}

//checking that image pixels are valid
function validatePixels(img, functionName) {
  if (!img) { console.warn(`${functionName}: No image`); return false; }
  if (!img.width || !img.height) { console.warn(`${functionName}: Bad size`); return false; }
  
  img.loadPixels();
  const expectedLength = img.width * img.height * 4;
  if (!img.pixels || img.pixels.length !== expectedLength) {
    console.warn(`${functionName}: Bad pixels`); 
    return false;
  }
  return true;
}

//finding source coordinates for kaleidoscope effect
function getKaleidoscopeSourceCoords(x, y, imgWidth, imgHeight) {
  const centerX = imgWidth * 0.5;
  const centerY = imgHeight * 0.5;
  
  //distance from center
  const dx = x - centerX;
  const dy = y - centerY;
  let radius = Math.sqrt(dx * dx + dy * dy);
  let angle = Math.atan2(dy, dx);
  
  //adding slow rotation
  angle += kaleidoscopeRotation * 0.005;
  
  //angle covered by each segment
  const segmentAngle = (Math.PI * 2) / kaleidoscopeSegments;
  
  //keeping angle positive
  while (angle < 0) angle += Math.PI * 2;
  
  //findingg segment index
  const segmentIndex = Math.floor(angle / segmentAngle);
  let localAngle = angle - (segmentIndex * segmentAngle);
  
  //flipping every second segment
  if (segmentIndex % 2 === 1) {
    localAngle = segmentAngle - localAngle;
  }
  
  //shrinking radius a bit
  const scaleFactor = 0.6;
  radius = radius * scaleFactor;
  
  //keeping radius inside bounds
  const maxRadius = Math.min(imgWidth, imgHeight) * 0.5;
  radius = radius % maxRadius;
  
  //back to x,y
  const sourceX = centerX + radius * Math.cos(localAngle);
  const sourceY = centerY + radius * Math.sin(localAngle);
  
  return { x: sourceX, y: sourceY };
}

//sample pixel with bilinear interpolation for smooth blending
function samplePixelBilinear(img, x, y) {
  const w = img.width;
  const h = img.height;
  
  x = limitRange(x, 0, w - 1);
  y = limitRange(y, 0, h - 1);
  
  const x1 = Math.floor(x), y1 = Math.floor(y);
  const x2 = Math.min(x1 + 1, w - 1);
  const y2 = Math.min(y1 + 1, h - 1);
  const fx = x - x1, fy = y - y1;
  
  const getPixel = (px, py) => {
    const idx = (py * w + px) * 4;
    return [
      img.pixels[idx] || 0,
      img.pixels[idx + 1] || 0,
      img.pixels[idx + 2] || 0,
      img.pixels[idx + 3] || 255
    ];
  };
  
  //top left
  const p1 = getPixel(x1, y1); 
  //top right
  const p2 = getPixel(x2, y1); 
  //bottom left
  const p3 = getPixel(x1, y2); 
  //bottom right
  const p4 = getPixel(x2, y2); 
  
  const result = [0, 0, 0, 255];
  for (let c = 0; c < 3; c++) {
    const top = p1[c] * (1 - fx) + p2[c] * fx;
    const bottom = p3[c] * (1 - fx) + p4[c] * fx;
    result[c] = Math.round(top * (1 - fy) + bottom * fy);
    //brightening a little
    result[c] = Math.min(255, result[c] * 1.1); 
  }
  return result;
}

//creating the kaleidoscope effect image
function createKaleidoscopeEffect(srcImg) {
  const workingCopy = copyImage(srcImg);
  if (!workingCopy || !validatePixels(workingCopy, 'createKaleidoscopeEffect')) {
    console.warn('createKaleidoscopeEffect: failed, return copy');
    return copyImage(srcImg) || srcImg;
  }

  const out = createImage(workingCopy.width, workingCopy.height);
  out.loadPixels();

  const w = workingCopy.width, h = workingCopy.height;
  
  try {
    //looping through every pixel
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const outputIdx = (y * w + x) * 4;
        //finding source pixel for kaleidoscope mapping
        const sourceCoords = getKaleidoscopeSourceCoords(x, y, w, h);
        //sampling with bilinear
        const sampledPixel = samplePixelBilinear(workingCopy, sourceCoords.x, sourceCoords.y);
        //setting pixel in output
        out.pixels[outputIdx]     = sampledPixel[0];
        out.pixels[outputIdx + 1] = sampledPixel[1];
        out.pixels[outputIdx + 2] = sampledPixel[2];
        out.pixels[outputIdx + 3] = sampledPixel[3];
      }
    }
    //slowly rotating the effect
    kaleidoscopeRotation += 0.5;
    if (kaleidoscopeRotation > 1256) kaleidoscopeRotation = 0;
  } catch (e) {
    console.warn('Error in createKaleidoscopeEffect:', e);
    //copying original
    for (let i = 0; i < workingCopy.pixels.length; i++) {
      out.pixels[i] = workingCopy.pixels[i];
    }
  }

  out.updatePixels();
  return out;
}

//applying kaleidoscope effect safely
function applyKaleidoscopeEffect(srcImg) {
  if (!srcImg) return null;
  if (!validatePixels(srcImg, 'applyKaleidoscopeEffect input')) {
    return copyImage(srcImg) || srcImg;
  }

  try {
    const result = createKaleidoscopeEffect(srcImg);
    if (result && validatePixels(result, 'applyKaleidoscopeEffect result')) {
      return result;
    } else {
      return copyImage(srcImg) || srcImg;
    }
  } catch (e) {
    console.error('Error in applyKaleidoscopeEffect:', e);
    return copyImage(srcImg) || srcImg;
  }
}

//changing number of segments
function setKaleidoscopeSegments(value) {
  kaleidoscopeSegments = limitRange(parseInt(value) || 6, 3, 12);
}

//exportting for global use
window.applyKaleidoscopeEffect = applyKaleidoscopeEffect;
window.setKaleidoscopeSegments = setKaleidoscopeSegments;