const respond=(statusCode,data)=>({statusCode,headers:{"Content-Type":"application/json","Cache-Control":"no-store"},body:JSON.stringify(data)});
const patterns={
 dive:[/\bno[- ]frills\b/i,/\bdive bar\b/i,/\brough around the edges\b/i,/\bproper local\b/i,/\bunpretentious\b/i,/\bdown[- ]to[- ]earth\b/i,/\bold school\b/i,/\bcheap (?:pints?|beer|drinks?)\b/i,/\bworking[- ]class pub\b/i,/\bspit and sawdust\b/i],
 realale:[/\breal ale\b/i,/\bcask (?:ale|beer|conditioned)\b/i,/\bhand[- ]pulled\b/i,/\bhandpump\b/i,/\bhand pump\b/i,/\bguest ales?\b/i,/\bcask marque\b/i,/\bCAMRA\b/i],
 craft:[/\bcraft beer\b/i,/\bcraft ales?\b/i,/\bmicrobrew(?:ery|eries)\b/i,/\bIPA(?:s)?\b/i,/\bNEIPA\b/i,/\bcraft on tap\b/i,/\bcraft taps?\b/i,/\bbrewdog\b/i,/\bpale ales?\b/i],
 quiet:[/\bquiet\b/i,/\bpeaceful\b/i,/\brelaxing\b/i,/\bcosy\b/i,/\bcozy\b/i,/\bnot too loud\b/i,/\bconversation\b/i,/\btraditional pub\b/i,/\bcalm atmosphere\b/i,/\bno loud music\b/i]
};
function tag(reviews){
 const tags={},evidence={};
 for(const [kind,regexes] of Object.entries(patterns)){
  const matches=[];
  for(const review of reviews){
   const body=review.text?.text||'';
   const found=regexes.find(r=>r.test(body));
   if(found)matches.push({excerpt:body.slice(0,180),term:body.match(found)?.[0]||'',rating:review.rating||null});
  }
  tags[kind]=matches.length>0;
  if(matches.length)evidence[kind]={source:"Google reviews (keyword match)",count:matches.length,examples:matches.slice(0,2)};
 }
 return {tags,evidence};
}
exports.handler=async event=>{
 if(event.httpMethod!=='POST')return respond(405,{error:"POST required"});
 const key=process.env.GOOGLE_PLACES_API_KEY;
 if(!key)return respond(503,{error:"Google Places API key not configured"});
 let ids;
 try{ids=JSON.parse(event.body||'{}').ids}catch{return respond(400,{error:"Invalid JSON"})}
 if(!Array.isArray(ids)||ids.length>20||ids.some(id=>typeof id!=='string'||!/^ChI[A-Za-z0-9_-]{5,100}$/.test(id)))return respond(400,{error:"Invalid place IDs"});
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10500);
 try{
  const entries=await Promise.all(ids.map(async id=>{
   try{
    const r=await fetch("https://places.googleapis.com/v1/places/"+encodeURIComponent(id)+"?languageCode=en",{
     headers:{"X-Goog-Api-Key":key,"X-Goog-FieldMask":"id,reviews.text,reviews.rating"},
     signal:controller.signal
    });
    if(!r.ok)return [id,{tags:{},evidence:{},error:"Details unavailable"}];
    const data=await r.json();
    return [id,{...tag(data.reviews||[]),reviewSampleSize:(data.reviews||[]).length}];
   }catch{return [id,{tags:{},evidence:{},error:"Review request timed out"}]}
  }));
  return respond(200,{results:Object.fromEntries(entries),note:"Classification uses only the small sample of reviews returned by Google, not all reviews. Tags are indicative."});
 }finally{clearTimeout(timer)}
};
