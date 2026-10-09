const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../environment.js'),C=require('../farm-camera.js');
test('continuous world covers portrait, landscape, ultra-wide, zoom and extreme drags',()=>{
  for(const [w,h] of [[320,900],[390,844],[844,390],[1920,1080],[2560,1080],[3440,1440]])for(const z of [1,1.5,3])for(const center of [{x:600,y:380},{x:-99999,y:-99999},{x:99999,y:99999}]){
    const f=C.frame(w,h,z,center),world=C.world;
    assert.ok(world.x*f.scale+f.offsetX<=.001);assert.ok(world.y*f.scale+f.offsetY<=.001);
    assert.ok((world.x+world.width)*f.scale+f.offsetX>=w-.001);assert.ok((world.y+world.height)*f.scale+f.offsetY>=h-.001);
  }
});
test('southern seasons follow equinox and solstice instants, not month boundaries',()=>{
  assert.equal(E.seasonAt(new Date('2026-01-15T12:00:00Z')),'Verão');
  assert.equal(E.seasonAt(new Date('2026-04-15T12:00:00Z')),'Outono');
  assert.equal(E.seasonAt(new Date('2026-07-15T12:00:00Z')),'Inverno');
  assert.equal(E.seasonAt(new Date('2026-10-09T16:00:00Z')),'Primavera');
  assert.equal(E.seasonAt(new Date('2026-09-22T23:50:00Z')),'Inverno');
  assert.equal(E.seasonAt(new Date('2026-09-23T00:20:00Z')),'Primavera');
  assert.equal(E.seasonAt(new Date('2026-10-09T16:00:00Z'),'north'),'Outono');
});
test('moon agrees with USNO October 2026 primary phase dates',()=>{
  const before=E.moonAt(new Date('2026-10-09T16:00:00Z'));assert.equal(before.name,'Lua minguante');assert.ok(before.illumination<.02);
  const fresh=E.moonAt(new Date('2026-10-10T15:50:00Z'));assert.equal(fresh.name,'Lua nova');assert.ok(fresh.illumination<.002);
  const full=E.moonAt(new Date('2026-10-26T04:12:00Z'));assert.equal(full.name,'Lua cheia');assert.ok(full.illumination>.998);
});
test('local noon and midnight produce clearly distinct light and continuous twilight',()=>{
  const noon=E.lightingAt(new Date(2026,9,9,12)),night=E.lightingAt(new Date(2026,9,9,0));assert.equal(noon.daylight,1);assert.equal(night.daylight,0);assert.equal(night.period,'Noite');
  const dawn=E.lightingAt(new Date(2026,9,9,6));assert.ok(dawn.daylight>0&&dawn.daylight<1);
  const summer=E.lightingAt(new Date(2026,0,15,12)),winter=E.lightingAt(new Date(2026,6,15,12));assert.ok(summer.dayLength>winter.dayLength);
});