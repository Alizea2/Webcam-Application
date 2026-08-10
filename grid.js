//making a tile with an image and a label
function addImageTile(grid, p5img, label) {
  const gridItem = document.createElement('div');
  gridItem.className = 'grid-item';

  //labeling text
  const lab = document.createElement('div');
  lab.className = 'grid-label';
  lab.textContent = label;

  //actual <img> element
  const imgEl = document.createElement('img');
  imgEl.style.width = '100%';
  imgEl.alt = label;
  //converting p5 image to URL
  imgEl.src = p5ImageToDataURL(p5img); 

  //assembling tile
  gridItem.appendChild(lab);
  gridItem.appendChild(imgEl);
  grid.appendChild(gridItem);

  return { gridItem, imgEl };
}

//adding a threshold tile for RGB with slider and auto button
function addThresholdTile(grid, channelName, channelIndex, sliderId) {
  //first render
  const initial = applyChannelThresholdColor(scaledImg, thresholdValues[channelName], channelIndex);
  const { gridItem, imgEl } = addImageTile(grid, initial, `Threshold ${capitalize(channelName)}`);

  //wrapper for slider and buttons
  const wrap = document.createElement('div');
  wrap.className = 'slider-row';

  //label for slider
  const lab = document.createElement('span');
  lab.className = 'slider-label';
  lab.textContent = `${capitalize(channelName)}:`;
  updateChannelLabelColor(lab, channelName, thresholdValues[channelName]); // tint at extremes

  //slider element
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '255';
  slider.value = thresholdValues[channelName];
  slider.id = sliderId;
  slider.dataset.channel = channelName;
  slider.className = 'pretty-slider';

  //value bubble
  const valueSpan = document.createElement('span');
  valueSpan.className = 'slider-value';
  valueSpan.textContent = thresholdValues[channelName];

  //Otsu button
  const autoBtn = document.createElement('button');
  autoBtn.className = 'btn';
  autoBtn.textContent = 'Auto (Otsu)';

  //auto button click which compute Otsu and update
  autoBtn.addEventListener('click', () => {
    const t = computeOtsuThreshold(scaledImg, channelIndex);
    thresholdValues[channelName] = t;
    slider.value = String(t);
    valueSpan.textContent = t;
    updateChannelLabelColor(lab, channelName, t);
    imgEl.src = p5ImageToDataURL(applyChannelThresholdColor(scaledImg, t, channelIndex));
  });

  //slider move to update threshold live
  slider.addEventListener('input', (e) => {
    const ch = e.currentTarget.dataset.channel;
    const val = parseInt(e.currentTarget.value, 10);
    thresholdValues[ch] = val;
    valueSpan.textContent = val;
    updateChannelLabelColor(lab, channelName, val);
    imgEl.src = p5ImageToDataURL(applyChannelThresholdColor(scaledImg, val, channelIndex));
  });

  //assemblling
  wrap.appendChild(lab);
  wrap.appendChild(slider);
  wrap.appendChild(valueSpan);
  wrap.appendChild(autoBtn);
  gridItem.appendChild(wrap);
}

//addingYCbCr filter tile with slider + otsu
function addYCbCrThresholdTile(grid, label, sliderId, initialValue = 128, dimFactor = 0.3) {
  let current = initialValue;
  const ycbcr = colorSpaceImgs.YCbCr;

  //first render Y channel only
  let tileImg = applyColorSpaceFilterColor(ycbcr, current, 0, dimFactor);
  const { gridItem, imgEl } = addImageTile(grid, tileImg, label);

  const wrap = document.createElement('div');
  wrap.className = 'slider-row';

  const lab = document.createElement('span');
  lab.className = 'slider-label';
  lab.textContent = 'Y threshold:';

  //slider setup
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '255';
  slider.value = current;
  slider.id = sliderId;
  slider.className = 'pretty-slider';

  const valueSpan = document.createElement('span');
  valueSpan.className = 'slider-value';
  valueSpan.textContent = current;

  const autoBtn = document.createElement('button');
  autoBtn.className = 'btn';
  autoBtn.textContent = 'Auto (Otsu)';

  //auto Otsu for Y channel
  autoBtn.addEventListener('click', () => {
    const { y } = calculateYCbCrThresholds(ycbcr);
    current = y;
    slider.value = String(y);
    valueSpan.textContent = y;
    imgEl.src = p5ImageToDataURL(applyColorSpaceFilterColor(ycbcr, y, 0, dimFactor));
  });

  //slider move
  slider.addEventListener('input', (e) => {
    current = parseInt(e.currentTarget.value, 10);
    valueSpan.textContent = current;
    imgEl.src = p5ImageToDataURL(applyColorSpaceFilterColor(ycbcr, current, 0, dimFactor));
  });

  wrap.appendChild(lab);
  wrap.appendChild(slider);
  wrap.appendChild(valueSpan);
  wrap.appendChild(autoBtn);
  gridItem.appendChild(wrap);
}

//HSV filter tile with slider + auto
function addHSVThresholdTile(grid, label, sliderId, initialValue = 128, dimFactor = 0.3) {
  let current = initialValue;
  const hsv = colorSpaceImgs.HSV;

  //first render V channel
  let tileImg = applyColorSpaceFilterColor(hsv, current, 2, dimFactor);
  const { gridItem, imgEl } = addImageTile(grid, tileImg, label);

  const wrap = document.createElement('div');
  wrap.className = 'slider-row';

  const lab = document.createElement('span');
  lab.className = 'slider-label';
  lab.textContent = 'V threshold:';

  //slider setup
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '255';
  slider.value = current;
  slider.id = sliderId;
  slider.className = 'pretty-slider';

  const valueSpan = document.createElement('span');
  valueSpan.className = 'slider-value';
  valueSpan.textContent = current;

  const autoBtn = document.createElement('button');
  autoBtn.className = 'btn';
  autoBtn.textContent = 'Auto (Otsu)';

  //auto Otsu for V channel
  autoBtn.addEventListener('click', () => {
    const { v } = calculateHSVThresholds(hsv);
    current = v;
    slider.value = String(v);
    valueSpan.textContent = v;
    imgEl.src = p5ImageToDataURL(applyColorSpaceFilterColor(hsv, v, 2, dimFactor));
  });

  //slider move
  slider.addEventListener('input', (e) => {
    current = parseInt(e.currentTarget.value, 10);
    valueSpan.textContent = current;
    imgEl.src = p5ImageToDataURL(applyColorSpaceFilterColor(hsv, current, 2, dimFactor));
  });

  wrap.appendChild(lab);
  wrap.appendChild(slider);
  wrap.appendChild(valueSpan);
  wrap.appendChild(autoBtn);
  gridItem.appendChild(wrap);
}

//spacer tile invisible for layout alignment
function addSpacerTile(grid) {
  const gridItem = document.createElement('div');
  gridItem.className = 'grid-item';
  gridItem.style.visibility = 'hidden';
  gridItem.style.minHeight = '120px';
  grid.appendChild(gridItem);
}

//glitch effect tile with slider control
function addGlitchTile(grid, label, sliderId, initialValue = 50) {
  let currentIntensity = initialValue;

  //first render
  setGlitchIntensity(currentIntensity);
  let tileImg = applyGlitchEffect(scaledImg);
  const { gridItem, imgEl } = addImageTile(grid, tileImg, label);

  //slider row
  const wrap = document.createElement('div');
  wrap.className = 'slider-row';

  const lab = document.createElement('span');
  lab.className = 'slider-label';
  lab.textContent = 'Intensity:';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.value = currentIntensity;
  slider.id = sliderId;
  slider.className = 'pretty-slider';

  const valueSpan = document.createElement('span');
  valueSpan.className = 'slider-value';
  valueSpan.textContent = currentIntensity;

  //slider update glitch effect
  slider.addEventListener('input', (e) => {
    currentIntensity = parseInt(e.target.value, 10);
    valueSpan.textContent = currentIntensity;
    setGlitchIntensity(currentIntensity);
    imgEl.src = p5ImageToDataURL(applyGlitchEffect(scaledImg));
  });

  wrap.appendChild(lab);
  wrap.appendChild(slider);
  wrap.appendChild(valueSpan);
  gridItem.appendChild(wrap);
}

//halftone effect tile with two sliders: dot size and contrast
function addHalftoneTile(grid, label, dotSizeId, contrastId, initialDotSize = 2, initialContrast = 0.8) {
  let currentDotSize = initialDotSize;
  let currentContrast = initialContrast;

  //initial setup
  setHalftoneDotSize(currentDotSize);
  setHalftoneContrast(currentContrast);
  let tileImg = applyHalftoneEffect(scaledImg);
  const { gridItem, imgEl } = addImageTile(grid, tileImg, label);

  const controlsWrap = document.createElement('div');
  controlsWrap.className = 'halftone-controls';

  //dot size slider row
  const dotSizeWrap = document.createElement('div');
  dotSizeWrap.className = 'slider-row';

  const dotSizeLabel = document.createElement('span');
  dotSizeLabel.className = 'slider-label';
  dotSizeLabel.textContent = 'Dot Size:';

  const dotSizeSlider = document.createElement('input');
  dotSizeSlider.type = 'range';
  dotSizeSlider.min = '1';
  dotSizeSlider.max = '10';
  dotSizeSlider.value = String(currentDotSize);
  dotSizeSlider.id = dotSizeId;
  dotSizeSlider.className = 'pretty-slider';

  const dotSizeValue = document.createElement('span');
  dotSizeValue.className = 'slider-value';
  dotSizeValue.textContent = String(currentDotSize);

  //contrast slider row
  const contrastWrap = document.createElement('div');
  contrastWrap.className = 'slider-row';

  const contrastLabel = document.createElement('span');
  contrastLabel.className = 'slider-label';
  contrastLabel.textContent = 'Contrast:';

  const contrastSlider = document.createElement('input');
  contrastSlider.type = 'range';
  contrastSlider.min = '0.5';
  contrastSlider.max = '3.0';
  contrastSlider.step = '0.1';
  contrastSlider.value = String(currentContrast);
  contrastSlider.id = contrastId;
  contrastSlider.className = 'pretty-slider';

  const contrastValue = document.createElement('span');
  contrastValue.className = 'slider-value';
  contrastValue.textContent = currentContrast.toFixed(1);

  //rerender halftone
  function updateHalftoneImage() {
    setHalftoneDotSize(currentDotSize);
    setHalftoneContrast(currentContrast);
    imgEl.src = p5ImageToDataURL(applyHalftoneEffect(scaledImg));
  }

  //dot size slider move
  dotSizeSlider.addEventListener('input', (e) => {
    currentDotSize = parseInt(e.target.value, 10);
    dotSizeValue.textContent = String(currentDotSize);
    updateHalftoneImage();
  });

  //contrast slider move
  contrastSlider.addEventListener('input', (e) => {
    currentContrast = parseFloat(e.target.value);
    contrastValue.textContent = currentContrast.toFixed(1);
    updateHalftoneImage();
  });

  //assemble controls
  dotSizeWrap.appendChild(dotSizeLabel);
  dotSizeWrap.appendChild(dotSizeSlider);
  dotSizeWrap.appendChild(dotSizeValue);

  contrastWrap.appendChild(contrastLabel);
  contrastWrap.appendChild(contrastSlider);
  contrastWrap.appendChild(contrastValue);

  controlsWrap.appendChild(dotSizeWrap);
  controlsWrap.appendChild(contrastWrap);
  gridItem.appendChild(controlsWrap);
}

//kaleidoscope effect tile 
function addKaleidoscopeTile(grid, label, segmentsId, initialSegments = 6) {
  let currentSegments = initialSegments;

  //initial setup
  setKaleidoscopeSegments(currentSegments);
  let tileImg = applyKaleidoscopeEffect(scaledImg);
  const { gridItem, imgEl } = addImageTile(grid, tileImg, label);

  //row for segment slider
  const segmentsWrap = document.createElement('div');
  segmentsWrap.className = 'slider-row';

  const segmentsLabel = document.createElement('span');
  segmentsLabel.className = 'slider-label';
  segmentsLabel.textContent = 'Segments:';

  const segmentsSlider = document.createElement('input');
  segmentsSlider.type = 'range';
  segmentsSlider.min = '3';
  segmentsSlider.max = '12';
  segmentsSlider.step = '1';
  segmentsSlider.value = String(currentSegments);
  segmentsSlider.id = segmentsId;
  segmentsSlider.className = 'pretty-slider';

  const segmentsValue = document.createElement('span');
  segmentsValue.className = 'slider-value';
  segmentsValue.textContent = String(currentSegments);

  //slider move updates effect
  function updateKaleidoscopeImage() {
    setKaleidoscopeSegments(currentSegments);
    imgEl.src = p5ImageToDataURL(applyKaleidoscopeEffect(scaledImg));
  }

  segmentsSlider.addEventListener('input', (e) => {
    currentSegments = parseInt(e.target.value, 10);
    segmentsValue.textContent = String(currentSegments);
    updateKaleidoscopeImage();
  });

  //assemble controls
  segmentsWrap.appendChild(segmentsLabel);
  segmentsWrap.appendChild(segmentsSlider);
  segmentsWrap.appendChild(segmentsValue);
  gridItem.appendChild(segmentsWrap);
}

//face warp effect tile 
function addFaceWarpTile(grid, label) {
  let mode = 'fisheye';
  let strengthPct = 60;

  //initial setup
  setFaceWarpType(mode);
  setFaceWarpAutoCenterFromImage(scaledImg); 
  setFaceWarpStrength(strengthPct / 100);

  let tileImg = applyFaceWarpEffect(scaledImg);
  const { gridItem, imgEl } = addImageTile(grid, tileImg, label);

  const controlsWrap = document.createElement('div');

  //mode dropdown
  const modeRow = document.createElement('div');
  modeRow.className = 'slider-row';

  const modeLab = document.createElement('span');
  modeLab.className = 'slider-label';
  modeLab.textContent = 'Mode:';

  const modeSelect = document.createElement('select');
  ['fisheye','pincushion','swirl'].forEach(m=>{
    const opt=document.createElement('option');
    opt.value=m; 
    opt.textContent=m.charAt(0).toUpperCase()+m.slice(1);
    if(m===mode) opt.selected=true;
    modeSelect.appendChild(opt);
  });

  //on change update warp type
  modeSelect.addEventListener('change',(e)=>{
    mode=e.target.value;
    setFaceWarpType(mode);
    updateTile();
  });

  modeRow.appendChild(modeLab);
  modeRow.appendChild(modeSelect);
  controlsWrap.appendChild(modeRow);

  //intensity slider
  const sRow=document.createElement('div');
  sRow.className='slider-row';

  const sLab=document.createElement('span');
  sLab.className='slider-label';
  sLab.textContent='Intensity:';

  const sSlider=document.createElement('input');
  sSlider.type='range';
  sSlider.min='0'; sSlider.max='100';
  sSlider.value=String(strengthPct);
  sSlider.className='pretty-slider';

  const sVal=document.createElement('span');
  sVal.className='slider-value';
  sVal.textContent=String(strengthPct);

  //update intensity live
  sSlider.addEventListener('input',(e)=>{
    strengthPct=parseInt(e.target.value,10);
    sVal.textContent=String(strengthPct);
    setFaceWarpStrength(strengthPct/100);
    updateTile();
  });

  sRow.appendChild(sLab);
  sRow.appendChild(sSlider);
  sRow.appendChild(sVal);
  controlsWrap.appendChild(sRow);
  gridItem.appendChild(controlsWrap);

  //helper to re-render
  function updateTile(){
    try {
      setFaceWarpAutoCenterFromImage(scaledImg);
      const updated=applyFaceWarpEffect(scaledImg);
      if(updated) imgEl.src=p5ImageToDataURL(updated);
    } catch(e){ console.warn('FaceWarp update error:',e); }
  }
}

//building the grid in 3xN order
function updateImageGrid() {
  const grid = document.getElementById('image-grid');
  grid.innerHTML = '';

  //Row 1 
  addImageTile(grid, scaledImg, 'Webcam Image');
  addImageTile(grid, grayscaleImg, 'Grayscale +20%');
  addSpacerTile(grid);

  //Row 2
  addImageTile(grid, rgbChannels.red,   'Red Channel');
  addImageTile(grid, rgbChannels.green, 'Green Channel');
  addImageTile(grid, rgbChannels.blue,  'Blue Channel');

  //Row 3
  addThresholdTile(grid, 'red',   0, 'thresh-red');
  addThresholdTile(grid, 'green', 1, 'thresh-green');
  addThresholdTile(grid, 'blue',  2, 'thresh-blue');

  //Row 4 
  addImageTile(grid, scaledImg, 'Webcam Image (repeat)');
  addImageTile(grid, colorSpaceImgs.YCbCr, 'Colour space 1 (YCbCr)');
  addImageTile(grid, colorSpaceImgs.HSV,   'Colour space 2 (HSV)');

  //Row 5 
  const faceResult = makeFaceReplacementComposite(scaledImg, faceReplaceMode);
  addImageTile(grid, faceResult, faceReplacementLabel(faceReplaceMode));
  addYCbCrThresholdTile(grid, 'YCbCr Y filter (color-preserving)', 'thresh-y', 128, 0.3);
  addHSVThresholdTile(grid, 'HSV V filter (color-preserving)', 'thresh-v', 128, 0.3);

  //Row 6 (Extentions)
  if (scaledImg) {
    addGlitchTile(grid, 'Glitch Art Effect (RGB Split)', 'glitch-intensity', 50);
    addHalftoneTile(grid, 'Halftone Dots Effect', 'halftone-dot-size', 'halftone-contrast', 2, 0.8);
    addKaleidoscopeTile(grid, 'Kaleidoscope Effect (Auto-rotating)', 'kaleidoscope-segments', 6);

  //Row 7 (Extentions)
    addFaceWarpTile(grid, 'Face Magnification / Warp');
  }
}