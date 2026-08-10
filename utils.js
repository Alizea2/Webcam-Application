function p5ImageToDataURL(p5img, outW = 320) {
  //keeps aspect ratio
  const outH = Math.round((p5img.height / p5img.width) * outW);

  //making a new canvas
  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;

  //drawing settings
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  //smoothing scale
  ctx.imageSmoothingEnabled = true;  
  //quality     
  ctx.imageSmoothingQuality = 'high';     

  //drawing the image onto the canvas
  ctx.drawImage(p5img.canvas, 0, 0, outW, outH);

  //giving image as data url
  return canvas.toDataURL('image/png');
}

//makeing first letter uppercase
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

//changing label color at slider maximum
function updateChannelLabelColor(labEl, channelName, value) {
  const val = typeof value === 'string' ? parseInt(value, 10) : value;

  if (val === 0) {
    //showing channel color at 0
    if (channelName === 'red')   labEl.style.color = 'red';
    else if (channelName === 'green') labEl.style.color = 'green';
    else if (channelName === 'blue')  labEl.style.color = 'blue';
  } else if (val === 255) {
    //at max = black
    labEl.style.color = 'black';
  } else {
    //reseting default
    labEl.style.color = '';
  }
}