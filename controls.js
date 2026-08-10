//setting up all ui controls and their event listeners
function setupControls() {
  //snapshot button 
  const snapshotBtn = document.getElementById('snapshot-btn');
  if (snapshotBtn) {
    snapshotBtn.addEventListener('click', takeSnapshot);
  }

  //face replacement 0-4 mode buttons 
  for (let i = 0; i <= 4; i++) {
    const btn = document.getElementById(`mode${i}`);
    if (btn) {
      btn.addEventListener('click', () => setFaceReplaceMode(i));
    }
  }
}

//setting current face replacement mode
function setFaceReplaceMode(mode) {
  if (mode < 0 || mode > 4) return;
  
  //updatinhg global mode variable
  faceReplaceMode = mode;
  
  //updating ui to highlight the active button
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`mode${mode}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  //reprocessing image if one is already loaded
  if (img && scaledImg) {
    processImage();
  }
  
  //showing confirmation text
  const conf = document.getElementById('confirmation');
  if (conf) {
    conf.textContent = `Face mode changed to: ${faceReplacementLabel(mode)}`;
  }
}
