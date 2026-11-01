/* Currency display switch. Fixed approximate rates, no network calls. HTML keeps USD. */
(function(){
  var ASOF='30 Oct 2026 (ECB reference)';
  var C={USD:{r:1,n:'US dollar'},EUR:{r:0.895,n:'Euro'},GBP:{r:0.746,n:'British pound'},RON:{r:4.78,n:'Romanian leu'},CAD:{r:1.40,n:'Canadian dollar'},AUD:{r:1.42,n:'Australian dollar'}};
  var KEY='zta-cur',cur='USD';
  try{var s=localStorage.getItem(KEY);if(s&&C[s])cur=s}catch(e){}
  var RE=/\$\s?(\d[\d,]*(?:\.\d+)?)(\s?[Kk])?(?:(\s?[\u2013-]\s?)(\d[\d,]*(?:\.\d+)?)(\s?[Kk])(?![\w]))?/g;
  function rnd(v){var st=v<100?5:v<10000?(v<1000?5:10):50;return Math.max(st,Math.round(v/st)*st)}
  function fmt(c,usd){
    var v=rnd(usd*C[c].r),t=v.toLocaleString('en-US');
    return c==='EUR'?'€'+t:c==='GBP'?'£'+t:c==='RON'?t+' RON':c==='CAD'?'CA$'+t:'A$'+t;
  }
  function conv(str){
    return str.replace(RE,function(m,n,k,sep,n2,k2){
      var u=parseFloat(n.replace(/,/g,''));if(isNaN(u))return m;
      if(n2){/* "$1-3K": the K applies to both numbers */
        var u2=parseFloat(n2.replace(/,/g,''))*1000;if(isNaN(u2))return m;
        return fmt(cur,(k||u<100)?u*1000:u)+sep+fmt(cur,u2);
      }
      if(k)u*=1000;
      return fmt(cur,u);
    });
  }
  var recs=new WeakMap(),roots=[],busy=false;
  function node(t){
    var r=recs.get(t),o=(r&&t.data===r.c)?r.o:t.data;
    if(!r&&o.indexOf('$')<0)return;
    var c=cur==='USD'?o:conv(o);
    recs.set(t,{o:o,c:c});
    if(t.data!==c)t.data=c;
  }
  function walk(root){
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
      var p=n.parentNode;
      return p&&/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(p.nodeName)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
    var a=[],n;while((n=w.nextNode()))a.push(n);a.forEach(node);
  }
  function all(){busy=true;roots.forEach(walk);mo.takeRecords();busy=false}
  var mo=new MutationObserver(function(ms){
    if(busy)return;busy=true;
    ms.forEach(function(m){
      if(m.type==='characterData')node(m.target);
      else m.addedNodes.forEach(function(a){if(a.nodeType===3)node(a);else if(a.nodeType===1)walk(a)});
    });
    mo.takeRecords();busy=false;
  });
  function init(){
    document.querySelectorAll('[data-cur-scope]').forEach(function(e){roots.push(e)});
    var h=document.querySelector('header.nav');if(h)roots.push(h);
    var z=document.querySelector('.zc');
    if(z)roots.push(z);
    else{/* chat launcher is added by zta-chat.js, maybe after this script: adopt it when it appears */
      var wb=new MutationObserver(function(){var c=document.querySelector('.zc');
        if(c){wb.disconnect();roots.push(c);mo.observe(c,{childList:true,subtree:true,characterData:true});if(cur!=='USD')walk(c)}});
      wb.observe(document.body,{childList:true});
    }
    if(!roots.length)return;
    var bar=document.querySelector('[data-cur-bar]');
    if(bar){
      var id='cur-sel';
      bar.innerHTML='<label for="'+id+'">Show prices in</label><select id="'+id+'" class="cur__s">'+
        Object.keys(C).map(function(k){return '<option value="'+k+'">'+k+' ('+C[k].n+')</option>'}).join('')+
        '</select><p class="cur__n">Approximate &mdash; invoiced in USD. Fixed rates as of '+ASOF+'.</p>';
      var sel=bar.querySelector('select');sel.value=cur;
      sel.addEventListener('change',function(){
        cur=sel.value;try{localStorage.setItem(KEY,cur)}catch(e){}all();
      });
    }
    roots.forEach(function(r){mo.observe(r,{childList:true,subtree:true,characterData:true})});
    if(cur!=='USD')all();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
