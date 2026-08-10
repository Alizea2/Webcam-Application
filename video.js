//setting up webcam video
function setupVideoFeed() {
  //using existing video element or making a new one
  video = document.getElementById('video-feed') || document.createElement('video');
  video.setAttribute('autoplay', '');
  video.setAttribute('playsinline', '');
  if (!video.id) {
    document.getElementById('video-container').prepend(video);
  }

  //asking for webcam access
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { video.srcObject = stream; })
    .catch(err => {
      console.error("Error accessing camera:", err);
      const el = document.getElementById('confirmation');
      if (el) el.textContent = "Error accessing camera. Please allow camera permissions.";
    });
}

//taking a snapshot from video
function takeSnapshot() {
  //making a canvas same size as the video
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = video.videoWidth || 640;
  tempCanvas.height = video.videoHeight || 480;

  //drawing current video frame
  const ctx = tempCanvas.getContext('2d');
  ctx.drawImage(video, 0, 0);

  //copying canvas pixels into a p5 image
  img = createImage(tempCanvas.width, tempCanvas.height);
  img.loadPixels();
  const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  img.pixels.set(new Uint8ClampedArray(imageData.data));
  img.updatePixels();

  //processing and updating ui
  processImage();
  const conf = document.getElementById('confirmation');
  if (conf) conf.textContent = 'Snapshot captured!';
}
