/* 
 * GlassSurface WebGL2 optical core adapted from React Bits GlassSurface
 * https://github.com/DavidHDev/react-bits
 * Copyright (c) 2026 David Haz
 * License: MIT + Commons Clause v1.0 (included in assets/REACT_BITS_LICENSE.txt)
 *
 * Standalone Android WebView port. No React runtime, network, or third-party CDN.
 * Original: WebGL backdrop sampling, displacement-map-driven RGB refraction.
 * Native Android retains all text, click targets, task storage and FMV physics.
 */
(() => {
  'use strict';
  const background = document.getElementById('backdrop');
  const glass = document.getElementById('glass');
  const ctx = background.getContext('2d', { alpha: false });
  const gl = glass.getContext('webgl2', {
    alpha: true, premultipliedAlpha: false, antialias: false,
    depth: false, stencil: false, preserveDrawingBuffer: false
  });
  const fallback = gl ? null : glass.getContext('2d');
  let lenses = [];
  let paused = false;
  let stamp = performance.now();
  let animation = 0;
  let cssW = 0, cssH = 0, pixelRatio = 1;
  let oldFrame = 0;
  const mapCache = new Map();
  const clip = (v, a, b) => Math.max(a, Math.min(b, v));
  const blend = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const paintRGBA = (rgb, alpha) =>
    'rgba(' + rgb.map(v => Math.round(v)).join(',') + ',' + alpha + ')';
  const color = (hex) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];

  // One coherent 96s color cycle, not separate bright static blobs.
  const WARM = [0x65B4A7, 0xC5B67D, 0x83B39C, 0xBFA87A, 0x51B3AA, 0xD0A377];
  const COOL = [0x628BCB, 0x9274CD, 0xB36D9C, 0x607CBD, 0x55B1B9, 0xB785B7];
  const layers = [
    { x: .13, y: .26, rx: .73, ry: .43, a: .34, p: .26 },
    { x: .77, y: .23, rx: .65, ry: .37, a: .32, p: .32 },
    { x: .78, y: .81, rx: .72, ry: .40, a: .32, p: .38 },
    { x: .35, y: .69, rx: .62, ry: .38, a: .30, p: .27 },
    { x: .06, y: .93, rx: .63, ry: .38, a: .27, p: .34 },
    { x: .90, y: .57, rx: .56, ry: .34, a: .29, p: .30 }
  ];
  function resize() {
    const W = Math.max(1, window.innerWidth);
    const H = Math.max(1, window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.45);
    if (W === cssW && H === cssH && dpr === pixelRatio) return;
    cssW = W; cssH = H; pixelRatio = dpr;
    const ww = Math.max(1, Math.round(W * dpr)), hh = Math.max(1, Math.round(H * dpr));
    background.width = ww; background.height = hh;
    glass.width = ww; glass.height = hh;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (fallback) fallback.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const [id, entry] of mapCache) {
      if (gl) gl.deleteTexture(entry.texture);
      mapCache.delete(id);
    }
  }
  function pool(x, y, rx, ry, rotation, rgb, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(rx, ry);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, paintRGBA(rgb, .94 * alpha));
    g.addColorStop(.31, paintRGBA(rgb, .61 * alpha));
    g.addColorStop(.65, paintRGBA(rgb, .21 * alpha));
    g.addColorStop(1, paintRGBA(rgb, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function backdrop(time) {
    let mix = .5 - .5 * Math.cos(time * Math.PI * 2 / 96);
    mix = mix * mix * (3 - 2 * mix);
    const top = blend([26, 43, 40], [23, 29, 54], mix);
    const mid = blend([29, 49, 45], [30, 32, 55], mix);
    const bot = blend([38, 43, 33], [33, 27, 49], mix);
    const base = ctx.createLinearGradient(0, 0, cssW, cssH);
    base.addColorStop(0, paintRGBA(top, 1));
    base.addColorStop(.53, paintRGBA(mid, 1));
    base.addColorStop(1, paintRGBA(bot, 1));
    ctx.fillStyle = base; ctx.fillRect(0, 0, cssW, cssH);
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < layers.length; i++) {
      const l = layers[i];
      const t = time;
      const x = cssW * (l.x + .145 * Math.sin(t * (.13 + .017 * i) + i * 1.67));
      const y = cssH * (l.y + .095 * Math.cos(t * (.11 + .018 * i) + i * 1.32));
      const rx = cssW * l.rx * (1 + .07 * Math.sin(t * .13 + i));
      const ry = cssH * l.ry * (1 + .09 * Math.cos(t * .10 + i));
      pool(x, y, rx, ry, .15 * Math.sin(t * .09 + i),
        blend(color(WARM[i]), color(COOL[i]), mix), l.a);
    }
    // Low contrast localized optical folds. No gridded film noise or wave lines.
    const folds = [
      { x: .57, y: .32, rx: .55, ry: .24, strength: .13 },
      { x: .23, y: .77, rx: .54, ry: .21, strength: .11 }
    ];
    folds.forEach((f, i) => pool(
      cssW * (f.x + .1 * Math.sin(time * (.11 + i * .03))),
      cssH * (f.y + .1 * Math.cos(time * (.12 + i * .02))),
      cssW * f.rx, cssH * f.ry,
      .31 * Math.sin(time * .085 + i), blend([191, 222, 186], [192, 180, 246], mix), f.strength
    ));
    ctx.globalCompositeOperation = 'source-over';
  }

  // The original React Bits GLASS_VERTEX and RGB bend() optical approach.
  // The fragment was extended to use a shared full-screen GL viewport and
  // rounded-rectangle SDF masking for dynamically placed Android View panes.
  const GLASS_VERTEX = [
    '#version 300 es', 'in vec2 aPosition;',
    'void main(){gl_Position=vec4(aPosition,0.0,1.0);}'
  ].join('\n');
  const GLASS_FRAGMENT = [
    '#version 300 es',
    'precision highp float;',
    'uniform sampler2D uBackdrop;',
    'uniform sampler2D uMap;',
    'uniform vec2 uCanvas;',
    'uniform vec2 uOrigin;',
    'uniform vec2 uStep;',
    'uniform vec3 uScale;',
    'uniform ivec2 uChannel;',
    'uniform vec4 uRect;',            // left, top, width, height in CSS pixels
    'uniform float uRatio;',
    'uniform float uRadius;',
    'uniform float uLod;',
    'uniform float uSaturation;',
    'uniform float uTint;',
    'uniform float uRim;',
    'out vec4 outColor;',
    'float sdRoundRect(vec2 p){',
    '  vec2 halfSize=uRect.zw*0.5;',
    '  vec2 q=abs(p-halfSize)-(halfSize-vec2(uRadius));',
    '  return length(max(q,0.0))+min(max(q.x,q.y),0.0)-uRadius;',
    '}',
    'vec4 bend(vec2 p){',
    '  vec4 map=texture(uMap,clamp(p/uRect.zw,0.0,1.0));',
    '  vec2 shift=map.rg-0.5;',
    '  vec2 base=uOrigin+p*uStep;',
    '  vec4 red=textureLod(uBackdrop,base+shift*uScale.r*uStep,uLod);',
    '  vec4 green=textureLod(uBackdrop,base+shift*uScale.g*uStep,uLod);',
    '  vec4 blue=textureLod(uBackdrop,base+shift*uScale.b*uStep,uLod);',
    '  return vec4(red.r,green.g,blue.b,(red.a+green.a+blue.a)/3.0);',
    '}',
    'void main(){',
    '  vec2 screen=vec2(gl_FragCoord.x,uCanvas.y-gl_FragCoord.y)/uRatio;',
    '  vec2 p=screen-uRect.xy;',
    '  float sd=sdRoundRect(p);',
    '  if(sd>0.0)discard;',
    '  vec4 sampleColor=bend(p);',
    '  vec3 rgb=sampleColor.rgb;',
    '  float s=uSaturation;',
    '  mat3 tone=mat3(',
    '    0.213+0.787*s,0.213-0.213*s,0.213-0.213*s,',
    '    0.715-0.715*s,0.715+0.285*s,0.715-0.715*s,',
    '    0.072-0.072*s,0.072-0.072*s,0.072+0.928*s);',
    '  rgb=clamp(tone*rgb,0.0,1.0);',
    '  float rim=pow(1.0-clamp(-sd/9.5,0.0,1.0),3.5);',
    '  float directional=0.6+0.4*clamp(1.0-p.y/max(uRect.w,1.0),0.0,1.0);',
    '  rgb=mix(rgb,vec3(0.91,0.97,1.0),rim*uRim*directional);',
    '  rgb=mix(rgb,vec3(0.72,0.80,0.82),uTint);',
    '  outColor=vec4(rgb,1.0);',
    '}'
  ].join('\n');

  function makeShader(kind, src) {
    const shader = gl.createShader(kind);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Glass shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  let prog=null, uniforms={}, backdropTexture=null, activeVao=null, activeBuffer=null;
  function initGL() {
    if (!gl) return;
    const a=makeShader(gl.VERTEX_SHADER,GLASS_VERTEX);
    const b=makeShader(gl.FRAGMENT_SHADER,GLASS_FRAGMENT);
    if(!a||!b) return;
    prog=gl.createProgram();
    gl.attachShader(prog,a);gl.attachShader(prog,b);
    gl.bindAttribLocation(prog,0,'aPosition');
    gl.linkProgram(prog);
    gl.deleteShader(a);gl.deleteShader(b);
    if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){
      console.error('Glass link:',gl.getProgramInfoLog(prog));prog=null;return;
    }
    for(const name of [
      'uBackdrop','uMap','uCanvas','uOrigin','uStep','uScale','uChannel',
      'uRect','uRatio','uRadius','uLod','uSaturation','uTint','uRim'
    ]) uniforms[name]=gl.getUniformLocation(prog,name);
    activeVao=gl.createVertexArray();activeBuffer=gl.createBuffer();
    gl.bindVertexArray(activeVao);gl.bindBuffer(gl.ARRAY_BUFFER,activeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    backdropTexture=makeTexture();
    gl.disable(gl.BLEND);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
  }
  function makeTexture() {
    const t=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,t);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    return t;
  }
  function sdf(x,y,w,h,r) {
    const dx=Math.abs(x-w*.5)-(w*.5-r);
    const dy=Math.abs(y-h*.5)-(h*.5-r);
    return Math.hypot(Math.max(dx,0),Math.max(dy,0))+Math.min(Math.max(dx,dy),0)-r;
  }
  function displacementMap(l) {
    // A precalculated smooth shape-normal map is the rounded-rect specialization
    // of React Bits traceShape()/bendShape(). We create it only on size changes.
    const W=Math.max(16,Math.min(512,Math.round(l.w*.75)));
    const H=Math.max(16,Math.min(512,Math.round(l.h*.75)));
    const r=Math.min(l.r,Math.min(l.w,l.h)*.5);
    const data=new Uint8Array(W*H*4);
    const edge=(l.finish==='hero'?17:l.finish==='clear'?13:l.finish==='nav'?10:9);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const px=(x+.5)/W*l.w,py=(y+.5)/H*l.h;
      const d=sdf(px,py,l.w,l.h,r);
      const s=clip(1+Math.min(d,0)/edge,0,1);
      // Smooth ramp: 0 at inner surface, largest at 3D lens edge.
      const strength=s*s*(3-2*s);
      const nx=sdf(px+.7,py,l.w,l.h,r)-sdf(px-.7,py,l.w,l.h,r);
      const ny=sdf(px,py+.7,l.w,l.h,r)-sdf(px,py-.7,l.w,l.h,r);
      const length=Math.max(.0001,Math.hypot(nx,ny));
      const k=(l.finish==='frosted'||l.finish==='nav')?.23:.42;
      const idx=(y*W+x)*4;
      data[idx]=Math.round(255*clip(.5+nx/length*strength*k,0,1));
      data[idx+1]=Math.round(255*clip(.5+ny/length*strength*k,0,1));
      data[idx+2]=128;
      data[idx+3]=255;
    }
    const tex=makeTexture();
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,data);
    return {texture:tex,w:l.w,h:l.h,r:l.r,finish:l.finish};
  }

  function drawLenses() {
    if(!gl||!prog) {
      if(fallback) {
        fallback.clearRect(0,0,cssW,cssH);
        for(const l of lenses){
          fallback.fillStyle='rgba(225,242,239,0.055)';
          fallback.strokeStyle='rgba(239,249,251,0.23)';
          fallback.lineWidth=.6;
          fallback.beginPath();fallback.roundRect(l.x,l.y,l.w,l.h,l.r);
          fallback.fill();fallback.stroke();
        }
      }
      return;
    }
    gl.viewport(0,0,glass.width,glass.height);
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    if(!lenses.length)return;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,backdropTexture);
    // One backdrop upload for all glass surfaces; never one WebGL context per card.
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,background);
    gl.useProgram(prog);gl.bindVertexArray(activeVao);
    gl.uniform1i(uniforms.uBackdrop,0);
    gl.uniform2f(uniforms.uCanvas,glass.width,glass.height);
    gl.uniform1f(uniforms.uRatio,pixelRatio);
    gl.uniform2f(uniforms.uStep,1/cssW,1/cssH);
    gl.uniform2i(uniforms.uChannel,0,1);
    gl.enable(gl.SCISSOR_TEST);
    for(const l of lenses) {
      if(l.w<2||l.h<2||l.cw<=0||l.ch<=0)continue;
      const x=Math.round(l.x*pixelRatio);
      const y=Math.round((cssH-l.y-l.h)*pixelRatio);
      const w=Math.max(1,Math.round(l.w*pixelRatio));
      const h=Math.max(1,Math.round(l.h*pixelRatio));
      let cache=mapCache.get(l.id);
      if(!cache||Math.abs(cache.w-l.w)>1||Math.abs(cache.h-l.h)>1||
          Math.abs(cache.r-l.r)>.01||cache.finish!==l.finish){
        if(cache)gl.deleteTexture(cache.texture);
        cache=displacementMap(l);mapCache.set(l.id,cache);
      }
      gl.viewport(x,y,w,h);
      const clipX=Math.max(0,Math.round(l.cx*pixelRatio));
      const clipY=Math.max(0,Math.round((cssH-l.cy-l.ch)*pixelRatio));
      const clipW=Math.min(glass.width-clipX,Math.round(l.cw*pixelRatio));
      const clipH=Math.min(glass.height-clipY,Math.round(l.ch*pixelRatio));
      if(clipW<=0||clipH<=0)continue;
      gl.scissor(clipX,clipY,clipW,clipH);
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,cache.texture);
      gl.uniform1i(uniforms.uMap,1);
      gl.uniform4f(uniforms.uRect,l.x,l.y,l.w,l.h);
      gl.uniform2f(uniforms.uOrigin,l.x/cssW,l.y/cssH);
      gl.uniform1f(uniforms.uRadius,Math.min(l.r,Math.min(l.w,l.h)*.5));
      // Center remains sharp; RGB shift is confined to curved edges.
      const hero=l.finish==='hero',clear=l.finish==='clear',nav=l.finish==='nav';
      const intensity=hero?68:clear?42:nav?19:14;
      const spread=hero?9:clear?4.2:nav?0.5:0;
      gl.uniform3f(uniforms.uScale,-intensity-spread,-intensity,-intensity+spread);
      gl.uniform1f(uniforms.uLod,0);
      gl.uniform1f(uniforms.uSaturation,hero?1.08:clear?1.07:1.02);
      gl.uniform1f(uniforms.uTint,hero?.014:clear?.020:nav?.052:.065);
      gl.uniform1f(uniforms.uRim,hero?.29:clear?.21:nav?.13:.14);
      gl.drawArrays(gl.TRIANGLES,0,3);
    }
    gl.disable(gl.SCISSOR_TEST);
    for(const [id,item] of mapCache) {
      if(!lenses.some(l=>l.id===id)) {
        gl.deleteTexture(item.texture);mapCache.delete(id);
      }
    }
  }

  function frame(now) {
    animation=0;
    if(paused||document.hidden)return;
    resize();
    if(now-oldFrame>=33){
      oldFrame=now;
      const t=(now-stamp)/1000;
      backdrop(t);
      drawLenses();
    }
    animation=requestAnimationFrame(frame);
  }
  window.GlassScene={
    setLenses(next){
      if(Array.isArray(next))lenses=next;
    },
    pause(){paused=true;cancelAnimationFrame(animation);animation=0;},
    resume(){if(!paused)return;paused=false;if(!animation)animation=requestAnimationFrame(frame);}
  };
  window.addEventListener('resize',resize);
  window.addEventListener('webglcontextlost',e=>{e.preventDefault();paused=true;},false);
  window.addEventListener('visibilitychange',()=>{if(!document.hidden&&!paused&&!animation)animation=requestAnimationFrame(frame);});
  resize();initGL();animation=requestAnimationFrame(frame);
})();
