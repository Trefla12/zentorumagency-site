/* ROI calculator: only uses the numbers the visitor types. No assumed uplift. */
(function(){
  var f=document.getElementById('rc-f'); if(!f) return;
  var $=function(i){return document.getElementById(i)};
  var usd=function(n){var a=Math.abs(Math.round(n));return (n<0?'-':'')+'$'+a.toLocaleString('en-US')};
  var num=function(i){var v=$(i).value.trim().replace(/,/g,''); return v===''?NaN:+v};
  var n1=function(n){return (Math.round(n*10)/10).toLocaleString('en-US')};
  var pk=$('rc-pk'), cost=$('rc-cost');
  pk.addEventListener('change',function(){if(pk.value!=='custom'){cost.value=pk.value}else{cost.focus()}run()});
  cost.addEventListener('input',function(){var m=[].some.call(pk.options,function(o){return o.value===cost.value.trim()&&o.value!=='custom'});
    var hit=[].filter.call(pk.options,function(o){return o.value===cost.value.trim()})[0]; pk.value=hit?hit.value:'custom'});
  function months(m){return m<1?'under 1 month':m>60?'more than 5 years':n1(m)+(n1(m)==='1'?' month':' months')}
  function run(){
    var v=num('rc-v'),c=num('rc-c'),e=num('rc-e'),a=num('rc-a'),k=num('rc-cost');
    var out=$('rc-out'),bad=[v,c,e,a,k].some(function(x){return !isFinite(x)||x<0})||c>100||e>100||v===0||a===0||k===0;
    var big0=v>1e9||a>1e7||k>1e7;
    if(!bad&&big0){out.innerHTML='<p class="rc__empty">Those numbers are bigger than this calculator is built for. Try up to 1,000,000,000 visitors and $10,000,000 for value and cost.</p>';return}
    if(bad){out.innerHTML='<p class="rc__empty">Fill in all five numbers and your result appears here. The expected rate is the one only you can judge: be conservative.</p>';return}
    var cur=v*c/100, nw=v*e/100, xc=nw-cur, xr=xc*a, ret=xr*12-k, flag='';
    var big,sub,pay;
    if(xc<=0){
      big='<p class="rc__v neg">No payback</p>'; sub='With these numbers a new site would not bring in extra customers. Try a different expected rate, or ask us whether a redesign is the right fix right now.'; pay='None';
    }else{
      var pm=k/xr; pay=months(pm);
      big='<p class="rc__v'+(ret<0?' neg':'')+'">'+usd(ret)+'</p>'; sub=ret>=0?'Estimated 12-month return: 12 months of extra revenue minus the website cost.':'In the first 12 months the extra revenue would not yet cover the cost. It would pay back in '+pay+'.';
      var half=k/(xr/2); flag='<p class="rc__flag">If only half of that improvement happened, payback would take about '+months(half)+' instead.</p>';
    }
    if(e>c*3&&c>0) flag+='<p class="rc__flag">That is a big jump from today&rsquo;s rate. Try a smaller number and see if it still pays off.</p>';
    out.innerHTML='<div class="rc__big"><p class="rc__k">12-month return (after the website cost)</p>'+big+'<p class="rc__t">'+sub+'</p></div>'+
      '<div class="rc__g"><div class="rc__c"><p class="rc__k">Extra customers / month</p><b>'+(xc<=0?'0':'+'+n1(xc))+'</b></div>'+
      '<div class="rc__c"><p class="rc__k">Extra revenue / month</p><b>'+(xc<=0?'$0':'+'+usd(xr))+'</b></div>'+
      '<div class="rc__c"><p class="rc__k">Payback time</p><b>'+pay+'</b></div></div>'+flag+
      '<p class="note"><b>Estimate based on your numbers &mdash; not a promise.</b> It counts revenue, not profit, and leaves out hosting and running costs. Use profit per customer for a stricter result.</p>';
  }
  f.addEventListener('input',run); f.addEventListener('submit',function(e){e.preventDefault();run()});
  run();
})();
