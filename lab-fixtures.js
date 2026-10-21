window.TR_LAB_FIXTURES = Object.freeze({
  products:[
    {id:'chair',name:'Poltrona Aurora',category:'Assentos',price:1290,image:'assets/lab-chair.webp'},
    {id:'table',name:'Mesa lateral Nova',category:'Mesas',price:690,image:'assets/nova-side-table.webp'},
    {id:'lamp',name:'Luminária Cerâmica',category:'Iluminação',price:420,image:'assets/nova-ceramic-lamp.webp'}
  ],
  properties:[
    {id:'casa',name:'Casa Horizonte',type:'Casa',city:'Centro',price:780000,detail:'3 quartos · 2 vagas · 180 m²',image:'assets/compare-building.webp'},
    {id:'apto',name:'Residencial Vista',type:'Apartamento',city:'Jardins',price:520000,detail:'2 quartos · 1 vaga · 92 m²',image:'assets/lab-architecture.webp'},
    {id:'studio',name:'Studio Parque',type:'Apartamento',city:'Centro',price:290000,detail:'1 quarto · 48 m²',image:'assets/compare-building.webp'}
  ],
  transactions:[
    {name:'Consultoria digital',type:'income',value:4200},
    {name:'Assinatura de software',type:'expense',value:390},
    {name:'Projeto de interface',type:'income',value:2800},
    {name:'Equipamentos',type:'expense',value:1250}
  ],
  orders:[
    {id:'2048',client:'Marina A.',value:490,status:'Novo'},
    {id:'2049',client:'Ricardo B.',value:890,status:'Em separação'},
    {id:'2050',client:'Ana C.',value:320,status:'Enviado'}
  ],
  records:[
    {id:'AT-42',name:'Marina Costa',subject:'Proposta de website',status:'Em andamento',area:'Comercial'},
    {id:'AT-43',name:'Pedro Lima',subject:'Ajuste de interface',status:'Aguardando',area:'Design'},
    {id:'AT-44',name:'Ana Ribeiro',subject:'Revisão de aplicativo',status:'Concluído',area:'Tecnologia'}
  ],
  menu:[
    {id:'burger',name:'Burger da Casa',price:32,emoji:'🍔'},
    {id:'fries',name:'Batata Crocante',price:18,emoji:'🍟'},
    {id:'drink',name:'Suco Natural',price:12,emoji:'🥤'}
  ]
});
