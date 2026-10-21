const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('advanced.js', 'utf8');
const start = source.indexOf("  const terminalOutput = $('#terminalOutput')");
const end = source.indexOf("  if (location.protocol === 'https:'", start);
assert(start >= 0 && end > start, 'Bloco do TR System não encontrado');

class Element {
  constructor() { this.children = []; this.listeners = {}; this.value = ''; this.textContent = ''; this.scrollHeight = 100; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  focus() { this.focused = true; }
  setSelectionRange() {}
}

const output = new Element();
const input = new Element();
const form = new Element();
const elements = { '#terminalOutput': output, '#terminalInput': input, '#terminalForm': form };
let scrollRequest;
vm.runInNewContext(`(() => { const $ = selector => elements[selector]; ${source.slice(start, end)} })()`, {
  elements,
  document: { createElement: () => new Element() },
  window: { scrollTo: options => { scrollRequest = options; } },
  matchMedia: () => ({ matches: true })
});

function execute(command) {
  input.value = command;
  form.listeners.submit({ preventDefault() {} });
  return output.children.at(-1);
}
function response(entry) { return entry.children[1].children[0].textContent; }

const commands = ['help', 'sobre', 'servicos', 'sites', 'sistemas', 'apps', 'design', 'manutencao', 'contato'];
for (const command of commands) {
  const entry = execute(command.toUpperCase());
  assert(entry, `Sem resposta para ${command}`);
  assert(!response(entry).includes('Comando não reconhecido'), `Comando inválido: ${command}`);
}
assert(response(output.children[0]).includes('help · sobre · servicos'));
assert(response(output.children[2]).includes('Venda de peças e periféricos'));
assert.equal(output.children[3].children[1].children[1].href, '#projetos');
assert(response(execute('MANUTENÇÃO')).includes('manutenção de computadores'));
assert(response(execute('<script>alert(1)</script>')).includes('Comando não reconhecido: <script>alert(1)</script>'));
assert.equal(input.value, '');

input.value = 'rascunho';
input.listeners.keydown({ key: 'ArrowUp', preventDefault() {} });
assert.equal(input.value, '<script>alert(1)</script>');
input.listeners.keydown({ key: 'ArrowUp', preventDefault() {} });
assert.equal(input.value, 'MANUTENÇÃO');
input.listeners.keydown({ key: 'ArrowDown', preventDefault() {} });
assert.equal(input.value, '<script>alert(1)</script>');
input.listeners.keydown({ key: 'ArrowDown', preventDefault() {} });
assert.equal(input.value, 'rascunho');

execute('home');
assert.equal(scrollRequest.top, 0);
assert.equal(scrollRequest.behavior, 'auto');
execute('clear');
assert.equal(output.children.length, 0);
input.listeners.keydown({ key: 'ArrowUp', preventDefault() {} });
assert.equal(input.value, 'clear');
assert(input.focused);
console.log('OK: comandos, maiúsculas, acentos, entrada inválida, links, histórico, home e clear.');
