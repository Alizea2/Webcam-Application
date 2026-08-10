//fisheye/pincushion/swirl
let faceWarpType = 'fisheye'; 
//center x 
let faceWarpCx = 0.5;          
//center y
let faceWarpCy = 0.5;          
//radius of wrap
let faceWarpRadius = 0.35;  
//strength of warp  
let faceWarpStrength = 0.6;   

//keeping value between lo and hi
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

//smooth lookup of pixel color at float coords
function bilinearSample(img, x, y) {
  const w = img.width, h = img.height;
  x = clamp(x, 0, w - 1); 
  y = clamp(y, 0, h - 1);

  //surrounding pixels
  const x1 = Math.floor(x), y1 = Math.floor(y);
  const x2 = Math.min(x1 + 1, w - 1), y2 = Math.min(y1 + 1, h - 1);
  const fx = x - x1, fy = y - y1; 

  //pixel indices
  const idx = (px, py) => (py * w + px) * 4;
  const i11 = idx(x1, y1), i21 = idx(x2, y1), i12 = idx(x1, y2), i22 = idx(x2, y2);

  //read colors
  const get = (i) => [img.pixels[i], img.pixels[i+1], img.pixels[i+2], img.pixels[i+3]||255];
  const p11 = get(i11), p21 = get(i21), p12 = get(i12), p22 = get(i22);

  //interpolate between them
  const out = [0,0,0,0];
  for (let k=0;k<4;k++){
    //top row
    const a = p11[k]*(1-fx)+p21[k]*fx; 
    //bottom row
    const b = p12[k]*(1-fx)+p22[k]*fx;
    //blending top and bottom 
    out[k] = a*(1-fy)+b*fy;            
  }
  return out;
}

//trying to auto center the warp on the detected face
function setFaceWarpAutoCenterFromImage(img) {
  if (!img || typeof getGroupedFaceRects !== 'function') return false;
  try {
    const rects = getGroupedFaceRects(img) || [];
    if (!rects.length) return false;

    //picking biggest face rectangle
    let best = rects[0], bestArea = best[2]*best[3];
    for (let i=1;i<rects.length;i++){
      const r = rects[i], a=r[2]*r[3];
      if (a > bestArea){ best=r; bestArea=a; }
    }

    //seting warp center to face center
    const [x,y,w,h] = best;
    faceWarpCx = clamp((x+w*0.5)/img.width,0,1);
    faceWarpCy = clamp((y+h*0.5)/img.height,0,1);

    //setting radius proportional to face size
    const faceRadiusPx = 0.5 * Math.max(w,h);
    const minDim = Math.min(img.width,img.height);
    faceWarpRadius = clamp(faceRadiusPx/minDim,0.08,0.45);
    return true;
  } catch(e){ 
    console.warn('autoCenter error',e); 
    return false; 
  }
}

//applies fisheye, pincushion and swirl warp
function applyFaceWarpEffect(srcImg) {
  if (!srcImg) return null;
  const w=srcImg.width, h=srcImg.height;
  const out=createImage(w,h);
  srcImg.loadPixels(); 
  out.loadPixels();

  //warp parameters in pixels
  const cx=faceWarpCx*w, cy=faceWarpCy*h;
  const R=clamp(faceWarpRadius,0.05,0.9)*Math.min(w,h);
  const R2=R*R;
  const swirlAngle=faceWarpStrength*Math.PI;
  const expF=1+faceWarpStrength*2.0, expP=1-faceWarpStrength*0.9;

  //looping over every pixel
  for(let i=0;i<w*h;i++){
    const x=i%w, y=(i/w)|0, dx=x-cx, dy=y-cy, r2=dx*dx+dy*dy;
    //default source = same pixel
    let sx=x, sy=y; 

    //only warp inside radius
    if(r2<=R2 && R>0){
      const r=Math.sqrt(r2), u=r/R;
      if(faceWarpType==='swirl'){
        //swirl = rotate angle based on distance
        const a=Math.atan2(dy,dx)+(1-u)*swirlAngle;
        sx=cx+Math.cos(a)*r; sy=cy+Math.sin(a)*r;
      } else {
        //fisheye and pincushion = radial distortion
        const exp=(faceWarpType==='fisheye')?expF:expP;
        const mappedU=Math.pow(u,clamp(exp,0.1,5)), srcR=mappedU*R;
        const invLen=r>1e-6?1/r:0, nx=dx*invLen, ny=dy*invLen;
        sx=cx+nx*srcR; sy=cy+ny*srcR;
      }
    }
    //sample source pixel with bilinear interpolation
    const [Rr,Gg,Bb,Aa]=bilinearSample(srcImg,sx,sy);
    const o=i*4; 
    out.pixels[o]=Rr|0; out.pixels[o+1]=Gg|0; out.pixels[o+2]=Bb|0; out.pixels[o+3]=Aa|0;
  }
  out.updatePixels(); 
  return out;
}

//setter for type
function setFaceWarpType(t){ 
  if(['fisheye','pincushion','swirl'].includes(t)) faceWarpType=t; 
}

//setter for strength
function setFaceWarpStrength(s){ 
  faceWarpStrength=clamp(s,0,1); 
}

//exportting for global use
window.applyFaceWarpEffect = applyFaceWarpEffect;
window.setFaceWarpType = setFaceWarpType;
window.setFaceWarpStrength = setFaceWarpStrength;
window.setFaceWarpAutoCenterFromImage = setFaceWarpAutoCenterFromImage;