/* Favicon generator. Everything runs in this browser tab: nothing is uploaded. Includes a tiny store-only ZIP writer and an ICO writer (PNG payloads). */
(function(){
  var $=function(i){return document.getElementById(i)};
  var form=$('fv-f'); if(!form) return;
  var FONTS={serif:'700 {s}px Georgia,"Times New Roman",serif',sans:'800 {s}px "Helvetica Neue",Arial,sans-serif',mono:'700 {s}px Menlo,Consolas,"Courier New",monospace',round:'700 {s}px "Trebuchet MS","Segoe UI",Verdana,sans-serif',impact:'400 {s}px Impact,"Arial Narrow",sans-serif'};
  var FAM={serif:'Georgia,Times New Roman,serif',sans:'Helvetica Neue,Arial,sans-serif',mono:'Menlo,Consolas,Courier New,monospace',round:'Trebuchet MS,Segoe UI,Verdana,sans-serif',impact:'Impact,Arial Narrow,sans-serif'};
  var WT={serif:700,sans:800,mono:700,round:700,impact:400};
  var img=null,imgUrl=null,raf=0;

  function st(){
    return {mode:form.elements.mode.value,text:Array.from($('fv-t').value.trim()).slice(0,2).join(''),font:$('fv-font').value,bg:$('fv-bg').value,fg:$('fv-fg').value,
      clear:$('fv-clear').checked,round:+$('fv-round').value,pad:+$('fv-pad').value,name:$('fv-name').value.trim()};
  }
  function ready(s){return s.mode==='text'?s.text.length>0:!!(img&&(img.naturalWidth||img.width))}

  /* fit text into a box; returns font size + baseline offset for visual centering, in a 'size' px square */
  var mc=document.createElement('canvas').getContext('2d');
  function fit(s,box){
    var f=FONTS[s.font]; mc.font=f.replace('{s}',100);
    var m=mc.measureText(s.text), w=m.width||1, h=(m.actualBoundingBoxAscent+m.actualBoundingBoxDescent)||72;
    var fs=Math.min(box*100/w,box*100/h);
    return {fs:fs,asc:m.actualBoundingBoxAscent*fs/100,desc:m.actualBoundingBoxDescent*fs/100};
  }
  /* kind: 'any' (rounded per settings) | 'full' (full-bleed square: apple, maskable) */
  function draw(c,size,s,kind){
    var x=c.getContext('2d'); c.width=c.height=size; x.clearRect(0,0,size,size);
    var full=kind==='full'||kind==='mask';
    var r=full?0:size*s.round/100;
    if(!s.clear||full){x.fillStyle=s.bg; x.beginPath(); if(x.roundRect&&r>0)x.roundRect(0,0,size,size,r); else x.rect(0,0,size,size); x.fill();}
    var inner=kind==='mask'?0.6:(1-2*s.pad/100); /* maskable: keep content inside the 80% safe circle */
    var box=size*inner;
    if(s.mode==='text'){
      var t=fit(s,box); x.font=FONTS[s.font].replace('{s}',t.fs); x.fillStyle=s.fg; x.textAlign='center'; x.textBaseline='alphabetic';
      x.fillText(s.text,size/2,size/2+(t.asc-t.desc)/2);
    }else if(img){
      var iw=img.naturalWidth||img.width||1, ih=img.naturalHeight||img.height||1, k=Math.min(box/iw,box/ih), w=iw*k, h=ih*k;
      x.imageSmoothingQuality='high'; x.drawImage(img,(size-w)/2,(size-h)/2,w,h);
    }
  }
  /* render big then downscale for crisp small sizes */
  function render(size,s,kind){
    var big=document.createElement('canvas'); draw(big,Math.max(size,512),s,kind);
    if(size===big.width) return big;
    var c=document.createElement('canvas'); c.width=c.height=size; var x=c.getContext('2d'); x.imageSmoothingQuality='high'; x.drawImage(big,0,0,size,size); return c;
  }

  function svg(s){
    var rx=+(64*s.round/100).toFixed(2), t=fit(s,64*(1-2*s.pad/100)), y=(32+(t.asc-t.desc)/2).toFixed(2);
    var e=s.text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var q=FAM[s.font].replace(/"/g,'');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'+(s.clear?'':'<rect width="64" height="64" rx="'+rx+'" fill="'+s.bg+'"/>')+
      '<text x="32" y="'+y+'" text-anchor="middle" font-family="'+q+'" font-weight="'+WT[s.font]+'" font-size="'+t.fs.toFixed(2)+'" fill="'+s.fg+'">'+e+'</text></svg>';
  }

  /* ---------- live preview ---------- */
  function paint(){
    raf=0; var s=st(), ok=ready(s);
    $('fv-empty').hidden=ok; $('fv-dl').disabled=!ok; $('fv-snip-b').disabled=!ok;
    $('fv-svg-note').hidden=s.mode!=='text';
    $('fv-t-wrap').hidden=s.mode!=='text'; $('fv-i-wrap').hidden=s.mode!=='image'; $('fv-font-wrap').hidden=s.mode!=='text';
    var nm=s.name||'Your site';
    document.querySelectorAll('[data-fv-name]').forEach(function(n){n.textContent=nm});
    ['fv-tab-l','fv-tab-d'].forEach(function(id){var c=$(id); draw(c,32,s,'any')});
    [16,32,48].forEach(function(n){var c=$('fv-s'+n); var r=render(n,s,'any'); c.width=c.height=n; c.getContext('2d').drawImage(r,0,0)});
    draw($('fv-apple'),180,s,'full');
    draw($('fv-mask'),192,s,'mask');
    $('fv-snip').textContent=snippet(s);
  }
  /* WebKit may not match :focus-visible on these visually hidden radios: mirror keyboard focus with a class */
  form.addEventListener('keyup',function(e){if(e.key==='Tab'||e.key.indexOf('Arrow')===0){var t=e.target;form.querySelectorAll('.fv__seg input.is-kb').forEach(function(i){i.classList.remove('is-kb')});if(t&&t.matches&&t.matches('.fv__seg input'))t.classList.add('is-kb')}});
  form.addEventListener('focusout',function(e){if(e.target.classList)e.target.classList.remove('is-kb')});
  function queue(){if(!raf) raf=requestAnimationFrame(paint)}
  ['input','change','click'].forEach(function(ev){form.addEventListener(ev,queue)});
  form.addEventListener('submit',function(e){e.preventDefault()});

  $('fv-file').addEventListener('change',function(){
    var f=this.files&&this.files[0]; if(!f) return;
    if(f.size>8*1024*1024){$('fv-msg').textContent='That file is over 8 MB. Please use a smaller image.'; return}
    if(imgUrl) URL.revokeObjectURL(imgUrl);
    imgUrl=URL.createObjectURL(f); var im=new Image();
    im.onload=function(){if(!(im.naturalWidth||im.width)){img=null; $('fv-msg').textContent='That image has no readable size (an SVG needs a width and height or a viewBox). Try a PNG, JPG or another SVG.'; queue(); return}
      img=im; form.elements.mode.value='image'; $('fv-msg').textContent=''; queue()};
    im.onerror=function(){img=null; $('fv-msg').textContent='We could not read that file. Try a PNG, JPG, SVG or WebP.'; queue()};
    im.src=imgUrl;
  });

  /* ---------- files ---------- */
  function snippet(s){
    var L=[]; if(s.mode==='text') L.push('<link rel="icon" href="/favicon.svg" type="image/svg+xml">');
    L.push('<link rel="icon" href="/favicon.ico" sizes="48x48">');
    L.push('<link rel="apple-touch-icon" href="/apple-touch-icon.png">');
    L.push('<link rel="manifest" href="/site.webmanifest">');
    L.push('<meta name="theme-color" content="'+s.bg+'">');
    return L.join('\n');
  }
  /* short_name: at most 12 characters, cut on a word boundary when possible and never through an emoji/surrogate pair */
  function shortName(n){
    var c=Array.from(String(n).replace(/[\u0000-\u001f]/g,' ').replace(/\s+/g,' ').trim());
    if(c.length<=12)return c.join('');
    var cut=c.slice(0,12),sp=cut.lastIndexOf(' ');
    if(c[12]!==' '&&sp>=3)cut=cut.slice(0,sp);
    return cut.join('').trim();
  }
  function manifest(s){
    var n=s.name||(s.mode==='text'?s.text:'My site');
    return JSON.stringify({name:n,short_name:shortName(n),icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/icon-512.png',sizes:'512x512',type:'image/png'},{src:'/maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}],theme_color:s.bg,background_color:s.bg,display:'standalone'},null,2)+'\n';
  }
  function png(c){return new Promise(function(res,rej){c.toBlob(function(b){b?b.arrayBuffer().then(function(a){res(new Uint8Array(a))}):rej(new Error('png'))},'image/png')})}
  function u16(a,v){a.push(v&255,v>>8&255)} function u32(a,v){a.push(v&255,v>>8&255,v>>16&255,v>>>24&255)}
  function ico(list){ /* list: [{n,bytes}] */
    var h=[]; u16(h,0);u16(h,1);u16(h,list.length); var off=6+16*list.length, body=[];
    list.forEach(function(p){h.push(p.n>=256?0:p.n,p.n>=256?0:p.n,0,0); u16(h,1);u16(h,32);u32(h,p.bytes.length);u32(h,off); off+=p.bytes.length});
    var out=new Uint8Array(off); out.set(h,0); var o=6+16*list.length; list.forEach(function(p){out.set(p.bytes,o); o+=p.bytes.length}); return out;
  }
  var CT=(function(){var t=[],n,k,c;for(n=0;n<256;n++){c=n;for(k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
  function crc(b){var c=0xFFFFFFFF;for(var i=0;i<b.length;i++)c=CT[(c^b[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
  function zip(files){ /* store-only ZIP, UTF-8 names */
    var enc=new TextEncoder(), d=new Date(), dt=((d.getFullYear()-1980)<<9|(d.getMonth()+1)<<5|d.getDate())&0xFFFF, tm=(d.getHours()<<11|d.getMinutes()<<5|d.getSeconds()>>1)&0xFFFF;
    var parts=[],cd=[],off=0;
    files.forEach(function(f){
      var nm=enc.encode(f.name), data=typeof f.data==='string'?enc.encode(f.data):f.data, c=crc(data), h=[];
      u32(h,0x04034b50);u16(h,20);u16(h,0x0800);u16(h,0);u16(h,tm);u16(h,dt);u32(h,c);u32(h,data.length);u32(h,data.length);u16(h,nm.length);u16(h,0);
      parts.push(new Uint8Array(h),nm,data);
      var e=[];u32(e,0x02014b50);u16(e,20);u16(e,20);u16(e,0x0800);u16(e,0);u16(e,tm);u16(e,dt);u32(e,c);u32(e,data.length);u32(e,data.length);u16(e,nm.length);u16(e,0);u16(e,0);u16(e,0);u16(e,0);u32(e,0);u32(e,off);
      cd.push(new Uint8Array(e),nm); off+=h.length+nm.length+data.length;
    });
    var cs=0; cd.forEach(function(p){cs+=p.length});
    var z=[];u32(z,0x06054b50);u16(z,0);u16(z,0);u16(z,files.length);u16(z,files.length);u32(z,cs);u32(z,off);u16(z,0);
    return new Blob(parts.concat(cd,[new Uint8Array(z)]),{type:'application/zip'});
  }
  function save(blob,name){var a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)}

  $('fv-dl').addEventListener('click',function(){
    var s=st(); if(!ready(s)) return; var b=this; b.disabled=true; $('fv-msg').textContent='Building your files...';
    var jobs=[16,32,48].map(function(n){return png(render(n,s,'any')).then(function(by){return {n:n,bytes:by}})});
    var more=[png(render(180,s,'full')),png(render(192,s,'any')),png(render(512,s,'any')),png(render(512,s,'mask'))];
    Promise.all([Promise.all(jobs),Promise.all(more)]).then(function(r){
      var files=[{name:'favicon.ico',data:ico(r[0])}];
      if(s.mode==='text') files.push({name:'favicon.svg',data:svg(s)});
      files.push({name:'apple-touch-icon.png',data:r[1][0]},{name:'icon-192.png',data:r[1][1]},{name:'icon-512.png',data:r[1][2]},{name:'maskable-512.png',data:r[1][3]},
        {name:'site.webmanifest',data:manifest(s)},{name:'html-snippet.txt',data:snippet(s)+'\n\nUpload every file to the root folder of your website (the same place as your home page).\n'});
      save(zip(files),'favicons.zip'); $('fv-msg').textContent='Done. Your favicons.zip is downloading. Nothing left this device.';
    }).catch(function(){$('fv-msg').textContent='Something went wrong building the files. Please try again.'}).then(function(){b.disabled=!ready(st())});
  });
  $('fv-snip-b').addEventListener('click',function(){
    var t=$('fv-snip').textContent, m=$('fv-msg');
    var ok=function(){m.textContent='Copied. Paste it inside the <head> of every page.'};
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok,function(){m.textContent='Could not copy. Select the code and copy it by hand.'});
    else{var r=document.createRange();r.selectNodeContents($('fv-snip'));var g=getSelection();g.removeAllRanges();g.addRange(r);try{document.execCommand('copy');ok()}catch(e){m.textContent='Select the code and copy it by hand.'}}
  });
  paint();
})();
