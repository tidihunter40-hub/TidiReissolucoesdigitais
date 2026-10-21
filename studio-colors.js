/* Local palette analysis. Transparent pixels are ignored; a uniform opaque
   corner colour is downweighted as background, but can remain secondary. */
(() => {
  'use strict';
  const FALLBACK=Object.freeze({primary:'#343c46',secondary:'#f5f1e9',accent:'#687585'});
  const hex=channels=>'#'+channels.map(n=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0')).join('');
  const rgb=value=>(String(value).match(/[a-f\d]{2}/gi)||[]).slice(0,3).map(n=>parseInt(n,16));
  const luminance=value=>{const c=rgb(value).map(v=>{const n=v/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});return .2126*c[0]+.7152*c[1]+.0722*c[2];};
  const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
  const onColor=background=>contrast(background,'#ffffff')>=4.5?'#ffffff':'#111111';
  const onLight=color=>{const original=rgb(color);for(let scale=1;scale>=0;scale-=.025){const candidate=hex(original.map(v=>v*scale));if(contrast(candidate,'#ffffff')>=4.5)return candidate;}return '#111111';};
  const mix=(a,b,weight=.5)=>hex(rgb(a).map((v,i)=>v*(1-weight)+rgb(b)[i]*weight));
  const signature=bytes=>{
    if(bytes.length>=8&&bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71)return 'image/png';
    if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
    if(bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return 'image/webp';
    return null;
  };
  const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
  function extract(rgba,width=64,height=64){
    const pixels=[],corners=[];
    for(let i=0;i<rgba.length;i+=4){
      if(rgba[i+3]<96)continue;
      const color=[rgba[i],rgba[i+1],rgba[i+2]];
      pixels.push(color);
      const n=i/4,x=n%width,y=Math.floor(n/width);
      if((x<5||x>=width-5)&&(y<5||y>=height-5))corners.push(color);
    }
    if(!pixels.length)return {...FALLBACK};
    const background=corners.length>12?corners.reduce((a,p)=>a.map((v,i)=>v+p[i]),[0,0,0]).map(v=>v/corners.length):null;
    const stableBackground=background&&corners.filter(p=>distance(p,background)<40).length/corners.length>.75?background:null;
    const buckets=new Map();
    for(const p of pixels){
      const id=p.map(v=>Math.min(10,Math.floor(v/24))).join('-');
      const bucket=buckets.get(id)||{count:0,sum:[0,0,0]};
      bucket.count++;p.forEach((v,i)=>bucket.sum[i]+=v);buckets.set(id,bucket);
    }
    const ranked=[...buckets.values()].map(b=>{const c=b.sum.map(v=>v/b.count),range=Math.max(...c)-Math.min(...c),isBackground=stableBackground&&distance(c,stableBackground)<42;return {count:b.count,c,score:b.count*(1+range/110)*(isBackground?.16:1)};}).sort((a,b)=>b.score-a.score);
    const primary=ranked[0]?.c;
    if(!primary)return {...FALLBACK};
    const second=ranked.filter(b=>distance(primary,b.c)>75).sort((a,b)=>b.count-a.count)[0];
    const main=hex(primary),secondary=second?hex(second.c):luminance(main)>.45?'#242424':'#f5f2ea';
    const accent=mix(main,luminance(main)>.35?'#181818':'#ffffff',.24);
    return {primary:main,secondary,accent};
  }
  window.TR_STUDIO_COLORS={FALLBACK,signature,extract,contrast,onColor,onLight,mix,luminance};
})();
