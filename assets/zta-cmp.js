/* Compare page: real-cost calculator and "what matters most" fit picker. All numbers are stated estimates (see "How we worked this out"). */
(function(){
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var usd=function(n){return '$'+Math.round(n).toLocaleString('en-US')};

  /* calculator */
  var f=document.getElementById('cc');
  if(f){
    var A={ // [money once, money per month, your hours once, your hours per month] for small / large sites
      d:{s:[0,25,20,1],l:[0,25,40,1]},
      f:{s:[1500,15,8,.5],l:[3500,15,12,.5]},
      z:{s:[1250,15,3,.5],l:[2500,15,5,.5]}
    };
    var rate=f.elements.rate,ro=document.getElementById('cc-rate-o'),fl=f.elements.fl,vd=document.getElementById('cc-v');
    var rows={};f.querySelectorAll('.cc__row').forEach(function(r){rows[r.dataset.k]={el:r,b:r.querySelector('.cc__v b'),m:r.querySelector('.m'),h:r.querySelector('.h'),d:r.querySelector('.cc__d'),cur:0}});
    var NM={d:'a DIY builder',f:'a freelancer',z:'Zentorum'};
    function val(n){var x=f.querySelector('input[name='+n+']:checked');return x?x.value:''}
    function count(o,to){
      if(RM){o.b.textContent=usd(to);o.cur=to;return}
      var from=o.cur,t0=performance.now();cancelAnimationFrame(o.raf);
      (function step(now){var u=Math.min(1,(now-t0)/500),e=1-Math.pow(1-u,3);o.b.textContent=usd(from+(to-from)*e);if(u<1)o.raf=requestAnimationFrame(step)})(t0);
      o.cur=to;
    }
    function calc(){
      var pg=val('pg')||'s',yr=+val('yr')||3,mo=yr*12,r=+rate.value,q=parseFloat(fl.value);
      ro.textContent=usd(r);rate.style.setProperty('--p',(r/150*100)+'%');
      var out={},max=0,best=null;
      Object.keys(A).forEach(function(k){
        var a=A[k][pg],once=a[0];if(k==='f'&&q>0)once=Math.min(q,50000);
        var money=once+a[1]*mo,hrs=a[2]+a[3]*mo,time=hrs*r,tot=money+time;
        out[k]={money:money,hrs:hrs,time:time,tot:tot};if(tot>max)max=tot;if(!best||tot<out[best].tot)best=k;
      });
      Object.keys(out).forEach(function(k){
        var o=out[k],w=rows[k];count(w,o.tot);
        w.m.style.width=(max?o.money/max*100:0)+'%';w.h.style.width=(max?o.time/max*100:0)+'%';
        w.d.textContent=usd(o.money)+' paid'+' · '+Math.round(o.hrs)+' hours of your time';
        w.el.classList.toggle('is-win',k===best);
      });
      var o=out,diff=Object.keys(o).filter(function(k){return k!==best}).map(function(k){return o[k].tot-o[best].tot}).sort(function(a,b){return a-b})[0];
      vd.innerHTML='Over '+yr+' year'+(yr>1?'s':'')+', the lowest total is <em>'+NM[best]+'</em>'+(diff>0?', about '+usd(diff)+' less than the next option.':'.')+(best==='d'&&r>0?' Worth it if you enjoy building it.':'');
    }
    f.addEventListener('input',calc);calc();
  }

  /* fit picker */
  var t=document.getElementById('cf'),v=document.getElementById('cf-v');
  if(t){
    var heads={};t.querySelectorAll('thead th[data-k]').forEach(function(h){heads[h.dataset.k]=h});
    var K=['d','f','z'];
    var SAY={
      d:['A DIY builder','You value low cost and doing it yourself. Start with a clean template, keep it to a few pages, and check it with our <a href="/tools/">free tools</a>.'],
      f:['A good freelancer','A custom design for a fair price. Ask to see past work, get a fixed quote and confirm you own the files.'],
      z:['Zentorum','You want a custom site live in days, without giving up your weekends. <a href="/free-mockup/">See a free homepage mockup</a> before you decide.']
    };
    function fit(){
      var picks=[].map.call(document.querySelectorAll('input[name=need]:checked'),function(x){return x.value});
      var sc={d:0,f:0,z:0};
      t.querySelectorAll('tbody tr').forEach(function(tr){
        var on=picks.indexOf(tr.dataset.n)>-1;tr.classList.toggle('is-on',on);
        if(on)tr.querySelectorAll('td').forEach(function(td,i){sc[K[i]]+=+td.dataset.s});
      });
      t.classList.toggle('has-pick',picks.length>0);
      var top=Math.max(sc.d,sc.f,sc.z),win=K.filter(function(k){return sc[k]===top&&picks.length});
      K.forEach(function(k){heads[k].querySelector('.cf__s').textContent=sc[k];heads[k].classList.toggle('is-best',win.indexOf(k)>-1)});
      v.classList.toggle('is-on',picks.length>0);
      if(!picks.length){v.innerHTML='<p class="cf__vt">Tick at least one box above.</p><p class="cf__vp">We score each option 0 to 2 on what you pick and show the best fit here.</p>';return}
      var pts=' ('+top+' of '+picks.length*2+' points)';
      if(win.length===1)v.innerHTML='<p class="cf__vt">Best fit for you: <em>'+SAY[win[0]][0]+'</em>'+pts+'</p><p class="cf__vp">'+SAY[win[0]][1]+'</p>';
      else v.innerHTML='<p class="cf__vt">Close call: <em>'+win.map(function(k){return SAY[k][0]}).join(' or ')+'</em>'+pts+'</p><p class="cf__vp">'+win.map(function(k){return SAY[k][1]}).join(' ')+'</p>';
    }
    document.querySelector('.cf__pick').addEventListener('change',fit);fit();
  }
})();
