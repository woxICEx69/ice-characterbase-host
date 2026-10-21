import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {handleRequest} from '../src/router.mjs';
const source = await readFile(new URL('../payload/1.lua',import.meta.url),'utf8');
const run=(path,opts={})=>handleRequest(new Request('https://example.workers.dev'+path,opts),source);

test('GET /1.lua returns exact source', async()=>{
 const r=await run('/1.lua'); assert.equal(r.status,200);assert.equal(await r.text(),source);
});
test('GET /main.lua is an alias', async()=>{
 const r=await run('/main.lua');assert.equal(await r.text(),source);
});
test('POST key_path=1.lua returns exact source',async()=>{
 const r=await run('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'key_path=1.lua'});
 assert.equal(r.status,200); assert.equal(await r.text(),source);
});
test('POST path traversal is denied',async()=>{
 const r=await run('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'key_path=../secret'});
 assert.equal(r.status,404);
});
test('manifest matches independently calculated bytes and digest',async()=>{
 const r=await run('/manifest.json');const x=await r.json();
 assert.equal(x.bytes,Buffer.byteLength(source,'utf8'));
 assert.equal(x.sha256,createHash('sha256').update(source).digest('hex'));
});
test('GET /health is healthy', async()=>{
 const x=await(await run('/health')).json(); assert.equal(x.ok,true);
});
test('HEAD /1.lua has empty body',async()=>{
 const r=await run('/1.lua',{method:'HEAD'});assert.equal(r.status,200);assert.equal(await r.text(),'');
});
test('unrecognized method returns 405',async()=>{
 const r=await run('/1.lua',{method:'PUT'});assert.equal(r.status,405);
});
test('unknown route is 404',async()=>{
 const r=await run('/nope');assert.equal(r.status,404);
});
