export default async (request) => {
 const headers={'content-type':'application/json','cache-control':'no-store'};
 if(request.method!=='POST')return new Response(JSON.stringify({error:'POST erforderlich'}),{status:405,headers});
 const key=process.env.OPENAI_API_KEY;
 if(!key)return new Response(JSON.stringify({error:'KI nicht eingerichtet: OPENAI_API_KEY fehlt. Die normale Shop-Suche funktioniert weiterhin.'}),{status:503,headers});
 try{
 const {image,mime}=await request.json();
 if(!image||image.length>9000000||!/^image\/(jpeg|png|webp)$/.test(mime))return new Response(JSON.stringify({error:'Bitte JPG/PNG/WebP bis etwa 5 MB verwenden.'}),{status:400,headers});
 const prompt='Analysiere das Produktfoto für eine deutsche Shopping-App. Gib ausschließlich ein JSON-Objekt zurück mit keys: name (kurze präzise deutsche Produktbezeichnung), category (Kategorie), brand (nur wenn tatsächlich erkennbar, sonst leer), model (nur wenn erkennbar, sonst leer), features (Array mit bis zu 5 sichtbaren Merkmalen), search_query (präziser Suchbegriff), cheaper_query (Suchbegriff für ähnliche günstigere Alternativen), accessories (Array mit 3 sinnvollen Zubehör-Suchbegriffen), confidence (hoch/mittel/niedrig), note (kurze Unsicherheitshinweise). Erfinde keine Marke oder Modellnummer.';
 const r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_VISION_MODEL||'gpt-4o-mini',temperature:0.2,response_format:{type:'json_object'},messages:[{role:'system',content:prompt},{role:'user',content:[{type:'text',text:'Identifiziere dieses Produkt.'},{type:'image_url',image_url:{url:`data:${mime};base64,${image}`,detail:'high'}}]}],max_tokens:650})});
 const j=await r.json();if(!r.ok)throw Error(j.error?.message||'KI-Anfrage fehlgeschlagen');return new Response(j.choices[0].message.content,{headers});
 }catch(e){return new Response(JSON.stringify({error:String(e.message||e)}),{status:502,headers})}
};
export const config={path:'/api/analyze'};
