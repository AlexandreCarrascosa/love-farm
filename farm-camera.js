/* Camera geometry shared with regression tests. No view can leave the world. */
(function(root){
  'use strict';
  const world=Object.freeze({x:-230,y:-370,width:1680,height:1680});
  function frame(width,height,zoom,center){
    const base=Math.max(Math.min(width/1200,height/760),width/world.width,height/world.height)*1.002;
    const scale=base*Math.max(1,zoom),anchorY=height*(width<760?.44:.5);
    const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
    const x=clamp(center.x,world.x+width/(2*scale),world.x+world.width-width/(2*scale));
    const y=clamp(center.y,world.y+anchorY/scale,world.y+world.height-(height-anchorY)/scale);
    return{scale,x,y,offsetX:width/2-x*scale,offsetY:anchorY-y*scale,width,height};
  }
  const api={world,frame};root.FarmCamera=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);