# TidiReis Soluções Digitais

Site institucional estático em HTML, CSS e JavaScript. Sem banco de dados, dependências externas, cookies de publicidade ou formulários enviados a servidor.

## Prévia

Abra `index.html` para inspecionar o conteúdo. Para testar o PWA, sirva esta pasta por `localhost` ou HTTPS. Exemplo: `python -m http.server 8000`. Visite `http://localhost:8000`.

## Estrutura

- `index.html`: conteúdo, serviços, TR Lab, portfólio de projetos reais, comparador, terminal e orçamento em etapas.
- `styles.css`, `advanced.css`, `reference.css`, `compare.css`, `portfolio-projetos.css`, `finish.css`, `lab.css`, `studio.css`: identidade neon, experiências interativas e composição responsiva.
- `script.js`, `advanced.js`, `lab.js`: navegação, showroom, WhatsApp e instalação.
- `lab-experience.html`, `lab-experience.css`, `lab-experience.js`, `lab-data.js`, `lab-fixtures.js`: demonstrações conceituais isoladas, com dados fictícios e carregamento sob demanda na prévia.
- `studio.js`, `studio-data.js`, `studio-colors.js`, `studio-preview.html`, `studio-preview.js`, `studio-preview.css`: simulador local com dez segmentos, quatro estilos e prévia isolada em iframe.
- `manifest.webmanifest`, `sw.js`, `offline.html`: recursos PWA.
- `privacidade.html`: política de privacidade.
- `assets/`: identidade original fornecida e derivação transparente do monograma para o hero e ícone maskable do PWA.
- `assets/hero-scene-v2.webp`: cenário tecnológico do hero; o TR exibido por cima usa o monograma original fornecido.
- `assets/about-showroom-v2.webp`: cenário tecnológico da seção Sobre. O TR original, os hologramas, os anéis e os textos são camadas HTML/CSS sobre essa imagem.
- `404.html`: resposta visual para endereços inexistentes.
- `vercel.json`: configuração do projeto estático e cabeçalhos de segurança.
- `.vercelignore`: exclui da publicação documentação, testes e imagens PNG substituídas por WebP sem perdas. Os PNGs permanecem no projeto como fontes.

## Experiências implementadas

- TidiReis Studio: upload local de logo PNG/JPG/WebP (até 5 MB), extração de cores no navegador, nome e paleta editáveis, dez segmentos e quatro composições visuais. A prévia permite navegar, trocar dispositivo/estilo, ampliar e testar ações ilustrativas. A mensagem comercial usa o WhatsApp já configurado no site. Nenhuma imagem do visitante é enviada ou salva em servidor.
- TidiReis Experience Lab com 13 demonstrações: seis websites de identidades distintas, três painéis administrativos, Design Studio, delivery, transporte e apresentação interativa da marca oficial. Há prévia em larguras reais de desktop, tablet e celular, rolagem interna, reinício e tela cheia. Cada exemplo usa dados fictícios e interações locais; nenhum pedido, pagamento, atendimento, corrida ou agendamento é real. A instalação do próprio site fica no rodapé quando o navegador oferece essa opção.
- `assets/lab-architecture.webp`, `assets/lab-chair.webp` e `assets/lab-repair.webp`: imagens geradas para os exemplos conceituais do TR Lab. As demonstrações são carregadas sob demanda na página, e seus arquivos essenciais ficam disponíveis no cache do PWA após a instalação do service worker.
- Portfólio de 12 projetos publicados, com capturas reais em desktop e celular, filtros por categoria e detalhes na própria página. O TR Lab permanece identificado como demonstração conceitual.
- As 20 fotos demonstrativas do Studio ficam em `assets/studio/` como WebP locais. São fotos do Unsplash, com uso comercial permitido pela [licença Unsplash](https://unsplash.com/license); os IDs de origem estão em `scripts/fetch_studio_images.py`. O simulador não depende do Unsplash em tempo de execução.
- Seis cards de serviço com painel de detalhes e atalho de orçamento específico.
- Comparador antes/depois com arraste, toque e teclado; navegação rápida com Ctrl/Cmd+K; TR System com seis comandos predefinidos.
- Orçamento em quatro etapas, com serviço, recursos, descrição e revisão antes de abrir o WhatsApp. O formulário não envia dados a um servidor.
- Modos Cinematic e Performance. A preferência por movimento reduzido ou economia de dados seleciona inicialmente o modo Performance. A opção pode ser alterada pelo visitante.
- A segunda direção visual aproxima o hero da referência fornecida: cenário tecnológico dedicado, TR original em destaque, serviços compactos e TR Lab na primeira sequência de rolagem. Veja `AUDITORIA.md` para resultados reais e pendências de publicação.
- A seção Sobre apresenta o TR original em um showroom azul, quatro áreas de atuação flutuantes, card de empresa e compromisso, CTA de WhatsApp e faixa de diferenciais sem métricas inventadas.
- As seções finais usam três etapas de projeto, orçamento guiado com destino real no WhatsApp, FAQ nativo, CTA com acesso ao orçamento e rodapé com contatos verificados no projeto.

## Dados comerciais do ZIP fornecido

- Razão social: Tiago Silva dos Reis LTDA
- CNPJ: 69.340.664/0001-04
- WhatsApp: (71) 99241-7737

O CNPJ passou na verificação matemática dos dígitos verificadores. Isso não equivale a consultar o cadastro oficial. Confirme esses dados com o titular antes de publicar.

## Manutenção do TidiReis Studio

- Adicione ou altere segmentos, títulos, textos e opções em `studio-data.js`, e crie a composição correspondente no registro `renderers` em `studio-preview.js`.
- Ajuste os quatro estilos em `studio-preview.css`. A prévia usa iframe para impedir que o CSS dos modelos altere o site institucional.
- Troque fotos em `assets/studio/`, mantendo os nomes `{segmento}-1.webp` e `{segmento}-2.webp`, ou atualize a função `photo` em `studio-preview.js`. Use apenas imagens com licença adequada.
- As cores automáticas e as regras de contraste ficam em `studio-colors.js`; os seletores manuais estão em `studio.js`.
- O botão comercial lê o número do link `data-wa="proposta"` já configurado no site. Ao atualizar o contato oficial, atualize esse link. As ações dentro dos modelos são ilustrativas e não fazem pedidos reais.

## Publicação

Na Vercel, selecione **Other**, use esta pasta como raiz, deixe o comando de build vazio e sirva a pasta raiz (`.`). Não há instalação de pacotes, arquivo de lock ou variáveis de ambiente necessárias. O Node.js é usado apenas para as verificações locais. A configuração está em `vercel.json`; não há reescrita genérica de rotas.

Para atualizar as capturas, instale as dependências de desenvolvimento com `npm install` e execute `npm run capturar-portfolio`. O script usa Chrome por meio do Playwright e Sharp, e grava os resultados em `public/portfolio/relatorio.json`. Revise visualmente cada nova captura antes de publicar.

Execute `python verify_site.py` (requer Pillow no ambiente de teste), `node verify_sw.js`, `node verify_terminal.js`, `node scripts/verify_lab.mjs`, `node scripts/verify_studio.mjs` e `node scripts/verify_portfolio.mjs` (os três últimos requerem Chrome local), além de `node --check` nos arquivos JavaScript ativos antes de publicar.

O domínio publicado é `https://trdigital.vercel.app/`. Canonical, Open Graph, robots e sitemap apontam para esse endereço. O service worker mantém apenas recursos estáticos públicos e as páginas conhecidas no cache. A instalação continua dependente do suporte do navegador; no iOS, o site mostra instruções de Adicionar à Tela de Início.

Lighthouse e Core Web Vitals exigem medição em navegador e rede reais; não devem ser presumidos a partir dos testes estáticos.

A Vercel serve esta pasta como projeto estático, sem build ou dependências de produção.
