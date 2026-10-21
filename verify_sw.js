/* Run with `node verify_sw.js` to check offline and update logic. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const listeners = {};
const stores = new Map();
const scope = 'https://example.test/';
const normalize = value => new URL(typeof value === 'string' ? value : value.url, scope).href;
const caches = {
  async open(name) {
    if (!stores.has(name)) stores.set(name, new Map());
    const store = stores.get(name);
    return {
      async addAll(paths) { paths.forEach(path => store.set(normalize(path), { asset: path })); },
      async put(request, response) { store.set(normalize(request), response); },
    };
  },
  async match(request) {
    for (const store of stores.values()) {
      if (store.has(normalize(request))) return store.get(normalize(request));
    }
  },
  async keys() { return [...stores.keys()]; },
  async delete(name) { return stores.delete(name); },
};
let skipWaiting = false;
const self = {
  location: { origin: 'https://example.test' },
  registration: { scope },
  clients: { async claim() {} },
  skipWaiting() { skipWaiting = true; },
  addEventListener(name, handler) { listeners[name] = handler; },
};
vm.runInNewContext(fs.readFileSync('sw.js', 'utf8'), {
  self, caches, URL,
  fetch: async () => { throw new Error('offline'); },
});

async function main() {
  let pending;
  listeners.install({ waitUntil(value) { pending = value; } });
  await pending;
  assert.ok(await caches.match('./offline.html'));
  stores.set('tidireis-static-old', new Map());
  listeners.activate({ waitUntil(value) { pending = value; } });
  await pending;
  assert.equal(stores.has('tidireis-static-old'), false);

  const request = { url: 'https://example.test/privacidade.html', method: 'GET', mode: 'navigate' };
  let response;
  listeners.fetch({
    request,
    respondWith(value) { response = value; },
    waitUntil() {},
  });
  assert.deepEqual(await response, { asset: './privacidade.html' });
  response = null;
  listeners.fetch({
    request: { url: 'https://example.test/index.html?private=1', method: 'GET', mode: 'navigate' },
    respondWith(value) { response = value; },
    waitUntil() {},
  });
  assert.equal(response, null);
  response = null;
  listeners.fetch({
    request: { url: 'https://example.test/unknown-page', method: 'GET', mode: 'navigate' },
    respondWith(value) { response = value; },
    waitUntil() {},
  });
  assert.equal(response, null);
  listeners.message({ data: { type: 'SKIP_WAITING' } });
  assert.equal(skipWaiting, true);
  console.log('OK: pré-cache, limpeza de versões, fallback offline e atualização.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
