import { WebSocket } from '../frontend/node_modules/ws/wrapper.mjs';

const target = await fetch('http://127.0.0.1:9222/json/new?http://localhost:5173/solicitudes/6ad01f1d1dd96021e287c851', { method: 'PUT' }).then((r) => r.json());

const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pendientes = new Map();

function enviar(metodo, params = {}) {
  const msgId = ++id;
  return new Promise((resolve) => {
    pendientes.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method: metodo, params }));
  });
}

ws.on('message', (buf) => {
  const msg = JSON.parse(buf.toString());
  if (msg.id && pendientes.has(msg.id)) {
    pendientes.get(msg.id)(msg.result);
    pendientes.delete(msg.id);
  }
  if (msg.method === 'Network.responseReceived') {
    const r = msg.params.response;
    console.log('RESPUESTA', r.status, r.url);
  }
  if (msg.method === 'Network.loadingFailed') {
    console.log('FALLO', msg.params.errorText, msg.params.blockedReason || '', msg.params.type);
  }
  if (msg.method === 'Runtime.consoleAPICalled') {
    console.log('CONSOLA', msg.params.type, JSON.stringify(msg.params.args.map((a) => a.value ?? a.description)));
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    console.log('EXCEPCION', JSON.stringify(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text));
  }
});

await new Promise((r) => ws.on('open', r));
await enviar('Network.enable');
await enviar('Runtime.enable');
await enviar('Page.enable');
await enviar('Page.reload', { ignoreCache: true });
await new Promise((r) => setTimeout(r, 6000));
const dom = await enviar('Runtime.evaluate', { expression: 'document.querySelector(".app-contenido")?.innerText?.slice(0, 500)' });
console.log('DOM:', JSON.stringify(dom.result.value));
ws.close();
