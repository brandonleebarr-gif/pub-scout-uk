const json=(code,obj)=>({statusCode:code,headers:{"Content-Type":"application/json","Cache-Control":"no-store"},body:JSON.stringify(obj)});
async function getGoogle(lat,lon,radius,key){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),8500);
 try{
  const response=await fetch("https://places.googleapis.com/v1/places:searchNearby",{
   method:"POST",signal:controller.signal,
   headers:{"Content-Type":"application/json","X-Goog-Api-Key":key,"X-Goog-FieldMask":"places.id,places.displayName,places.location,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.websiteUri,places.primaryType,places.goodForWatchingSports,places.outdoorSeating,places.servesLunch,places.servesDinner,places.priceRange"},
   body:JSON.stringify({includedTypes:["bar"],maxResultCount:20,rankPreference:"DISTANCE",
    locationRestriction:{circle:{center:{latitude:lat,longitude:lon},radius:Math.min(radius,50000)}}})
  });
  const data=await response.json();
  if(!response.ok)throw Error(data.error?.message||"Google Places HTTP "+response.status);
  return data.places||[];
 }finally{clearTimeout(timer)}
}
exports.handler=async event=>{
 try{
  const q=event.queryStringParameters||{};
  if(q.lat==null||q.lon==null)return json(400,{error:"Coordinates missing"});
  const lat=Number(q.lat),lon=Number(q.lon),miles=Number(q.radius||1);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180||![.25,.5,1,5,10].includes(miles))return json(400,{error:"Invalid coordinates or radius"});
  const key=process.env.GOOGLE_PLACES_API_KEY;
  if(!key)return json(503,{error:"Google Places is not connected yet. Add GOOGLE_PLACES_API_KEY to Netlify environment variables and redeploy."});
  const radius=miles*1609.344;
  // Nearby Search (New) is limited to 20 results per call. For larger areas,
  // query overlapping smaller circles and de-duplicate Google Place IDs.
  // Tile the selected search circle to avoid repeatedly receiving the same
  // nearest 20 pubs. A tile can still contain more than 20 venues, so these
  // are sampled results, not a complete census of all pubs.
  const toDegreesLat=meters=>meters/111320;
  const cos=Math.max(.15,Math.cos(lat*Math.PI/180));
  const centers=[];
  if(miles<=.5){centers.push([lat,lon,radius]);}
  else {
    // 5x5 for 5/10 miles; 3x3 for 1 mile. Centers cover the full disk.
    const count=miles>=5?5:3;
    const spacing=radius*2/(count-1)*.5;
    const tileRadius=spacing*.76;
    const half=(count-1)/2;
    for(let row=-half;row<=half;row++)for(let col=-half;col<=half;col++){
      const north=row*spacing,east=col*spacing;
      if(Math.hypot(north,east)>radius+tileRadius)continue;
      centers.push([lat+toDegreesLat(north),lon+toDegreesLat(east)/cos,tileRadius]);
    }
  }
  const responses=await Promise.allSettled(centers.map(c=>getGoogle(c[0],c[1],c[2],key)));
  const ok=responses.filter(r=>r.status==='fulfilled');
  if(!ok.length)throw Error(responses[0].reason?.message||'Google Places unavailable');
  const seen=new Map();
  for(const result of ok)for(const place of result.value){if(place.id&&!seen.has(place.id))seen.set(place.id,place)}
  const distance=(p)=>{const toRad=Math.PI/180,a=(p.location.latitude-lat)*toRad,b=(p.location.longitude-lon)*toRad;
    const h=Math.sin(a/2)**2+Math.cos(lat*toRad)*Math.cos(p.location.latitude*toRad)*Math.sin(b/2)**2;
    return 12742000*Math.asin(Math.sqrt(h));};
  const sort=q.sort==='rating'?'rating':'distance';
  const places=[...seen.values()].filter(p=>p.location&&distance(p)<=radius).sort((a,b)=>sort==='rating'
    ? (b.rating||0)-(a.rating||0)||(b.userRatingCount||0)-(a.userRatingCount||0)||distance(a)-distance(b)
    : distance(a)-distance(b));
  const matchingCount=places.length;
  const selected=places.slice(0,20);
  const priceMap={PRICE_LEVEL_FREE:0,PRICE_LEVEL_INEXPENSIVE:1,PRICE_LEVEL_MODERATE:2,PRICE_LEVEL_EXPENSIVE:3,PRICE_LEVEL_VERY_EXPENSIVE:4};
  const pubs=selected.map(p=>({
   id:p.id,name:p.displayName?.text||"Unnamed venue",
   lat:p.location.latitude,lon:p.location.longitude,address:p.formattedAddress||"",
   rating:p.rating||null,reviews:p.userRatingCount||0,
   price:priceMap[p.priceLevel]??null,website:p.websiteUri||null,tags:{sports:p.goodForWatchingSports===true,food:p.servesLunch===true||p.servesDinner===true,garden:p.outdoorSeating===true,cheap:p.priceLevel==="PRICE_LEVEL_INEXPENSIVE"},evidence:{sports:p.goodForWatchingSports===true?"Google: good for watching sports":null,food:p.servesLunch===true||p.servesDinner===true?"Google: serves meals":null,garden:p.outdoorSeating===true?"Google: outdoor seating (not necessarily a garden)":null,cheap:p.priceLevel==="PRICE_LEVEL_INEXPENSIVE"?"Google: inexpensive price category":null}
  }));
  return json(200,{pubs,warning:`Searched ${ok.length} of ${centers.length} areas; found ${matchingCount} distinct nearby venues and displayed the top ${pubs.length} by ${sort==='rating'?'rating':'distance'}. ${ok.length<centers.length?"Some areas could not be checked. ":""}Results may include bars; even tiled searches cannot guarantee an exhaustive highest-rated ranking. CAMRA and sports listings are linked for independent verification.`});
 }catch(e){return json(502,{error:e.name==="AbortError"?"Google Places took too long to respond. Try again.":e.message})}
};
