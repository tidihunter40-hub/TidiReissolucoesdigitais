# Auditoria técnica — TidiReis Soluções Digitais

Atualizada em 20/10/2026. Nenhuma publicação, domínio ou projeto Vercel foi alterado.

## Status

**NÃO APTO para publicação em produção nesta etapa.** O código está preparado para uma prévia estática na Vercel, mas a revisão visual e funcional nas cinco larguras, o teste PWA em HTTPS e a medição Lighthouse ainda não puderam ser executados. Também faltam o domínio oficial e a confirmação dos dados comerciais. Estes são critérios da missão antes de declarar o site pronto para entrar no ar.

## 1. Framework e estrutura

- Site estático em HTML, CSS e JavaScript; sem framework, `package.json`, lockfile, banco de dados ou dependências de execução.
- Node.js local: v24.14.0, usado apenas para verificações. Python local: 3.10.11, com Pillow para `verify_site.py`.
- Páginas: `index.html`, `privacidade.html`, `offline.html` e `404.html`.
- Recursos externos observados: links comerciais para WhatsApp. Sem fontes, scripts, vídeos ou APIs externas carregadas pela página.
- Não há variáveis de ambiente necessárias; por isso, `.env.example` não foi criado.

## 2. Problemas e correções

| Achado | Correção |
| --- | --- |
| Imagens fotográficas PNG pesadas | Sete imagens usadas pelo site foram convertidas para WebP **sem perdas** e as referências atualizadas. Comparação pixel a pixel confirmou igualdade. Economia conjunta: 4.769.483 bytes (31,4%). Os PNGs originais permanecem localmente. |
| Arquivos de auditoria, testes e imagens fonte poderiam integrar o pacote | `.vercelignore` exclui esses arquivos da implantação, mantendo todos os recursos usados pelo site. `.gitignore` protege arquivos locais de ambiente e cache. |
| Projeto estático dependia das opções escolhidas no painel | `vercel.json` agora fixa o preset Other, sem build e com saída na raiz, preservando os cabeçalhos de segurança e sem reescrita de rotas. |
| Falta de página própria para endereço inexistente | Adicionado `404.html` com a mesma identidade da página offline; não há redirecionamento genérico. |
| Metadados não mencionavam a localidade solicitada | Título, descrição, Open Graph e Twitter Card ajustados para Ribeira do Pombal, BA, sem adicionar endereço comercial. |
| Cache PWA referenciava o PNG antigo do hero | Pré-cache apontado ao WebP e versão do cache elevada para `tidireis-static-v9`. |

A logomarca original, o layout das páginas existentes, as cores, as animações e as funcionalidades não foram modificados.

## 3. Arquivos alterados

`index.html`, `advanced.js`, `showcase.js`, `reference.css`, `sw.js`, `vercel.json`, `verify_site.py`, `README.md`, `.vercelignore`, `.gitignore`, `404.html`, `AUDITORIA.md` e sete novas imagens `.webp` em `assets/`.

## 4. Verificações executadas

- `python verify_site.py`: passou; IDs e âncoras, seis serviços, seis conceitos, cinco experiências do TR Lab, oito opções de orçamento, manifest, ícones, 404, referências de recursos e configuração estática.
- `node verify_showcase.js`: passou; abas e interações de site, loja, painel, sistema, PWA demonstrativo e identidade visual.
- `node verify_sw.js`: passou; pré-cache, remoção de cache antigo, fallback offline e atualização.
- `node --check` em `script.js`, `advanced.js`, `showcase.js` e `sw.js`: passou.
- `vercel.json` e `manifest.webmanifest`: JSON válido.
- Sete pares PNG/WebP: mesmas dimensões, modo de cor e pixels; todos os 15 recursos locais referenciados existem e não constam da lista de exclusão da Vercel.
- Busca estática por chaves, senhas e variáveis de ambiente: nenhum segredo encontrado nos arquivos do projeto. A verificação não substitui uma revisão de histórico de Git, pois esta pasta não é um repositório Git.

**Build de produção:** não se aplica; a Vercel serve os arquivos estáticos diretamente. Não há instalação, lint ou verificação de tipos configurados. O CLI da Vercel não está instalado e não existe projeto local vinculado; nenhum `vercel build` foi executado.

## 5. Configuração recomendada na Vercel

- Framework Preset: **Other**.
- Root Directory: esta pasta.
- Build Command: vazio.
- Output Directory: `.`.
- Install Command: nenhum.
- Variáveis de ambiente: nenhuma.
- `vercel.json`: manter como está; configura cabeçalhos e o modo estático.
- Não habilitar uma reescrita curinga para `index.html`; a Vercel pode servir `404.html` para rotas ausentes.

## 6. Pendências para liberar produção

1. Validar visualmente e operar o site em navegador real a 1920, 1440, 768, 390 e 360 px, incluindo menu, orçamento, comparador, TR Lab e seis abas do portfólio. A prévia HTTP local foi impedida pelas permissões de socket deste ambiente; o navegador de automação também bloqueou a abertura por `file://`.
2. Testar a instalação, atualização e navegação offline do PWA em origem HTTPS e dispositivos reais. O teste automatizado do service worker cobre a lógica, não a instalação do navegador.
3. Medir Lighthouse e Core Web Vitals em prévia HTTPS. Não há pontuação aferida.
4. Informar o domínio oficial para configurar `canonical`, `og:url`, `og:image` absoluto e `sitemap.xml` com URLs válidas. O `og:image` atual é relativo e pode não gerar prévia em todos os serviços.
5. Confirmar razão social, CNPJ e WhatsApp com o titular. A validação matemática do CNPJ passou, mas não confirma o cadastro oficial.
6. Revisar a política de privacidade quando a hospedagem final e eventuais ferramentas de analytics forem definidas.
7. Se a publicação usar a integração Git da Vercel, criar e conectar um repositório; a pasta atual ainda não é um repositório Git.

A publicação permanece sujeita à autorização do titular.
