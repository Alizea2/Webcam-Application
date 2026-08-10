function createGrayscaleImage() {
  //making a new grayscale image of same size as scaledImg
  grayscaleImg = createImage(scaledImg.width, scaledImg.height);

  //copying pixels from scaledImg into grayscaleImg
  grayscaleImg.copy(
    scaledImg,
    0, 0,
    scaledImg.width, scaledImg.height,
    0, 0,
    scaledImg.width, scaledImg.height
  );

  grayscaleImg.loadPixels();

  //looping over every pixel
  for (let y = 0; y < grayscaleImg.height; y++) {
    for (let x = 0; x < grayscaleImg.width; x++) {
      let index = (y * grayscaleImg.width + x) * 4;

      //extracting rgb values
      let r = grayscaleImg.pixels[index + 0];
      let g = grayscaleImg.pixels[index + 1];
      let b = grayscaleImg.pixels[index + 2];

      //converting to grayscale using luminosity formula
      let gray = r * 0.299 + g * 0.587 + b * 0.114;

      //increaseing brightness by 20% 
      gray = Math.min(Math.round(gray * 1.2), 255);

      //assigning back into r,g,b channels
      grayscaleImg.pixels[index + 0] = gray;
      grayscaleImg.pixels[index + 1] = gray;
      grayscaleImg.pixels[index + 2] = gray;
      //full opacity
      grayscaleImg.pixels[index + 3] = 255; 
    }
  }

  grayscaleImg.updatePixels();
}

function splitRGBChannels() {
  //making three new images for red,green and blue
  rgbChannels = {
    red: createImage(scaledImg.width, scaledImg.height),
    green: createImage(scaledImg.width, scaledImg.height),
    blue: createImage(scaledImg.width, scaledImg.height),
  };

  scaledImg.loadPixels();
  Object.values(rgbChannels).forEach((ch) => ch.loadPixels());

  //looping through every pixel
  for (let i = 0; i < scaledImg.pixels.length; i += 4) {
    //red channel visualization 
    //keeping r and zero out g and b)
    rgbChannels.red.pixels[i]     = scaledImg.pixels[i];
    rgbChannels.red.pixels[i + 1] = 0;
    rgbChannels.red.pixels[i + 2] = 0;
    rgbChannels.red.pixels[i + 3] = 255;

    //green channel visualization 
    //keeping g and zero out r and b)
    rgbChannels.green.pixels[i]     = 0;
    rgbChannels.green.pixels[i + 1] = scaledImg.pixels[i + 1];
    rgbChannels.green.pixels[i + 2] = 0;
    rgbChannels.green.pixels[i + 3] = 255;

    //blue channel visualization 
    //keeping b and zero out r and g)
    rgbChannels.blue.pixels[i]     = 0;
    rgbChannels.blue.pixels[i + 1] = 0;
    rgbChannels.blue.pixels[i + 2] = scaledImg.pixels[i + 2];
    rgbChannels.blue.pixels[i + 3] = 255;
  }

  //applying changes
  Object.values(rgbChannels).forEach((ch) => ch.updatePixels());
}

function convertColorSpaces() {
  //preparing two images one for YCbCr and one for HSV
  colorSpaceImgs = {
    YCbCr: createImage(scaledImg.width, scaledImg.height),
    HSV: createImage(scaledImg.width, scaledImg.height),
  };

  //YCbCr conversion 
  scaledImg.loadPixels();
  colorSpaceImgs.YCbCr.loadPixels();
  for (let i = 0; i < scaledImg.pixels.length; i += 4) {
    const r = scaledImg.pixels[i] / 255;
    const g = scaledImg.pixels[i + 1] / 255;
    const b = scaledImg.pixels[i + 2] / 255;

    //YCbCr formulas
    const y  = 0.299 * r + 0.587 * g + 0.114 * b;
    const cb = 0.564 * (b - y);
    const cr = 0.713 * (r - y);

    //maping Y,Cb,Cr into rgb channels for visualization
    //Y=r
    colorSpaceImgs.YCbCr.pixels[i]     = y * 255;          
    //Cb=g
    colorSpaceImgs.YCbCr.pixels[i + 1] = (cb + 0.5) * 255; 
    //Cr=b
    colorSpaceImgs.YCbCr.pixels[i + 2] = (cr + 0.5) * 255; 
    colorSpaceImgs.YCbCr.pixels[i + 3] = 255;
  }
  colorSpaceImgs.YCbCr.updatePixels();

  scaledImg.loadPixels();
  colorSpaceImgs.HSV.loadPixels();
  for (let i = 0; i < scaledImg.pixels.length; i += 4) {
    const r = scaledImg.pixels[i] / 255;
    const g = scaledImg.pixels[i + 1] / 255;
    const b = scaledImg.pixels[i + 2] / 255;

    //CalculatING max,min FOR HSV
    const maxv = Math.max(r, g, b);
    const minv = Math.min(r, g, b);
    let h, s, v = maxv;

    const d = maxv - minv;
    s = maxv === 0 ? 0 : d / maxv;

    if (maxv === minv) {
      //no hue if all equal
      h = 0; 
    } else {
      switch (maxv) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2;               break;
        case b: h = (r - g) / d + 4;               break;
      }
      //normalize to [0,1]
      h /= 6; 
    }

    //mapping HSV values into rgb channels for visualization
    //H=r
    colorSpaceImgs.HSV.pixels[i]     = h * 255; 
    //S=g
    colorSpaceImgs.HSV.pixels[i + 1] = s * 255; 
    //V=b
    colorSpaceImgs.HSV.pixels[i + 2] = v * 255; 
    colorSpaceImgs.HSV.pixels[i + 3] = 255;
  }
  colorSpaceImgs.HSV.updatePixels();
}