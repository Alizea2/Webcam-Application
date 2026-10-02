# Webcam Image Processing Application

A browser app built with **p5.js** that takes a snapshot from your webcam and runs it through an image-processing pipeline. It shows the results in a grid: colour channels, thresholding with Otsu's method, colour-space conversions, face detection and replacement, and four creative effects. All of the pixel processing is written by hand.

Built as the final project for a Graphics Programming course.

## Features

### Core image processing
- **Webcam capture**: live feed with a snapshot button (or press `Space`). Snapshots are scaled to 160×120 for processing.
- **Grayscale**: converted to grayscale with brightness increased by 20%
- **RGB channel split**: separate red, green and blue images
- **Channel thresholding**: a slider per channel (0–255), plus an **Auto (Otsu)** button that finds the best threshold from the image's histogram
- **Colour space conversion**: **YCbCr** and **HSV**
- **Colour-space thresholding**: Y and V filters that dim pixels below the threshold instead of turning them black, so the original colours are preserved. Each has its own slider and Otsu button.

### Face detection & replacement
Faces are detected with **objectdetect.js** (frontal-face classifier). Weak detections are filtered out and overlapping boxes are grouped. The detected face can then be:

| Key / Button | Mode |
|--------------|------|
| `0` | Face detection (draws a box) |
| `1` | Grayscale face |
| `2` | Blurred face |
| `3` | Colour-converted face (HSV) |
| `4` | Pixelated face |

### Extensions
1. **Glitch Art**: shifts the R, G and B channels apart for a chromatic-aberration effect, with an intensity slider
2. **Halftone Dots**: newspaper-style dots sized by brightness, with dot-size and contrast sliders
3. **Kaleidoscope**: radial mirroring with a choice of segments and automatic rotation
4. **Face Warp**: fisheye, pincushion or swirl distortion centred on the detected face, with an intensity slider

The kaleidoscope and face warp use **bilinear interpolation** so the distorted images stay smooth.

## Controls

| Input | Action |
|-------|--------|
| **Take Snapshot** button / `Space` | Capture an image from the webcam |
| `0`–`4` keys / mode buttons | Change the face replacement mode |
| Sliders | Adjust thresholds and effect settings live |
| **Auto (Otsu)** buttons | Set the threshold automatically |

## Running the App

The app uses your webcam, and browsers only allow camera access on secure pages or `localhost`. So it has to be served over a local web server. Opening `index.html` directly won't work.

### Quick start (one command)

**Step 1:** Run this command in the terminal first. It downloads the project from GitHub into a temporary folder and starts a local web server:

```bash
D=$(mktemp -d) && gh repo clone Alizea2/Webcam-Application "$D" && cd "$D" && python3 -m http.server 8000
```

**Step 2:** Once the terminal shows `Serving HTTP on ... port 8000`, click this link to open the app in your browser:

**<http://localhost:8000>**

When the browser asks for camera access, click **Allow**. Then press **Take Snapshot** (or `Space`) to process an image.

Keep the terminal open while you use it. When you're done, press `Ctrl + C` in the terminal to stop the server.

> This needs the [GitHub CLI](https://cli.github.com/) (`gh`) signed in to an account that can access this repository, Python 3, and a webcam.

### Other ways to run it

From inside the project folder:

**VS Code:** install the *Live Server* extension, right-click `index.html`, and choose **Open with Live Server**.

**Python:**

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000> in your browser.

## Project Structure

| File | Purpose |
|------|---------|
| `index.html` | Page layout, styles and script loading |
| `sketch.js` | p5.js setup, the processing pipeline and keyboard controls (plus the project commentary) |
| `video.js` | Webcam access and snapshot capture |
| `controls.js` | Snapshot and face-mode buttons |
| `colorSpaces.js` | Grayscale, RGB split, and the YCbCr and HSV conversions |
| `threshold.js` | Histograms, Otsu's method and channel thresholding |
| `grid.js` | Builds the result grid with sliders and buttons |
| `faceDetection.js` | Sets up and runs the objectdetect.js face detector |
| `faceReplacement.js` | Face cropping, filters and compositing |
| `glitchArt.js` | RGB-split glitch effect |
| `halftoneDots.js` | Halftone dot effect |
| `kaleiodoscope.js` | Kaleidoscope effect |
| `faceWrap.js` | Fisheye, pincushion and swirl face warp |
| `utils.js` | Shared helpers |
| `libraries/` | p5.js and objectdetect.js (with the frontal-face classifier) |

## Built With

- [p5.js](https://p5js.org/)
- [objectdetect.js](https://github.com/mtschirs/js-objectdetect): Viola–Jones face detection

## Author

[@Alizea2](https://github.com/Alizea2)
