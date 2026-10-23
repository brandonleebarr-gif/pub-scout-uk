const json=(code,obj)=>({statusCode:code,headers:{"Content-Type":"application/json","Cache-Control":"no-store"},body:JSON.stringify(obj)});
async function getGoogle(lat,lon,radius,key){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),12000);
 try{
  const response=await fetch("https://places.googleapis.com/v1/places:searchNearby",{
   method:"POST",signal:controller.signal,
   headers:{"Content-Type":"application/json","X-Goog-Api-Key":key,"X-Goog-FieldMask":"places.id,places.displayName,places.location,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.websiteUri,places.primaryType"},
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
  const places=await getGoogle(lat,lon,miles*1609.344,key);
  const priceMap={PRICE_LEVEL_FREE:0,PRICE_LEVEL_INEXPENSIVE:1,PRICE_LEVEL_MODERATE:2,PRICE_LEVEL_EXPENSIVE:3,PRICE_LEVEL_VERY_EXPENSIVE:4};
  const pubs=places.filter(p=>p.location).map(p=>({
   id:p.id,name:p.displayName?.text||"Unnamed venue",
   lat:p.location.latitude,lon:p.location.longitude,address:p.formattedAddress||"",
   rating:p.rating||null,reviews:p.userRatingCount||0,
   price:priceMap[p.priceLevel]??null,website:p.websiteUri||null,tags:{}
  }));
  return json(200,{pubs,warning:pubs.length===20?"Google returned the nearest 20 places. Narrow the radius or change your location to explore more.":"Google lists bars as well as pubs; some results may not be traditional pubs."});
 }catch(e){return json(502,{error:e.name==="AbortError"?"Google Places took too long to respond. Try again.":e.message})}
};
