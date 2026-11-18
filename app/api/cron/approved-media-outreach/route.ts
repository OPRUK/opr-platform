import {createHmac,timingSafeEqual} from 'node:crypto';
import {getSupabaseAdmin} from '../../../../lib/supabase/admin';
import messages from '../../../../lib/approved-media-outreach.json';

export const runtime='nodejs';
export const maxDuration=120;
const campaign='approved-media-outreach-initial';
const headers={'Cache-Control':'private, no-store'};
type ProviderEmail={id:string;to:string[];subject:string;created_at:string;last_event?:string};

// This endpoint accepts only the immutable, approved copies and recipients.
// Daisy is excluded because her initial pitch is already in Apple Mail Sent.
// Tom is excluded pending fresh verification of his older published address.
export async function POST(request:Request){
 const raw=await request.text();
 const stamp=request.headers.get('x-opr-timestamp')||'';
 const sig=request.headers.get('x-opr-signature')||'';
 const secret=process.env.SUPABASE_SECRET_KEY;
 if(raw.length>500||!secret||!/^\d{13}$/.test(stamp)||Math.abs(Date.now()-Number(stamp))>300000||!/^[a-f0-9]{64}$/.test(sig))return Response.json({error:'Unauthorized'},{status:401,headers});
 const expected=createHmac('sha256',secret).update(`opr-approved-media-v1\n${stamp}\n${raw}`).digest();
 if(!timingSafeEqual(expected,Buffer.from(sig,'hex')))return Response.json({error:'Unauthorized'},{status:401,headers});
 let body:{mode?:string;to?:string};try{body=JSON.parse(raw)}catch{return Response.json({error:'Invalid JSON'},{status:400,headers})}
 if(!['inspect','send'].includes(body.mode||''))return Response.json({error:'Unknown operation'},{status:400,headers});
 const db=getSupabaseAdmin(),key=process.env.RESEND_API_KEY;
 if(!db||!key)return Response.json({error:'Existing mail service unavailable'},{status:503,headers});
 const {data:ledger,error}=await db.from('newsletter_deliveries').select('email,status,sent_at,error_message').like('newsletter_id','approved-media-outreach%');
 if(error)return Response.json({error:'Delivery ledger unavailable'},{status:503,headers});
 const prior:ProviderEmail[]=[];let after='';let complete=false;
 for(let page=0;page<20;page++){
  const r=await fetch('https://api.resend.com/emails'+(after?'?after='+encodeURIComponent(after):''),{headers:{Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(15000)});
  if(!r.ok)return Response.json({error:'Provider history could not be checked; nothing sent',providerStatus:r.status},{status:502,headers});
  const j=await r.json() as {data?:ProviderEmail[];has_more?:boolean};
  if(!Array.isArray(j.data))return Response.json({error:'Provider history is incomplete; nothing sent'},{status:502,headers});
  prior.push(...j.data);
  if(!j.has_more||!j.data.length||Date.parse(j.data[j.data.length-1].created_at)<Date.parse('2026-11-13T00:00:00Z')){complete=true;break}
  after=j.data[j.data.length-1].id;
  await new Promise(resolve=>setTimeout(resolve,600));
 }
 if(!complete)return Response.json({error:'Prior history requires further reconciliation; nothing sent'},{status:409,headers});
 const contacted=(to:string)=>prior.find(x=>x.to?.some(a=>a.toLowerCase()===to)&&messages.some(m=>m.subject===x.subject));
 if(body.mode==='inspect')return Response.json({campaign,alreadyContacted:['This Morning'],recipients:messages.map(m=>({to:m.to,team:m.team,ledger:(ledger||[]).filter(x=>x.email===m.to),provider:contacted(m.to)||null})),providerHistoryChecked:prior.length},{headers});
 if(Date.now()<Date.parse('2026-11-18T10:00:00Z')||Date.now()>Date.parse('2026-11-20T10:00:00Z'))return Response.json({error:'Outside approved send window'},{status:409,headers});
 const message=messages.find(m=>m.to===body.to);
 if(!message)return Response.json({error:'Recipient is not approved'},{status:400,headers});
 const existing=(ledger||[]).find(x=>x.email===message.to);
 if(existing||contacted(message.to))return Response.json({skipped:true,reason:'Prior delivery or unresolved attempt exists; not resent',prior:existing||contacted(message.to)},{headers});
 if(!message.html.includes('/images/email/opr-logo-badge.png')||!message.html.includes('/images/opc-email-logo.png')||!message.html.includes('Arial')||message.html.includes('APPROVAL COPY'))return Response.json({error:'Approved design verification failed'},{status:500,headers});
 // Unique insert wins once; concurrent callers and retries cannot create another send.
 const {error:lockError}=await db.from('newsletter_deliveries').insert({newsletter_id:campaign,email:message.to,name:message.recipient_name,status:'sending',attempts:1});
 if(lockError)return Response.json({error:'Attempt already exists or could not be recorded; not sent'},{status:409,headers});
 try{
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':message.idempotency_key},body:JSON.stringify({from:'Chaten <chaten@otherpeoplesrecipes.co.uk>',reply_to:'chaten@otherpeoplesrecipes.co.uk',to:[message.to],subject:message.subject,html:message.html,text:message.text}),signal:AbortSignal.timeout(20000)});
  const result=await r.json() as {id?:string;message?:string};
  if(!r.ok||!result.id){await db.from('newsletter_deliveries').update({status:'failed',provider_status:r.status,error_message:'Provider did not confirm acceptance; reconcile before any retry',updated_at:new Date().toISOString()}).eq('newsletter_id',campaign).eq('email',message.to);return Response.json({to:message.to,error:'Provider did not confirm acceptance',providerStatus:r.status},{status:502,headers})}
  const at=new Date().toISOString();
  const {error:recordError}=await db.from('newsletter_deliveries').update({status:'sent',provider_status:r.status,sent_at:at,error_message:'Provider ID: '+result.id,updated_at:at}).eq('newsletter_id',campaign).eq('email',message.to);
  return Response.json({to:message.to,team:message.team,providerId:result.id,acceptedAt:at,ledgerRecorded:!recordError},{headers});
 }catch{return Response.json({to:message.to,error:'Provider response uncertain; attempt locked against repeat sends'},{status:502,headers})}
}
