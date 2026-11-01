/* Zentorum Agency · Web Wins signup on /27-things/. No dependencies. */
(function(){
  var EP='https://script.google.com/macros/s/AKfycbzsNUGEs45W60Yx-EF95xi5CX0CcK8MYEizo3FUSoJ8qrPrVDP-tZn1UMdAFfXO486b/exec';
  var f=document.getElementById('ww-f');if(!f)return;
  var t0=Date.now(),$=function(i){return document.getElementById(i)};
  var okMail=function(e){return /^[^\s@,;<>"'()\[\]\\]+@[^\s@,;<>"'()\[\]\\]+\.[a-z]{2,}$/i.test(e)};
  var err=function(m){var e=$('ww-err');e.textContent=m;e.hidden=!m};
  f.addEventListener('submit',function(ev){
    ev.preventDefault();
    var nm=$('ww-n').value.trim(),em=$('ww-e').value.trim(),b=f.querySelector('button[type=submit]');
    if(nm.length<2)return err('Please add your first name.');
    if(!okMail(em))return err('Please check your email address.');
    if(!$('ww-c').checked)return err('Please tick the box so we know you are happy to get the weekly tip.');
    err('');b.disabled=true;b.textContent='One moment…';
    var body={type:'webwins',name:nm,email:em,services:'Web Wins signup (27 things PDF)',dream:'type=webwins. Wants the free PDF "27 things your small-business website needs" and the weekly Web Wins tip. Consent given on /27-things/. Reply with the tip list or add to the mailing list.',contact:'Email',page:location.href.split('?')[0],referrer:(document.referrer||'').slice(0,200),t:Math.max(4100,Date.now()-t0),botcheck:$('ww-bc').value,sid:'ww'+Date.now().toString(36)+Math.random().toString(36).slice(2,8)};
    var done=function(){f.hidden=true;var o=$('ww-ok');o.hidden=false;o.setAttribute('tabindex','-1');o.focus()};
    fetch(EP,{method:'POST',body:JSON.stringify(body),redirect:'follow'}).then(function(r){return r.json().catch(function(){return{}})}).then(function(j){
      if(j&&j.ok===false&&j.error!=='rate')throw new Error(j.error||'send');done()
    }).catch(function(){b.disabled=false;b.textContent='Send me the PDF + Web Wins';err('Sorry, that did not send. Check your connection and try again, or email zentorum1@gmail.com.')});
  });
})();
