import {createHmac,timingSafeEqual,createHash} from 'node:crypto';
import {getSupabaseAdmin} from '../../../../lib/supabase/admin';
import {createUnsubscribeLink} from '../../../../lib/unsubscribe';
import {designReviewEmail} from '../../../../lib/email-design-review';
export const runtime='nodejs';
export const maxDuration=300;
const campaigns={
 'approved-welcome-rollout-20261114':{kind:'welcome',notBefore:'2026-11-14T08:00:00Z'},
 'approved-newsletter-20261114':{kind:'november-2026',notBefore:'2026-11-14T09:00:00Z'},
} as const;
type Campaign=keyof typeof campaigns;
type Subscriber={name:string|null;email:string;marketing_opt_in:boolean;marketing_unsubscribed_at:string|null;status?:string};
export async function POST(request:Request){
 const raw=await request.text();if(raw.length>1000)return Response.json({error:'Invalid request.'},{status:400});
 const stamp=request.headers.get('x-opr-timestamp')||'';const sig=request.headers.get('x-opr-signature')||'';const key=process.env.SUPABASE_SECRET_KEY;
 if(!key||!/^\d{13}$/.test(stamp)||Math.abs(Date.now()-Number(stamp))>300000||!/^[a-f0-9]{64}$/.test(sig))return Response.json({error:'Unauthorized'},{status:401});
 const expected=createHmac('sha256',key).update(`opr-approved-campaign-v1\n${stamp}\n${raw}`).digest();
 if(!timingSafeEqual(expected,Buffer.from(sig,'hex')))return Response.json({error:'Unauthorized'},{status:401});
 let body:{campaign?:string;mode?:string};try{body=JSON.parse(raw)}catch{return Response.json({error:'Invalid JSON.'},{status:400})}
 if(!Object.hasOwn(campaigns,body.campaign||'')||!['status','send'].includes(body.mode||''))return Response.json({error:'Unknown approved campaign.'},{status:400});
 const id=body.campaign as Campaign;const config=campaigns[id];
 if(body.mode==='send'&&Date.now()<Date.parse(config.notBefore))return Response.json({error:'Scheduled time has not arrived.'},{status:409});
 const db=getSupabaseAdmin();if(!db)return Response.json({error:'Subscriber database is unavailable.'},{status:503});
 const lists=await Promise.all([
  db.from('founding_table_members').select('name,email,marketing_opt_in,marketing_unsubscribed_at,status'),
  db.from('recipe_submissions').select('name,email,marketing_opt_in,marketing_unsubscribed_at'),
  db.from('cookalong_signups').select('name,email,marketing_opt_in,marketing_unsubscribed_at'),
 ]);
 if(lists.some(x=>x.error))return Response.json({error:'Consent status could not be checked.'},{status:502});
 const rows=lists.flatMap(x=>x.data??[]) as Subscriber[];
 const blocked=new Set(rows.filter(x=>x.marketing_unsubscribed_at||x.status==='unsubscribed').map(x=>x.email.trim().toLowerCase()));
 const audience=new Map<string,{name:string;email:string}>();
 for(const r of rows){const email=r.email.trim().toLowerCase();if(r.marketing_opt_in&&!blocked.has(email)&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)&&!audience.has(email))audience.set(email,{name:r.name?.trim()||'there',email});}
 const {data:ledger,error:ledgerError}=await db.from('newsletter_deliveries').select('email,status,updated_at,created_at').eq('newsletter_id',id);
 if(ledgerError)return Response.json({error:'Campaign delivery ledger is unavailable.'},{status:502});
 const sentSet=new Set((ledger??[]).filter(x=>x.status==='sent').map(x=>x.email));
 const pending=[...audience.values()].filter(x=>!sentSet.has(x.email));
 const summary={campaign:id,recipients:audience.size,alreadySent:audience.size-pending.length,pending:pending.length};
 if(body.mode==='status')return Response.json(summary,{headers:{'Cache-Control':'no-store'}});
 const resend=process.env.RESEND_API_KEY;const configuredFrom=process.env.EMAIL_FROM||'';const senderAddress=configuredFrom.match(/<([^>]+)>/)?.[1]||configuredFrom;
 if(!resend||!senderAddress.includes('@')||!process.env.UNSUBSCRIBE_SECRET)return Response.json({error:'Mail configuration is incomplete.'},{status:503});
 const accepted:{recipientHash:string;providerId:string}[]=[];const failures:{recipientHash:string;reason:string}[]=[];
 for(const person of pending.slice(0,10)){
  const hash=createHash('sha256').update(person.email).digest('hex');const prior=(ledger??[]).find(x=>x.email===person.email);
  // Resend keys expire after 24 hours. An unresolved old attempt needs reconciliation, never a blind resend.
  if(prior&&prior.status==='sending'&&Date.now()-Date.parse(prior.created_at)>23*3600000){failures.push({recipientHash:hash,reason:'Old uncertain send requires reconciliation.'});continue;}
  const link=createUnsubscribeLink(person.email);if(!link){failures.push({recipientHash:hash,reason:'Unsubscribe signing unavailable.'});continue;}
  const content=designReviewEmail(config.kind,{name:person.name,unsubscribeUrl:link});
  if(/Chaten Oberoi|Chaten.*Morris|[\u2190-\u21ff]|&rarr;/.test(content.html))return Response.json({error:'Approved design validation failed.'},{status:500});
  const {error:trackError}=await db.from('newsletter_deliveries').upsert({newsletter_id:id,email:person.email,name:person.name,status:'sending',attempts:1,updated_at:new Date().toISOString()},{onConflict:'newsletter_id,email'});
  if(trackError){failures.push({recipientHash:hash,reason:'Could not record attempt; not sent.'});continue;}
  try{
   const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${resend}`,'Content-Type':'application/json','Idempotency-Key':`${id}-${hash}`},body:JSON.stringify({from:`Chaten <${senderAddress}>`,to:[person.email],...content,headers:{'List-Unsubscribe':`<${link}>`}}),signal:AbortSignal.timeout(20000)});
   const result=await response.json() as {id?:string;message?:string};
   if(!response.ok||!result.id){failures.push({recipientHash:hash,reason:`Provider did not confirm acceptance (${response.status}).`});continue;}
   const {error:recordError}=await db.from('newsletter_deliveries').update({status:'sent',provider_status:response.status,sent_at:new Date().toISOString(),updated_at:new Date().toISOString(),error_code:null,error_message:null}).eq('newsletter_id',id).eq('email',person.email);
   accepted.push({recipientHash:hash,providerId:result.id});if(recordError)failures.push({recipientHash:hash,reason:'Provider accepted; ledger update failed. Retry only with same campaign key.'});
  }catch{failures.push({recipientHash:hash,reason:'Provider response uncertain; retry only with the same campaign key.'});}
  await new Promise(resolve=>setTimeout(resolve,600));
 }
 return Response.json({...summary,accepted,failures},{headers:{'Cache-Control':'no-store'}});
}
