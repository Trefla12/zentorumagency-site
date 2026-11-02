/* Zentorum Agency · /tools/: brand-name checker + brand color quiz. Tips only. */
(function(){
  var $=function(s){return document.querySelector(s)};
  /* ---- name checker ---- */
  var inp=$('#nm'),out=$('#nm-out');
  var SP={'ø':'o','æ':'a','œ':'o','ß':'s','đ':'d','ð':'d','þ':'t','ł':'l','ı':'i'};
  /* 1:1 fold so indexes match the original letters (shown quotes keep the original text) */
  function fold1(str){return Array.from(str).map(function(c){var l=c.toLowerCase();if(SP[l])return SP[l];var b=c.normalize('NFD').replace(/[\u0300-\u036f]/g,'');return b.length?Array.from(b)[0]:c}).join('')}
  function syl(w){w=fold1(w).toLowerCase().replace(/[^a-z]/g,'');if(!w)return 0;var m=w.replace(/e$/,'').match(/[aeiouy]+/g);return Math.max(1,m?m.length:1)}
  function check(){
    var raw=inp.value.trim(),tips=[];
    if(!raw){out.innerHTML='';return}
    var name=raw.replace(/\s+/g,' '),orig=Array.from(name).filter(function(c){return /\p{L}/u.test(c)}).join(''),letters=Array.from(fold1(orig)).join('');
    function q(m){return m?orig.substr(m.index,m[0].length):''}
    var words=name.split(' '),sy=words.reduce(function(a,w){return a+syl(w)},0);
    function add(t,g){tips.push('<li'+(g?' class="good"':'')+'>'+t+'</li>')}
    if(name.length<=10&&sy<=3)add('Short names are easier to remember. Yours is '+name.length+' characters.',1);
    else if(name.length>16||sy>4)add('Long names are harder to remember and fit badly on signs and profiles. Try trimming it to one or two short words.');
    else add('Good length. Shorter is still easier to remember.',1);
    if(/\d/.test(name))add('Numbers in a name are easy to forget or mix up. People may not know whether to type "4" or "for".');
    if(/[-_.]/.test(name))add('Hyphens and symbols are hard to say out loud and easy to leave out when people search.');
    if(/(.)\1/i.test(letters)&&/([a-z])\1/i.test(letters))add('Double letters ("'+q(letters.match(/([a-z])\1/i))+'") are a common spelling slip. Hard to spell? People may misspell it in search.');
    var hard=letters.match(/[bcdfghjklmnpqrstvwxz]{4,}/i)||letters.match(/(ph|gh|ck|x|q|z){2}/i)||letters.match(/(kn|wr|ps|mn|pn)/i);
    if(hard)add('"'+q(hard)+'" is a tricky letter combination. Hard to spell? People may misspell it in search.');
    if(/[aeiou]{3,}/i.test(letters))add('Three vowels in a row can be hard to read and say.');
    if(words.length>3)add('Four or more words is a sentence, not a name. Two words is the sweet spot.');
    if(letters.length>=2&&!/[aeiouy]/i.test(letters))add('No vowels makes a name hard to say. Say it out loud to a friend and see if they can spell it back.');
    if(tips.length===1&&/good/.test(tips[0]))add('Say it out loud to a friend, then ask them to type it. If they get it right, you are in good shape.',1);
    out.innerHTML=tips.join('');
  }
  if(inp){inp.addEventListener('input',check);$('#nm-go').addEventListener('click',check);$('#nm-f').addEventListener('submit',function(e){e.preventDefault();check()})}
  /* ---- color quiz ---- */
  var qf=$('#cq');if(!qf)return;
  function hsl(h,s,l){s/=100;l/=100;var a=s*Math.min(l,1-l),f=function(n){var k=(n+h/30)%12,c=l-a*Math.max(-1,Math.min(k-3,9-k,1));return Math.round(255*c).toString(16).padStart(2,'0')};return '#'+f(0)+f(8)+f(4)}
  function lum(hex){var c=[1,3,5].map(function(i){var v=parseInt(hex.substr(i,2),16)/255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]}
  function ink(hex){var L=lum(hex);return (L+.05)/.05>=1.05/(L+.05)?'#000000':'#ffffff'}
  function make(a){
    var H={trust:214,energy:12,calm:164,luxury:276}[a.q1],S={bold:82,quiet:38}[a.q3],L={families:0,young:6,pros:-6,all:0}[a.q2];
    var dark=a.q5==='dark',modern=a.q4==='modern';
    var primary=hsl(H,S,48+L),second=hsl(modern?(H+30)%360:(H+350)%360,Math.max(S-18,25),modern?38:58);
    var acc=a.q1==='luxury'?hsl(42,62,66):hsl((H+(modern?180:40))%360,Math.min(S+8,90),a.q3==='bold'?58:64);
    var bg=dark?hsl(H,modern?26:18,9):hsl(modern?H:36,modern?24:42,modern?97:94);
    var tx=dark?hsl(H,22,93):hsl(H,28,12);
    return [['Background',bg],['Text',tx],['Main',primary],['Support',second],['Accent',acc]];
  }
  var names={trust:'Trust',energy:'Energy',calm:'Calm',luxury:'Luxury'};
  qf.addEventListener('submit',function(e){
    e.preventDefault();
    var a={};['q1','q2','q3','q4','q5'].forEach(function(k){var c=qf.querySelector('input[name='+k+']:checked');if(c)a[k]=c.value});
    var m=$('#cq-msg');
    if(Object.keys(a).length<5){m.textContent='Please answer all 5 questions.';m.className='msg err';return}
    m.textContent='';m.className='msg';
    var pal=make(a),box=$('#cq-sw');
    box.innerHTML=pal.map(function(p){return '<button type="button" data-hex="'+p[1]+'" style="background:'+p[1]+';color:'+ink(p[1])+'" aria-label="'+p[0]+' '+p[1]+', tap to copy">'+p[0]+'<small>'+p[1].toUpperCase()+'</small></button>'}).join('');
    $('#cq-res').hidden=false;
    $('#cq-copy-all').dataset.all=pal.map(function(p){return p[1].toUpperCase()}).join(', ');
    $('#cq-res').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
  });
  function copy(t,btn,label){
    var done=function(){var o=btn.dataset.o||btn.innerHTML;btn.dataset.o=o;if(btn.tagName==='BUTTON'&&btn.dataset.hex){btn.querySelector('small').textContent='Copied'}else btn.textContent='Copied!';setTimeout(function(){if(btn.dataset.hex)btn.querySelector('small').textContent=btn.dataset.hex.toUpperCase();else btn.textContent=label},1400)};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,done);
    else{var x=document.createElement('textarea');x.value=t;document.body.appendChild(x);x.select();try{document.execCommand('copy')}catch(e){}x.remove();done()}
  }
  $('#cq-sw').addEventListener('click',function(e){var b=e.target.closest('button');if(b)copy(b.dataset.hex.toUpperCase(),b,'')});
  $('#cq-copy-all').addEventListener('click',function(e){copy(e.currentTarget.dataset.all,e.currentTarget,'Copy all colors')});
})();
