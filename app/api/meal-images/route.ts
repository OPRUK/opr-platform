import {reserveMealImages,cookingGrid} from '../../../lib/meal-image-limit';
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
  const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||request.headers.get('x-real-ip')||'unknown';
  const client=createHmac('sha256',process.env.SUPABASE_SECRET_KEY!).update('meal-images:'+ip).digest('hex');
  const allowance=await reserveMealImages(db,process.env.SUPABASE_SECRET_KEY!,client);
  if(!allowance)return Response.json({error:'The illustration allowance is currently full. Try later; your written recipe is ready. Limit: 2 requests per hour and 5 per day per connection, and 20 per day across OPR.'},{status:429,headers:{...noStore,'Retry-After':'3600'}});
  let completed=false;let providerStarted=false;
  try{
  const grid=cookingGrid(idea.method),{rows,columns}=grid,panels=rows*columns;
  const prompt=`Create one photorealistic cooking storyboard for a home cook. Exactly ${columns} columns and ${rows} rows of equally sized square photographs, edge-to-edge with no gaps, no lettering, no captions, no borders. Read left-to-right then top-to-bottom. Same warm home kitchen, ceramic dishes, deep green and cream details, consistent ingredients. Meal: ${idea.name}. Diet: ${v.diet}. Ingredients ONLY: ${idea.ingredients.join('; ')}. Use no additional food, garnish, sauces or seasonings not in that list. ${grid.steps.map((step,i)=>`Panel ${i+1}: illustrate this cooking instruction: ${step}`).join(' ')} ${panels>grid.steps.length?`Panel ${panels}: the finished meal, ready to serve.`:''} Show realistic safe kitchen practices. Do not depict unsafe cross-contamination. Show raw meat only during preparation, fully cooked food in later stages. Do not imply food is cooked through based on colour alone. No text, no logos, no watermarks.`;
  providerStarted=true;
  const response=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-image-2',prompt,n:1,size:grid.size,quality:'low',output_format:'jpeg',output_compression:75}),signal:AbortSignal.timeout(160000)});
  if(!response.ok){console.error('Meal image provider response',response.status);return Response.json({error:'We could not create the cooking images just now. Your written steps are ready; please try again later.'},{status:502,headers:noStore})}
  const result=await response.json();const image=result.data?.[0]?.b64_json;
  if(typeof image!=='string'||image.length>3800000)throw Error('Invalid image response');
  completed=true;
  return Response.json({image:'data:image/jpeg;base64,'+image,rows,columns,steps:grid.steps},{headers:noStore});
  }finally{if(!completed){if(providerStarted)await allowance.releasePersonal();else await allowance.releaseAll()}}
 }catch{console.error('Meal image generation unavailable');return Response.json({error:'Cooking images are unavailable just now. Your written steps are still ready.'},{status:503,headers:noStore})}
}
