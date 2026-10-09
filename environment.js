/* Local astronomical data. Astronomy Engine is bundled under its MIT license. */
(function(root){
  'use strict';
  const A=typeof module!=='undefined'&&module.exports?require('./vendor/astronomy.browser.min.js'):root.Astronomy;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
  const seasonsCache=new Map();
  function seasonAt(date,hemisphere='south'){
    const year=date.getUTCFullYear();if(!seasonsCache.has(year))seasonsCache.set(year,A.Seasons(year));
    const s=seasonsCache.get(year),t=+date;
    let index=t<+s.mar_equinox.date?0:t<+s.jun_solstice.date?1:t<+s.sep_equinox.date?2:t<+s.dec_solstice.date?3:0;
    const names=hemisphere==='north'?['Inverno','Primavera','Verão','Outono']:['Verão','Outono','Inverno','Primavera'];
    return names[index];
  }
  function moonAt(date){
    const angle=A.MoonPhase(date),illumination=A.Illumination(A.Body.Moon,date).phase_fraction;
    let index;
    if(angle<6||angle>=354)index=0;else if(angle<84)index=1;else if(angle<96)index=2;else if(angle<174)index=3;else if(angle<186)index=4;else if(angle<264)index=5;else if(angle<276)index=6;else index=7;
    return{angle,illumination,name:['Lua nova','Lua crescente','Quarto crescente','Gibosa crescente','Lua cheia','Gibosa minguante','Quarto minguante','Lua minguante'][index],icon:['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'][index],index};
  }
  function lightingAt(date,hemisphere='south'){
    // Artistic daylight follows the device's civil clock. Seasonal day length is
    // based on a representative tropical latitude, without requesting location.
    const hours=date.getHours()+date.getMinutes()/60+date.getSeconds()/3600;
    const longitude=A.SunPosition(date).elon*Math.PI/180;
    const declination=Math.asin(Math.sin(23.43928*Math.PI/180)*Math.sin(longitude));
    const latitude=(hemisphere==='north'?15.6:-15.6)*Math.PI/180;
    const dayLength=24/Math.PI*Math.acos(clamp(-Math.tan(latitude)*Math.tan(declination),-1,1));
    const dawn=12-dayLength/2,dusk=12+dayLength/2;
    const daylight=smooth(dawn-.6,dawn+1,hours)*(1-smooth(dusk-1,dusk+.6,hours));
    const golden=Math.max(Math.exp(-(((hours-dawn)/.8)**2)),Math.exp(-(((hours-dusk)/.8)**2)));
    const period=hours<dawn-.6||hours>=dusk+.6?'Noite':hours<dawn+1?'Amanhecer':hours<12?'Manhã':hours<dusk-1?'Tarde':'Entardecer';
    return{hours,dayLength,dawn,dusk,daylight,golden,period};
  }
  function at(date=new Date(),hemisphere='south'){
    if(!(date instanceof Date)||!Number.isFinite(+date))throw new TypeError('A valid date is required');
    return{date:date.toISOString(),season:seasonAt(date,hemisphere),hemisphere,moon:moonAt(date),light:lightingAt(date,hemisphere),clock:date.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),timezone:Intl.DateTimeFormat().resolvedOptions().timeZone};
  }
  const api={at,seasonAt,moonAt,lightingAt};root.FarmEnvironment=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);