export default async(request)=>{
 const headers={'content-type':'application/json','cache-control':'no-store'};
 const key=process.env.SERPAPI_KEY;
 if(!key)return new Response(JSON.stringify({offers:[],info:'Live-Preisvergleich nicht eingerichtet: SERPAPI_KEY fehlt.'}),{headers});
 const q=new URL(request.url).searchParams.get('q')?.slice(0,160);
 if(!q)return new Response(JSON.stringify({error:'Suchbegriff fehlt'}),{status:400,headers});
 try{const url=new URL('https://serpapi.com/search.json');url.search=new URLSearchParams({engine:'google_shopping',q,gl:'de',hl:'de',api_key:key,num:'15'}).toString();const r=await fetch(url);const j=await r.json();if(!r.ok||j.error)throw Error(j.error||'Shopping-Dienst nicht erreichbar');const offers=(j.shopping_results||[]).slice(0,15).map(x=>({title:x.title,price:x.price,amount:x.extracted_price,merchant:x.source,thumbnail:x.thumbnail,url:x.product_link||x.link||null,delivery:x.delivery||null}));return new Response(JSON.stringify({offers,info:offers.length?'Live-Suchergebnisse eines Drittanbieters; Preise und Verfügbarkeit beim Shop prüfen.':'Keine Angebote gefunden.'}),{headers});}catch(e){return new Response(JSON.stringify({offers:[],info:'Live-Suche fehlgeschlagen: '+e.message}),{headers})}
};
export const config={path:'/api/shopping'};
