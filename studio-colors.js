/* Browser-native upload validation and palette extraction; no file is transmitted. */
(() => {
  const FALLBACK = Object.freeze({primary:'#173a63',accent:'#1ba8d8'});
  const hex = ([r,g,b]) => '#'+[r,g,b].map(x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')).join('');
  const rgb = value => (value.match(/[a-f\d]{2}/gi)||[]).slice(0,3).map(x=>parseInt(x,16));
  const luminance = value => {
    const channels = rgb(value).map(v=>{const n=v/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});
    return .2126*channels[0]+.7152*channels[1]+.0722*channels[2];
  };
  const contrast = (a,b) => {const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
  const onColor = background => contrast(background,'#ffffff')>=4.5?'#ffffff':'#06111b';
  const onLight = color => {
    const original=rgb(color);
    for(let scale=1;scale>=0;scale-=.05){const candidate=hex(original.map(v=>v*scale));if(contrast(candidate,'#ffffff')>=4.5)return candidate;}
    return '#06111b';
  };
  const signature = bytes => {
    if(bytes.length>=8&&bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71)return 'image/png';
    if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
    if(bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return 'image/webp';
    return null;
  };
  function extract(rgba){
    const buckets=new Map();let sampled=0;
    for(let i=0;i<rgba.length;i+=16){
      const r=rgba[i],g=rgba[i+1],b=rgba[i+2],a=rgba[i+3];
      if(a<96)continue;
      const max=Math.max(r,g,b),min=Math.min(r,g,b),saturation=max-min;
      if(max<24||min>238||saturation<17)continue;
      const key=[r,g,b].map(v=>Math.round(v/32));
      const id=key.join('-');const bucket=buckets.get(id)||{count:0,sum:[0,0,0],saturation:0};
      bucket.count++;bucket.sum[0]+=r;bucket.sum[1]+=g;bucket.sum[2]+=b;bucket.saturation+=saturation;buckets.set(id,bucket);sampled++;
    }
    if(!sampled)return {...FALLBACK};
    const ranked=[...buckets.values()].sort((a,b)=>(b.count*(1+b.saturation/b.count/110))-(a.count*(1+a.saturation/a.count/110)));
    const color=b=>hex(b.sum.map(v=>v/b.count));
    const primary=color(ranked[0]);
    const secondary=ranked.find(b=>{const c=color(b),a=rgb(primary),v=rgb(c);return Math.hypot(...a.map((n,i)=>n-v[i]))>90;});
    return {primary,accent:secondary?color(secondary):FALLBACK.accent};
  }
  window.TR_STUDIO_COLORS={FALLBACK,signature,extract,contrast,onColor,onLight};
})();
