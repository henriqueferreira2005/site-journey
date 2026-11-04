// Gerenciamento do tema claro/escuro.

// Tema claro/escuro: preferência salva no navegador; "auto" segue o sistema.
(function(){
  var KEY='mj-theme',root=document.documentElement,mq=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)');
  function stored(){try{var v=localStorage.getItem(KEY);return v==='light'||v==='dark'?v:'auto'}catch(e){return 'auto'}}
  var pref=stored();
  function resolved(){return pref==='auto'?(mq&&mq.matches?'dark':'light'):pref}
  function apply(animate){
    var t=resolved();
    if(animate&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){root.classList.add('theme-anim');setTimeout(function(){root.classList.remove('theme-anim')},450)}
    root.setAttribute('data-theme',t);root.setAttribute('data-theme-pref',pref);
    var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',t==='dark'?'#141626':'#f9f7f3');
  }
  window.MJTheme={
    get:function(){return pref},
    resolved:resolved,
    set:function(p){pref=p;try{if(p==='auto')localStorage.removeItem(KEY);else localStorage.setItem(KEY,p)}catch(e){}apply(true);document.dispatchEvent(new Event('themechange'))},
    toggle:function(){this.set(resolved()==='dark'?'light':'dark')}
  };
  if(mq){var h=function(){if(pref==='auto'){apply(true);document.dispatchEvent(new Event('themechange'))}};mq.addEventListener?mq.addEventListener('change',h):mq.addListener(h)}
  apply(false);
})();
