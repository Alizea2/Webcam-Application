//default intensity value
let glitchIntensity = 50; 

//random integer between min and max
function _randInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
//clamping value between lo and hi
function _clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

//helper for p5 image
function deepCopyP5Image(srcImg) {
  if (!srcImg || !srcImg.width || !srcImg.height) return null;

  //making new image same size
  const copy = createImage(srcImg.width, srcImg.height);
  
  //loading pixels into memory
  srcImg.loadPixels();
  copy.loadPixels();
  
  //checking that pixels are ready
  if (!srcImg.pixels || srcImg.pixels.length !== srcImg.width * srcImg.height * 4) return null;
  
  //copying pixel values
  for (let i = 0; i < srcImg.pixels.length; i++) {
    copy.pixels[i] = srcImg.pixels[i];
  }
  copy.updatePixels();
  return copy;
}

//pixel validation helper
function validateAndPreparePixelData(img, functionName) {
  if (!img) return false;
  if (!img.width || !img.height) return false;
  
  //loading pixels
  img.loadPixels();
  const expectedLength = img.width * img.height * 4;
  
  //checking length
  if (!img.pixels || img.pixels.length !== expectedLength) return false;
  
  //checking for non empty data
  let hasData = false;
  for (let i = 0; i < Math.min(img.pixels.length, 100); i += 4) {
    if (img.pixels[i] > 0 || img.pixels[i+1] > 0 || img.pixels[i+2] > 0) {
      hasData = true; break;
    }
  }
  return hasData;
}

//shifting color channels apart
function rgbSplit(srcImg) {
  const workingCopy = deepCopyP5Image(srcImg);
  if (!workingCopy || !validateAndPreparePixelData(workingCopy, 'rgbSplit')) {
    return deepCopyP5Image(srcImg) || srcImg;
  }

  const out = createImage(workingCopy.width, workingCopy.height);
  out.loadPixels();

  const w = workingCopy.width, h = workingCopy.height;
  //shifts based on intensity
  const pxShift = Math.round((glitchIntensity / 100) * Math.max(2, Math.floor(w * 0.08)));
  const total = w * h * 4;
  
  try {
    for (let i = 0; i < total; i += 4) {
      //shift r,g,b differently
      let rIdx = (i + pxShift * 4) % total;
      let gIdx = (i + pxShift * 8) % total;
      let bIdx = (i + pxShift * 12) % total;

      //aligning to pixel boundaries
      rIdx = Math.floor(rIdx / 4) * 4;
      gIdx = Math.floor(gIdx / 4) * 4;
      bIdx = Math.floor(bIdx / 4) * 4;

      //staying in bounds
      rIdx = Math.max(0, Math.min(total - 4, rIdx));
      gIdx = Math.max(0, Math.min(total - 4, gIdx));
      bIdx = Math.max(0, Math.min(total - 4, bIdx));

      //copying shifted channels
      //r
      out.pixels[i]     = workingCopy.pixels[rIdx];     
      //g
      out.pixels[i + 1] = workingCopy.pixels[gIdx + 1]; 
      //b
      out.pixels[i + 2] = workingCopy.pixels[bIdx + 2]; 
      //a
      out.pixels[i + 3] = 255;                          
    }
  } catch (e) {
    //copying original pixels
    for (let i = 0; i < total; i++) {
      out.pixels[i] = workingCopy.pixels[i];
    }
  }

  out.updatePixels();
  return out;
}

//apply glitch effect
function applyGlitchEffect(srcImg) {
  if (!srcImg) return null;
  if (!validateAndPreparePixelData(srcImg, 'applyGlitchEffect input')) {
    return deepCopyP5Image(srcImg) || srcImg;
  }

  try {
    //run the rgb split glitch
    const result = rgbSplit(srcImg);
    //check that the result is valud
    if (result && validateAndPreparePixelData(result, 'applyGlitchEffect result')) {
      return result;
    } else {
      //if bad returing orignal
      return deepCopyP5Image(srcImg) || srcImg;
    }
  } catch (e) {
    //if goes wrong then original
    return deepCopyP5Image(srcImg) || srcImg;
  }
}

//seting glitch intensity from outside 
function setGlitchIntensity(value) {
  glitchIntensity = _clamp(parseInt(value) || 0, 0, 100);
}

//exportting for global use
window.applyGlitchEffect = applyGlitchEffect;
window.setGlitchIntensity = setGlitchIntensity;