import {createHmac} from 'node:crypto';
import {getSupabaseAdmin} from '../../../lib/supabase/admin';
import {makeMeal,mealStock,type MealDiet} from '../../../lib/meal-maker';
export const runtime='nodejs';
export const maxDuration=180;
const noStore={'Cache-Control':'private, no-store'};
const allowed=new Set(mealStock.map(([name])=>name));
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Please use the meal maker on this website.'},{status:403});
 let b:unknown;try{const raw=await request.text();if(raw.length>4096)throw Error();b=JSON.parse(raw)}catch{return Response.json({error:'Invalid meal request.'},{status:400})}
 const v=b as {items?:unknown;serves?:unknown;diet?:unknown;cuisine?:unknown};
 if(!v||!Array.isArray(v.items)||v.items.length>60||!v.items.every(x=>typeof x==='string'&&allowed.has(x as never))||!Number.isInteger(v.serves)||Number(v.serves)<1||Number(v.serves)>12||!['non-vegetarian','vegetarian','vegan'].includes(String(v.diet))||!['everyday','indian'].includes(String(v.cuisine)))return Response.json({error:'Choose valid ingredients, servings and preferences.'},{status:400});
 const idea=makeMeal([...new Set(v.items)] as string[],Number(v.serves),v.diet as MealDiet,v.cuisine as 'everyday'|'indian');
 if(!idea)return Response.json({error:'Add enough ingredients to make a meal first.'},{status:400});
 const key=process.env.OPENAI_API_KEY,db=getSupabaseAdmin();
 if(!key||!db)return Response.json({error:'Cooking images are unavailable just now. Your written recipe is ready to use.'},{status:503,headers:noStore});
 try{
  // Daily image budget is reserved atomically through existing service-only PKs.
  // Negative IDs cannot collide with ordinary positive identity-generated rows.
  const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||request.headers.get('x-real-ip')||'unknown';
  const client=createHmac('sha256',process.env.SUPABASE_SECRET_KEY!).update('meal-images:'+ip).digest('hex');
  const now=Date.now();const recent=await db.from('api_rate_limits').select('created_at').eq('route','meal-images-client').eq('client_key',client).gte('created_at',new Date(now-86400000).toISOString());
  if(recent.error)throw Error('Rate service unavailable');
  if(recent.data.length>=5||recent.data.filter(x=>Date.parse(x.created_at)>now-3600000).length>=2)return Response.json({error:'You have reached the cooking-image limit for now. Your written steps are still available.'},{status:429,headers:noStore});
  let reserved=false;const day=Math.floor(now/86400000);
  for(let slot=0;slot<20;slot++){const reservation=await db.from('api_rate_limits').insert({id:-9000000000-day*32-slot,route:'meal-images-budget',client_key:'global'});if(!reservation.error){reserved=true;break}if(reservation.error.code!=='23505')throw Error('Budget service unavailable')}
  if(!reserved)return Response.json({error:'Today’s cooking-image limit has been reached. Your written steps are still available.'},{status:429,headers:noStore});
  const record=await db.from('api_rate_limits').insert({route:'meal-images-client',client_key:client});if(record.error)throw Error('Rate service unavailable');
  const rows=Math.ceil(idea.method.length/2),panels=rows*2;
  const prompt=`Create one photorealistic cooking storyboard for a home cook. Exactly 2 columns and ${rows} rows of equally sized square photographs, edge-to-edge with no gaps, no lettering, no captions, no borders. Read left-to-right then top-to-bottom. Same warm home kitchen, ceramic dishes, deep green and cream details, consistent ingredients. Meal: ${idea.name}. Diet: ${v.diet}. Ingredients ONLY: ${idea.ingredients.join('; ')}. Use no additional food, garnish, sauces or seasonings not in that list. ${idea.method.map((step,i)=>`Panel ${i+1}: illustrate this cooking instruction: ${step}`).join(' ')} ${panels>idea.method.length?`Panel ${panels}: the finished meal, ready to serve.`:''} Show realistic safe kitchen practices. Do not depict unsafe cross-contamination. Show raw meat only during preparation, fully cooked food in later stages. Do not imply food is cooked through based on colour alone. No text, no logos, no watermarks.`;
  const response=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-image-2',prompt,n:1,size:rows<=2?'1024x1024':rows===3?'1024x1536':'1024x2048',quality:'low',output_format:'jpeg',output_compression:75}),signal:AbortSignal.timeout(160000)});
  if(!response.ok){console.error('Meal image provider response',response.status);return Response.json({error:'We could not create the cooking images just now. Your written steps are ready; please try again later.'},{status:502,headers:noStore})}
  const result=await response.json();const image=result.data?.[0]?.b64_json;
  if(typeof image!=='string'||image.length>3800000)throw Error('Invalid image response');
  return Response.json({image:'data:image/jpeg;base64,'+image,rows,steps:idea.method},{headers:noStore});
 }catch{console.error('Meal image generation unavailable');return Response.json({error:'Cooking images are unavailable just now. Your written steps are still ready.'},{status:503,headers:noStore})}
}
