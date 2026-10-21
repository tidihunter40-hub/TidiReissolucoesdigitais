# TidiReis Soluções Digitais

Site institucional estático em HTML, CSS e JavaScript. Sem banco de dados, dependências externas, cookies de publicidade ou formulários enviados a servidor.

## Prévia

Abra `index.html` para inspecionar o conteúdo. Para testar o PWA, sirva esta pasta por `localhost` ou HTTPS. Exemplo: `python -m http.server 8000`. Visite `http://localhost:8000`.

## Estrutura

- `index.html`: conteúdo, serviços, TR Lab, projetos conceituais, comparador, terminal e orçamento em etapas.
- `styles.css`, `advanced.css`, `reference.css`: identidade neon, experiências interativas e composição alinhada à referência visual.
- `script.js`, `advanced.js`: navegação, experiências interativas, WhatsApp e instalação.
- `manifest.webmanifest`, `sw.js`, `offline.html`: recursos PWA.
- `privacidade.html`: política de privacidade.
- `assets/`: identidade original fornecida e derivação transparente do monograma para o hero e ícone maskable do PWA.
- `assets/hero-scene-v2.webp`: cenário tecnológico do hero; o TR exibido por cima usa o monograma original fornecido.
- `assets/about-showroom-v2.webp`: cenário tecnológico da seção Sobre. O TR original, os hologramas, os anéis e os textos são camadas HTML/CSS sobre essa imagem.
- `404.html`: resposta visual para endereços inexistentes.
- `vercel.json`: configuração do projeto estático e cabeçalhos de segurança.
- `.vercelignore`: exclui da publicação documentação, testes e imagens PNG substituídas por WebP sem perdas. Os PNGs permanecem no projeto como fontes.

## Experiências implementadas

- TR Lab com cinco demonstrações: quatro mini-sites responsivos (arquitetura, lançamento, loja e assistência), dashboard com períodos, design studio, simulação de PWA e monograma em CSS 3D. Os mini-sites são conceitos fictícios; a loja simula uma sacola local e os demais abrem detalhes demonstrativos. O PWA demonstrativo não instala um aplicativo real; a instalação do próprio site fica no rodapé quando o navegador oferece essa opção.
- `assets/lab-architecture.webp`, `assets/lab-chair.webp` e `assets/lab-repair.webp`: imagens geradas para os exemplos conceituais do TR Lab. São carregadas sob demanda e não entram no pré-cache essencial do PWA.
- Vitrine de seis conceitos navegáveis, incluindo identidade visual. Os dados de dashboard e projetos são fictícios e identificados como demonstração.
- Seis cards de serviço com painel de detalhes e atalho de orçamento específico.
- Comparador antes/depois com arraste, toque e teclado; navegação rápida com Ctrl/Cmd+K; TR System com seis comandos predefinidos.
- Orçamento em quatro etapas, com serviço, recursos, descrição e revisão antes de abrir o WhatsApp. O formulário não envia dados a um servidor.
- Modos Cinematic e Performance. A preferência por movimento reduzido ou economia de dados seleciona inicialmente o modo Performance. A opção pode ser alterada pelo visitante.
- A segunda direção visual aproxima o hero da referência fornecida: cenário tecnológico dedicado, TR original em destaque, serviços compactos e TR Lab na primeira sequência de rolagem. Veja `AUDITORIA.md` para resultados reais e pendências de publicação.
- A seção Sobre apresenta o TR original em um showroom azul, quatro áreas de atuação flutuantes, card de empresa e compromisso, CTA de WhatsApp e faixa de diferenciais sem métricas inventadas.

## Dados comerciais do ZIP fornecido

- Razão social: Tiago Silva dos Reis LTDA
- CNPJ: 69.340.664/0001-04
- WhatsApp: (71) 99241-7737

O CNPJ passou na verificação matemática dos dígitos verificadores. Isso não equivale a consultar o cadastro oficial. Confirme esses dados com o titular antes de publicar.

## Preparação para publicação

Na Vercel, selecione **Other**, use esta pasta como raiz, deixe o comando de build vazio e sirva a pasta raiz (`.`). Não há instalação de pacotes, arquivo de lock ou variáveis de ambiente necessárias. O Node.js é usado apenas para as verificações locais. A configuração está em `vercel.json`; não há reescrita genérica de rotas.

Execute `python verify_site.py` (requer Pillow no ambiente de teste), `node verify_showcase.js`, `node verify_sw.js` e `node --check` nos quatro arquivos JavaScript antes de publicar. Consulte `AUDITORIA.md` para o resultado desta preparação.

1. Confirme os dados comerciais e informe o domínio definitivo.
2. Com o domínio real, configure URL canônica, `og:url`, URL absoluta de `og:image` e `sitemap.xml`. Esses endereços não foram inventados.
3. Teste em navegador real nas larguras de 1920, 1440, 768, 390 e 360 px, inclusive TR Lab, vitrine, instalação, atualização e modo offline.
4. Meça Lighthouse e Core Web Vitals em uma prévia HTTPS.
5. Revise a política de privacidade após configurar a hospedagem e qualquer ferramenta de analytics.

A Vercel pode servir esta pasta como projeto estático. Nenhuma publicação foi feita.
