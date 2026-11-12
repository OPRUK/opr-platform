import {createHmac} from 'node:crypto';
import type {SupabaseClient} from '@supabase/supabase-js';
const namespace='meal-images-quota-v2';
// Use the existing service-only table and unique PKs to reserve slots atomically.
// HMAC-derived 48-bit IDs stay within JavaScript's exact integer range.
export async function reserveMealImages(db:SupabaseClient,secret:string,client:string,now=Date.now()){
 const day=Math.floor(now/86400000),hour=Math.floor(now/3600000),ids:number[]=[];
 const remove=async(list:number[])=>{if(list.length){const r=await db.from('api_rate_limits').delete().in('id',list).eq('route',namespace);if(r.error)throw Error('Could not release image allowance')}};
 async function reserve(key:string,count:number){for(let slot=0;slot<count;slot++){const id=key.startsWith('global-day:')?-9000000000-day*32-slot:-1000000000000-Number.parseInt(createHmac('sha256',secret).update(namespace+':'+key+':'+slot).digest('hex').slice(0,12),16);const r=await db.from('api_rate_limits').insert({id,route:namespace,client_key:key});if(!r.error){ids.push(id);return id}if(r.error.code!=='23505')throw Error('Image allowance unavailable')}return null}
 try{
  if(!await reserve('client-day:'+day+':'+client,5)||!await reserve('client-hour:'+hour+':'+client,2)){await remove(ids);return null}
  const personal=ids.slice();const global=await reserve('global-day:'+day,20);if(!global){await remove(ids);return null}
  return {releasePersonal:()=>remove(personal),releaseAll:()=>remove(ids)};
 }catch(e){await remove(ids);throw e}
}
export function cookingGrid(steps:string[]){
 // Stay inside provider resolution/aspect limits even for detailed recipes.
 const group=Math.max(1,Math.ceil(steps.length/18));const panels:string[]=[];for(let i=0;i<steps.length;i+=group)panels.push(steps.slice(i,i+group).join(' '));
 const columns=panels.length<=4?2:3,rows=Math.ceil(panels.length/columns);const cell=rows===1&&columns===2?768:512;const width=columns*cell,height=Math.max(cell,rows*cell);
 return {steps:panels,columns,rows,size:width+'x'+height};
}
