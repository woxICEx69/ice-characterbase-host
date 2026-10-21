const VERSION = '1.0.0';
const PATHS = new Set(['/1.lua', '/main.lua']);
const utf8 = new TextEncoder();
const json = (value, status=200) => new Response(JSON.stringify(value, null, 2) + '\n', {
 status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});
async function sha256(text) {
 const buf = await crypto.subtle.digest('SHA-256', utf8.encode(text));
 return Array.from(new Uint8Array(buf), x => x.toString(16).padStart(2, '0')).join('');
}
function lua(source, hash) {
 return new Response(source, { headers: {
  'Content-Type':'text/plain; charset=utf-8', 'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff', 'ETag':`"${hash}"`,
 }});
}
export async function handleRequest(request, source) {
 const u = new URL(request.url);
 const path = u.pathname;
 const method = request.method;
 const head = method === 'HEAD';
 const get = method === 'GET' || head;
 let selectedPath = path;
 if (method === 'POST' && path === '/') {
  const ct = request.headers.get('Content-Type') || '';
  if (!ct.toLowerCase().startsWith('application/x-www-form-urlencoded')) return json({error:'Unsupported content type'},415);
  const data = await request.text();
  if (utf8.encode(data).length > 1024) return json({error:'Form too large'},413);
  selectedPath = '/' + (new URLSearchParams(data).get('key_path') || '');
 }
 else if (!get) return new Response('Method not allowed\n',{status:405,headers:{Allow:'GET, HEAD, POST'}});
 let response;
 if (PATHS.has(selectedPath)) response = lua(source, await sha256(source));
 else if (get && path === '/health') response = json({ok:true, service:'ice-characterbase-host', version:VERSION});
 else if (get && path === '/manifest.json') response = json({
  service:'ice-characterbase-host', version:VERSION, path:'/1.lua',
  bytes:utf8.encode(source).length, sha256:await sha256(source),
  warning:'The manifest is served by the same host; clients need independent hash validation.'
 });
 else if (get && path === '/') response = json({service:'ice-characterbase-host', endpoints:['/health','/manifest.json','/1.lua'], post:'key_path=1.lua'});
 else response = json({error:'Not found'},404);
 return head ? new Response(null,{status:response.status,headers:response.headers}) : response;
}
