const test = require('node:test');
const assert = require('node:assert/strict');
const F = require('../farm-core.js');

test('the tractor visits every field cell once, without teleporting', () => {
  assert.equal(new Set(F.route.map(p=>p.row+','+p.col)).size,F.field.cols*7);
  F.route.slice(1).forEach((p,i)=>assert.ok(Math.hypot(p.x-F.route[i].x,p.y-F.route[i].y)<=23));
  assert.ok(F.route.some(p=>p.cut));
  assert.ok(F.route.some(p=>!p.cut));
});
test('the harvested field matches the full seven-row message', () => {
  assert.equal(F.rows.length,7);
  assert.ok(F.rows.every(r=>r.length===F.field.cols));
  assert.equal(F.route.filter(p=>p.cut).length,F.rows.join('').split('').filter(c=>c==='1').length);
  assert.ok(F.field.x+F.field.cols*F.field.cellW<1100);
});
test('all sequence phases are finite, bounded and reach the final message', () => {
  for(let t=0;t<=40;t+=.1){const s=F.state(t),p=F.routePosition(s.harvest);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.ok(s.progress>=0&&s.progress<=1);}
  assert.equal(F.state(0).harvest,0);assert.equal(F.state(7).writing,0);
  assert.equal(F.state(23).writing,1);assert.equal(F.state(34).harvest,1);
  assert.equal(F.state(36).done,true);assert.match(F.state(36).caption,/A ❤️ R.*I LOVE U/);
});
test('the airplane writes connected smoke strokes with ink off between letters', () => {
  assert.ok(F.smoke.some(p=>!p.ink));
  assert.ok(F.smoke.length>200);
  F.smoke.forEach(p=>assert.ok(p.x>=400&&p.x<=855&&p.y>=60&&p.y<=205));
  F.smoke.slice(1).forEach((p,i)=>assert.ok(Math.hypot(p.x-F.smoke[i].x,p.y-F.smoke[i].y)<3.1));
});
