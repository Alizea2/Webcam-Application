//global face detector instance
let faceDetector = null;
//dimensions
let detectorW = 0, detectorH = 0;

//ensuring a detector exists 
function ensureFaceDetector(imgW, imgH) {
  //if library not loadedthen stop
  if (typeof objectdetect === 'undefined' || !objectdetect.frontalface) {
    console.warn('objectdetect library not loaded.');
    faceDetector = null;
    return;
  }
  //recreate detector if not made yet, or if image size changed
  if (!faceDetector || detectorW !== imgW || detectorH !== imgH) {
    detectorW = imgW;
    detectorH = imgH;
    faceDetector = new objectdetect.detector(
      //width and height of analysis window
      imgW, imgH, 
      // scale factor for detection   
      1.1,           
      //using the frontal face model
      objectdetect.frontalface 
    );
  }
}

//runing face detection on the image
function detectFaces(colorImg) {
  if (!colorImg) return null;

  //preparing detector for current size
  ensureFaceDetector(colorImg.width, colorImg.height);
  if (!faceDetector) return colorImg;

  //getting canvas from p5 image or html image element
  const srcCanvas = colorImg.canvas || colorImg.elt;
  if (!srcCanvas) return colorImg;

  //runing detection to get rects
  let rects = faceDetector.detect(srcCanvas);

  //grouping overlapping detectionsand keeping stronger ones
  rects = objectdetect.groupRectangles(rects, 1);
  rects = rects.filter(r => (r[4] || 1) >= 2);

  //copying the input image so original stays unchanged
  const out = createImage(colorImg.width, colorImg.height);
  out.copy(colorImg, 0, 0, colorImg.width, colorImg.height, 0, 0, out.width, out.height);

  //drawing rectangles on output image
  const ctx = out.canvas.getContext('2d');
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'red';

  rects.forEach(([x, y, w, h]) => {
    //clamping rectangle so it stays within image bounds
    const rx = Math.max(0, x);
    const ry = Math.max(0, y);
    const rw = Math.min(w, out.width  - rx);
    const rh = Math.min(h, out.height - ry);
    ctx.strokeRect(rx, ry, rw, rh);
  });

  //returing image with rectd 
  ctx.restore();
  return out;
}