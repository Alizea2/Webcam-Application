/*************************************************************** COMMENTARY **************************************************************
Findings:
My threshold system works by comparing pixel values against slider-controlled cutoffs. For RGB channels, pixels above the threshold show 
pure colors (red, green, blue), while others turn black, creating binary masks that reveal color distribution patterns. I added Otsu auto 
thresholding, which examines pixel histograms statistically to find optimal separation points. The most interesting part for me is how color 
space thresholding works in YCbCr and HSV. Rather than using sharp binary cuts, I adjust the Y (brightness) and V (value) channels while 
preserving the original colors by dimming pixels that fall short instead of turning them black. This preserves color data while filtering by 
brightness, producing much more natural results.

When doing geometric transformations like face warping or kaleidoscope effects, going back to source coordinates usually puts you between 
pixels. My bilinear interpolation fixes this by blending the four closest pixels weighted by their distances. I blend the top row pixels 
horizontally, then blend the bottom row pixels horizontally, and finally combine those results vertically. This eliminates the jagged, 
pixelated appearance that results from merely rounding to the nearest pixels. I employ this in faceWarp.js for fisheye, pincushion, and 
swirl distortions, and in kaleidoscope.js for radial mirroring, with boundary clamping to prevent crashes when coordinates exceed limits.

Problem:
I initially tried using ML5.js faceMesh for face detection, but ran into compatibility issues and poor performance with real time webcam 
processing. The library was too heavy and caused frame rate drops. I switched to objectdetect.js with the frontalface classifier.  It 
gave me stable rectangle based detection that worked much better for me. I added confidence filtering which meant keeping detections with score 
>= 2 and rectangle grouping to eliminate overlapping false positives. This solution was lighter and more reliable for real time use.

Time:
The project went way beyond what I originally planned. I finished the basic requirements early, which gave me time to build four advanced 
extras. The modular setup let me add new features quickly without breaking what already worked. If I'd run out of time, I would have focused
on the core functions and simplified my add-ons.

Extentions:
1. GLITCH ART: Utilizes RGB channel shifting to produce digital distortion effects using the spatial offset of red, green, and blue channels. 
The program encases pixel indices to generate distortions resembling chromatic aberration, with intensity control influencing the extent of 
the shift.
2. KALEIDOSCOPE: Creates symmetrical patterns by connecting each output pixel to source coordinates through radial splitting and reflection. 
The effect offers automated rotation and lets you choose the amount of segments. It uses bilinear sampling for seamless visual mixing.
3. HALFTONE DOTS: Emulates conventional print halftoning by assessing luminosity in grid cells and rendering proportionately sized black 
dots on a white backdrop. Executes bespoke circular rasterization featuring contrast and dot size adjustments for artistic newspaper-style
effects.
4. FACE WARP: Applies fisheye, pincushion, or swirl distortions centered on detected faces. Uses auto centering based on face detection 
results and implements radial coordinate transformation with bilinear sampling for smooth distortion effects without artifacts.
 
*************************************************************** COMMENTARY **************************************************************/

//webcam video
let video;    
//p5 canvas          
let canvas;
//snapshot image             
let img;       
//160x120 copy for processing         
let scaledImg;  
//grayscale version        
let grayscaleImg;     
//R/G/B split images  
let rgbChannels = {};   
//HSV,YCbCr images
let colorSpaceImgs = {}; 
//default thresholds
let thresholdValues = { red: 128, green: 128, blue: 128 }; 
//face replace mode 0–4
let faceReplaceMode = 0;

function setup() {
  //starting webcam
  setupVideoFeed();  
  //wires buttons and keys   
  setupControls();      

  //making canvas for showing video feed
  canvas = createCanvas(640, 480);
  canvas.parent('video-container');
}

//processing the current snapshot image
function processImage() {
  //downscaling image to 160x120 for processing
  scaledImg = createImage(160, 120);
  scaledImg.copy(img, 0, 0, img.width, img.height, 0, 0, 160, 120);

  //building grayscale, RGB channels, color spaces
  createGrayscaleImage();
  splitRGBChannels();
  convertColorSpaces();

  //preparing face detector for scaled image size
  ensureFaceDetector(scaledImg.width, scaledImg.height);

  //updating the image grid with all tiles
  updateImageGrid();
}

//handles key presses
function keyPressed() {
  //number keys 0–4 switch face replace mode
  if (key >= '0' && key <= '4') {
    faceReplaceMode = parseInt(key, 10);
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    const active = document.getElementById(`mode${faceReplaceMode}`);
    if (active) active.classList.add('active');
    //reprocessing with new mode
    if (img) processImage(); 
  }
  //spacebar also takes snapshot
  if (key === ' ') takeSnapshot();
}