import {createHmac,timingSafeEqual} from 'node:crypto';
import {designReviewEmail,type ReviewKind} from '../../../../lib/email-design-review';
import {mediaIntroductionPreview} from '../../../../lib/media-introduction-preview';
import {createUnsubscribeLink} from '../../../../lib/unsubscribe';
export const runtime='nodejs';
export const maxDuration=120;
const recipient='chaten@otherpeoplesrecipes.co.uk';
const kinds:ReviewKind[]=['november-2026','opc-newsletter','welcome','recipe','opc-welcome','opc-recipe'];
export async function POST(request:Request){
 const raw=await request.text();const media=raw==='{"preview":"media-introduction-20261114"}';const stamp=request.headers.get('x-opr-timestamp')||'';const signature=request.headers.get('x-opr-signature')||'';const secret=process.env.SUPABASE_SECRET_KEY;
 if((!media&&raw!=='{"preview":"christmas-logos-20261114"}')||!secret||!/^\d{13}$/.test(stamp)||Math.abs(Date.now()-Number(stamp))>300000||!/^[a-f0-9]{64}$/.test(signature))return Response.json({error:'Unauthorized'},{status:401});
 const expected=createHmac('sha256',secret).update(`opr-approved-preview-v1\n${stamp}\n${raw}`).digest();
 if(!timingSafeEqual(expected,Buffer.from(signature,'hex')))return Response.json({error:'Unauthorized'},{status:401});
 const configured=process.env.EMAIL_FROM||'';const address=configured.match(/<([^>]+)>/)?.[1]||configured;const key=process.env.RESEND_API_KEY;const link=createUnsubscribeLink(recipient);
 if(!key||!address.includes('@')||!link)return Response.json({error:'Email preview configuration unavailable.'},{status:503});
 const accepted:{kind:string;providerId:string}[]=[];
 for(const kind of (media?['media-introduction']:kinds)){
  const content=media?mediaIntroductionPreview:designReviewEmail(kind as ReviewKind,{name:'Chaten',title:kind==='opc-recipe'?'Your favourite cocktail':'Your family favourite',unsubscribeUrl:link});
  if((!media&&!content.html.includes('logo" width="96"'))||/Chaten Oberoi|[\u2190-\u21ff]/.test(content.html))return Response.json({error:'Design verification failed.'},{status:500});
  const result=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`design-preview-brand-sender-20261114-${kind}`},body:JSON.stringify({from:`${kind.startsWith('opc-')?'Other Peoples Cocktails':'Other Peoples Recipes'} <${address}>`,to:[recipient],subject:(media?'[MEDIA INTRODUCTION FOR APPROVAL] ':'[UPDATED DESIGN FOR APPROVAL] ')+content.subject,html:content.html}),signal:AbortSignal.timeout(20000)});
  const data=await result.json() as {id?:string};if(!result.ok||!data.id)return Response.json({error:`Preview service did not confirm ${kind}.`,accepted},{status:502});
  accepted.push({kind,providerId:data.id});await new Promise(resolve=>setTimeout(resolve,600));
 }
 return Response.json({accepted,subscriberSend:false});
}
