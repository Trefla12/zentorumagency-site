/* Booking demo. Fully client-side: nothing is sent anywhere. */
(function(){
  var root=document.querySelector('[data-bk]');if(!root)return;
  var SV=[
    {id:'cut',n:'Haircut',m:45,d:'Wash, cut and style'},
    {id:'col',n:'Colour',m:90,d:'Full colour or highlights'},
    {id:'beard',n:'Beard trim',m:30,d:'Shape and finish'},
    {id:'cons',n:'Free consultation',m:20,d:'Chat about what you want'}
  ];
  var st={step:0,sv:null,date:null,time:null,name:'',contact:'',note:''};
  var STEPS=['Service','Date','Time','Your details','Done'];
  var DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var FULL=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function key(d){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
  function dates(){
    var out=[],d=new Date();d.setHours(0,0,0,0);
    for(var i=0;out.length<12&&i<30;i++){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate()+i);if(x.getDay()!==0)out.push(x)}
    return out;
  }
  function hash(s){var h=7;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}
  function fmtT(min){var h=Math.floor(min/60),m=min%60,ap=h>=12?'PM':'AM';h=h%12||12;return h+':'+(m<10?'0':'')+m+' '+ap}
  function slots(){
    var d=st.date,dur=st.sv.m,out=[],now=new Date(),isToday=key(d)===key(now);
    var nowMin=now.getHours()*60+now.getMinutes();
    var end=d.getDay()===6?15*60:18*60;
    for(var t=9*60;t+dur<=end;t+=30){
      var taken=hash(key(d)+':'+t)%5===0||(isToday&&t<=nowMin+30);
      out.push({t:t,off:taken});
    }
    return out;
  }
  function dl(d){return FULL[d.getDay()]+' '+d.getDate()+' '+MON[d.getMonth()]}
  function prog(){
    return '<ol class="bk__p" aria-label="Progress">'+STEPS.map(function(s,i){
      return '<li'+(i===st.step?' aria-current="step" class="on"':i<st.step?' class="done"':'')+'><span>'+(i+1)+'</span><b>'+s+'</b></li>'}).join('')+'</ol>';
  }
  function back(){
    var ready=st.step===0?st.sv:st.step===1?st.date:st.time!==null;
    return '<div class="ctas bk__nav">'+(st.step>0?'<button type="button" class="btn btn--ghost" data-back><span>Back</span></button>':'')+(st.step<3?'<button type="button" class="btn btn--gold" data-next'+(ready?'':' disabled')+'><span>Next</span></button>':'')+'</div>'}
  function render(focus){
    var h=prog(),s=st.step;
    if(s===0){
      h+='<h2 class="bk__h" tabindex="-1">Pick a service</h2><fieldset class="bk__f"><legend class="bk__sr">Service</legend><div class="bk__g">'+SV.map(function(v){
        return '<label class="bk__c"><input type="radio" name="sv" value="'+v.id+'"'+(st.sv&&st.sv.id===v.id?' checked':'')+'><span><b>'+v.n+'</b><small>'+v.d+' &middot; '+v.m+' min</small></span></label>'}).join('')+'</div></fieldset>'+back();
    }else if(s===1){
      h+='<h2 class="bk__h" tabindex="-1">Pick a day</h2><fieldset class="bk__f"><legend class="bk__sr">Day</legend><div class="bk__d">'+dates().map(function(d){
        var k=key(d),on=st.date&&key(st.date)===k;
        return '<label class="bk__dc"><input type="radio" name="dt" value="'+k+'"'+(on?' checked':'')+'><span><small>'+DAYS[d.getDay()]+'</small><b>'+d.getDate()+'</b><small>'+MON[d.getMonth()]+'</small></span></label>'}).join('')+'</div></fieldset>'+back();
    }else if(s===2){
      var sl=slots(),any=sl.some(function(x){return !x.off});
      h+='<h2 class="bk__h" tabindex="-1">Pick a time</h2><p class="bk__s">'+esc(dl(st.date))+' &middot; '+esc(st.sv.n)+' ('+st.sv.m+' min)</p>'+
        (any?'<fieldset class="bk__f"><legend class="bk__sr">Time</legend><div class="bk__t">'+sl.map(function(x){
          return '<label class="bk__tc"><input type="radio" name="tm" value="'+x.t+'"'+(x.off?' disabled':'')+(st.time===x.t?' checked':'')+'><span>'+fmtT(x.t)+(x.off?'<small>Taken</small>':'')+'</span></label>'}).join('')+'</div></fieldset>'
          :'<p class="note">No times left that day. Go back and pick another day.</p>')+
        '<p class="note">Sample availability: some slots are shown as taken to look like a real calendar.</p>'+back();
    }else if(s===3){
      h+='<h2 class="bk__h" tabindex="-1">Your details</h2><p class="bk__s">'+esc(dl(st.date))+' at '+fmtT(st.time)+' &middot; '+esc(st.sv.n)+'</p>'+
        '<form class="bk__form" novalidate><div class="field"><label for="bk-n">Your name</label><input class="in-t" id="bk-n" name="name" type="text" autocomplete="off" maxlength="60" value="'+esc(st.name)+'" required></div>'+
        '<div class="field"><label for="bk-c">Email or phone</label><input class="in-t" id="bk-c" name="contact" type="text" autocomplete="off" maxlength="80" value="'+esc(st.contact)+'" required></div>'+
        '<div class="field"><label for="bk-o">Note (optional)</label><textarea class="in-t" id="bk-o" name="note" maxlength="200">'+esc(st.note)+'</textarea></div>'+
        '<p class="ferr" id="bk-e" role="alert" hidden></p><p class="note">This is a demo. What you type stays in your browser and is not saved or sent.</p>'+
        '<div class="ctas"><button class="btn btn--gold" type="submit"><span>Confirm booking</span></button></div></form>'+back();
    }else{
      h+='<div class="bk__ok" role="status"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="none" stroke="#e6c98c" stroke-width="2"/><path d="M14 25l7 7 13-15" fill="none" stroke="#e6c98c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'+
        '<h2 class="bk__h" tabindex="-1">You&rsquo;re booked, '+esc(st.name.split(' ')[0]||'friend')+'</h2>'+
        '<dl class="bk__sum"><div><dt>Service</dt><dd>'+esc(st.sv.n)+' ('+st.sv.m+' min)</dd></div><div><dt>When</dt><dd>'+esc(dl(st.date))+', '+fmtT(st.time)+'</dd></div><div><dt>Confirmation sent to</dt><dd>'+esc(st.contact)+' (not really)</dd></div></dl>'+
        '<p class="note">Demo only: no real booking was made and nothing was sent. In a real system the client gets an email or text, reminders go out automatically and you see it in your calendar.</p>'+
        '<div class="ctas"><button class="btn btn--ghost" type="button" data-reset><span>Try again</span></button></div></div>';
    }
    root.innerHTML=h;
    if(focus){var hd=root.querySelector('.bk__h');if(hd)hd.focus({preventScroll:false})}
  }
  root.addEventListener('change',function(e){
    var t=e.target;
    if(t.name==='sv'){st.sv=SV.filter(function(v){return v.id===t.value})[0];st.date=null;st.time=null}
    else if(t.name==='dt'){var p=t.value.split('-');st.date=new Date(+p[0],+p[1]-1,+p[2]);st.time=null}
    else if(t.name==='tm'){st.time=+t.value}
    else return;
    var nx=root.querySelector('[data-next]');if(nx)nx.disabled=false;
  });
  root.addEventListener('click',function(e){
    if(e.target.closest('[data-back]'))go(st.step-1);
    else if(e.target.closest('[data-next]')){if(!e.target.closest('[data-next]').disabled)go(st.step+1)}
    else if(e.target.closest('[data-reset]')){st={step:0,sv:null,date:null,time:null,name:'',contact:'',note:''};render(true)}
  });
  root.addEventListener('submit',function(e){
    e.preventDefault();var f=e.target.elements,n=f.name.value.trim(),c=f.contact.value.trim(),er=root.querySelector('#bk-e');
    st.name=n;st.contact=c;st.note=f.note.value;
    if(!n||!c){er.textContent=!n?'Please add your name.':'Please add an email or phone number.';er.hidden=false;(!n?f.name:f.contact).focus();return}
    go(4);
  });
  function go(n){st.step=n;render(true)}
  render(false);
})();
