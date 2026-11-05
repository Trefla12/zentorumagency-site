// Set this to the external booking/ticket page (https://...). While empty, buttons use the local booking.html.
var BOOKING_URL='https://www.eventbrite.com/e/luis-gabriel-live-a-night-above-chicago-tickets-2004410465660';
(function(){
  if(BOOKING_URL){document.querySelectorAll('[data-book]').forEach(function(a){a.href=BOOKING_URL;a.target='_blank';a.rel='noopener';});}
  var l=document.querySelector('.lights');
  if(l){for(var i=0;i<22;i++){var e=document.createElement('i');
    e.style.cssText='left:'+(Math.random()*100)+'%;--s:'+(5+Math.random()*9)+'px;--d:'+(9+Math.random()*9)+'s;--t:'+(-Math.random()*14)+'s;--x:'+((Math.random()-.5)*120)+'px';
    l.appendChild(e);}}
  var els=document.querySelectorAll('.rv,.rule');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return;}
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}})},{threshold:.18});
  els.forEach(function(e){io.observe(e)});
})();
