/* Run with `node verify_showcase.js` to exercise the six local demonstrations. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('showcase.js', 'utf8');
for (const match of source.matchAll(/assets\/[\w.-]+\.(?:png|webp|jpg)/g)) {
  assert.ok(fs.existsSync(match[0]), `Missing showcase image: ${match[0]}`);
}

function element() {
  const listeners = {};
  const attributes = {};
  const classes = new Set();
  return {
    listeners, attributes, classes, innerHTML: '', textContent: '', hidden: false,
    classList: {
      add(name) { classes.add(name); }, remove(name) { classes.delete(name); },
      toggle(name, active) { if (active) classes.add(name); else classes.delete(name); },
    },
    addEventListener(name, handler) { listeners[name] = handler; },
    setAttribute(name, value) { attributes[name] = value; },
    querySelector() { return { focus() {} }; },
    focus() {},
  };
}
const ids = Object.fromEntries(['demo-screen', 'demo-panel', 'device-bar', 'device-url', 'demo-number', 'demo-category', 'demo-title', 'demo-description', 'demo-features', 'demo-next-label', 'demoNext', 'shopFeedback'].map(id => [id, element()]));
const tabs = Array.from({ length: 6 }, element);
const showcase = { querySelectorAll() { return tabs; } };
const document = {
  listeners: {},
  querySelector(selector) { return selector === '.showcase' ? showcase : null; },
  getElementById(id) { return ids[id]; },
  addEventListener(name, handler) { this.listeners[name] = handler; },
};
vm.runInNewContext(source, {
  document, matchMedia: () => ({ matches: true }), requestAnimationFrame: callback => callback(),
});
const screen = ids['demo-screen'];
const click = (action, value = '') => screen.listeners.click({ target: { closest: () => ({ dataset: { action, value } }) } });
const select = index => tabs[index].listeners.click();
const html = () => screen.innerHTML;

assert.match(html(), /ATELIÊ AURORA/);
click('site-page', 'Projetos');
assert.match(html(), /Ambientes que/);
select(1);
assert.match(html(), /NOVA/);
assert.match(html(), /Poltrona Aurora/);
assert.match(html(), /Mesa Nativa/);
assert.match(html(), /Luminária Sólis/);
click('shop-category', 'Iluminação');
assert.doesNotMatch(html(), /Poltrona Aurora/);
assert.match(html(), /Luminária Sólis/);
click('add-cart', 'lamp');
assert.match(html(), /SACOLA <b>1<\/b>/);
assert.match(ids.shopFeedback.textContent, /Luminária Sólis/);
select(2);
assert.match(html(), /PULSE/);
click('dash-period', '7 dias');
assert.match(html(), /R\$ 18.640/);
click('dash-refresh');
assert.match(html(), /R\$ 18.920/);
click('dash-view', 'Pedidos');
assert.match(html(), /PAINEL \/ PEDIDOS/);
select(3);
assert.match(html(), /FLOW/);
click('system-detail', 'FG-1042');
assert.match(html(), /role="dialog"/);
click('system-close');
assert.doesNotMatch(html(), /role="dialog"/);
click('system-status', 'FG-1042');
assert.match(html(), /FG-1042[\s\S]*?Concluído/);
screen.listeners.change({ target: { id: 'systemFilter', value: 'Aguardando' } });
assert.doesNotMatch(html(), /Marina Costa/);
click('system-area', 'Clientes');
assert.match(html(), /Rafael Almeida/);
select(4);
assert.match(html(), /sc-phone/);
click('app-page', 'Serviços');
assert.match(html(), /Consultoria pessoal/);
click('app-service', 'Consultoria pessoal');
assert.match(html(), /atendimento demonstrativo selecionado/);
click('app-page', 'Avisos');
assert.match(html(), /Novos horários disponíveis/);
select(5);
assert.match(html(), /MAREA/);
click('brand-view', 'Aplicações');
assert.match(html(), /EMBALAGEM \/ CONCEITO/);
assert.match(html(), /PAPELARIA \/ CONCEITO/);
assert.equal(tabs.filter(tab => tab.attributes['aria-selected'] === 'true').length, 1);
ids.demoNext.listeners.click();
assert.match(html(), /ATELIÊ AURORA/);
console.log('OK: seis abas e interações de site, loja, painel, sistema, PWA e identidade visual.');
