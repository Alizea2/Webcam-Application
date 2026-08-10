//making histogram of pixel values (0–255) for one channel
function buildHistogram(baseImg, channel) {
  baseImg.loadPixels();
  const hist = new Array(256).fill(0);
  for (let i = 0; i < baseImg.pixels.length; i += 4) {
    //channel value
    const v = baseImg.pixels[i + channel] | 0; 
    hist[v]++;
  }
  return hist;
}

//finding best threshold using otsu’s method
function otsuFromHistogram(hist) {
  const total = hist.reduce((a, b) => a + b, 0);
  //fallback
  if (!total) return 128; 

  let sumAll = 0;
  for (let t = 0; t < 256; t++) sumAll += t * hist[t];

  let sumB = 0, wB = 0, maxVar = -1, bestT = 128;

  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;

    const wF = total - wB;
    if (wF === 0) break;

    sumB += t * hist[t];

    //mean background
    const mB = sumB / wB;        
    //mean foreground       
    const mF = (sumAll - sumB) / wF;    
    const betweenVar = wB * wF * (mB - mF) * (mB - mF);

    if (betweenVar > maxVar) {
      maxVar = betweenVar;
      bestT = t;
    }
  }
  return bestT;
}

//computting otsu threshold for given channel
function computeOtsuThreshold(baseImg, channel) {
  const hist = buildHistogram(baseImg, channel);
  return otsuFromHistogram(hist);
}

//HSV thresholds (h, s, v)
function calculateHSVThresholds(hsvImg) {
  return {
    h: computeOtsuThreshold(hsvImg, 0),
    s: computeOtsuThreshold(hsvImg, 1),
    v: computeOtsuThreshold(hsvImg, 2),
  };
}

//YCbCr thresholds (y, cb, cr)
function calculateYCbCrThresholds(ycbcrImg) {
  return {
    y:  computeOtsuThreshold(ycbcrImg, 0),
    cb: computeOtsuThreshold(ycbcrImg, 1),
    cr: computeOtsuThreshold(ycbcrImg, 2),
  };
}

//making a thresholded image for RGB channel
function applyChannelThresholdColor(baseImg, threshold, channel) {
  //new empty image same size as base
  const out = createImage(baseImg.width, baseImg.height);
  out.loadPixels();
  baseImg.loadPixels();

  //goes through all pixels
  for (let i = 0; i < baseImg.pixels.length; i += 4) {
    //checking if this pixels channel value is >= threshold
    const pass = baseImg.pixels[i + channel] >= threshold;

    //default color is black
    let r = 0, g = 0, b = 0;

    //if pixel passes color it with the channel color
    if (pass) {
      //red
      if (channel === 0) r = 255; 
      //green
      if (channel === 1) g = 255; 
      //blue
      if (channel === 2) b = 255; 
    }

    //setting pixel in output image
    out.pixels[i]     = r;
    out.pixels[i + 1] = g;
    out.pixels[i + 2] = b;
    //stting alpha to full
    out.pixels[i + 3] = 255; 
  }

  //applying changes
  out.updatePixels();
  return out;
}

//dimming, lightening, darkening and smoothning the hsv and ycbcr
function applyColorSpaceFilterColor(colorImg, threshold, channel, dimFactorBase = 0.25) {
  //making new output image
  const out = createImage(colorImg.width, colorImg.height);
  out.loadPixels();
  colorImg.loadPixels();

  //turning threshold into a value between -1 and 1
  let t = (threshold - 128) / 127;  
  t = Math.max(-1, Math.min(1, t));

  //making a gentle curve for smooth changes
  const curve = Math.sqrt(Math.abs(t)) * 0.5;
  //lighten side
  const lighten = t < 0 ? curve : 0;
  //darken side 
  const darken  = t > 0 ? curve : 0; 

  //looping over all pixels
  for (let i = 0; i < colorImg.pixels.length; i += 4) {
    //channel value
    const val = colorImg.pixels[i + channel];  
    //checking against threshold  
    const pass = val >= threshold;               

    //starting with original color
    let r = colorImg.pixels[i];
    let g = colorImg.pixels[i + 1];
    let b = colorImg.pixels[i + 2];

    //if it fails threshold dimming the pixel
    if (!pass) { r *= dimFactorBase; g *= dimFactorBase; b *= dimFactorBase; }

    //if lighten is active blending toward white
    if (lighten > 0) {
      r = r * (1 - lighten) + 255 * lighten;
      g = g * (1 - lighten) + 255 * lighten;
      b = b * (1 - lighten) + 255 * lighten;
    }

    //if darken is active blending toward black
    if (darken > 0) {
      r = r * (1 - darken);
      g = g * (1 - darken);
      b = b * (1 - darken);
    }

    //setting output pixel
    out.pixels[i]     = Math.min(255, Math.max(0, r));
    out.pixels[i + 1] = Math.min(255, Math.max(0, g));
    out.pixels[i + 2] = Math.min(255, Math.max(0, b));
    out.pixels[i + 3] = 255;
  }

  //updating and returning
  out.updatePixels();
  return out;
}