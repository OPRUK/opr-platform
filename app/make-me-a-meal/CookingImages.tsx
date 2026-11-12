'use client';
import {useEffect,useRef,useState} from 'react';
import type {MealDiet} from '../../lib/meal-maker';
type RequestData={items:string[];serves:number;diet:MealDiet;cuisine:'everyday'|'indian'};
export default function CookingImages({request}:{request:RequestData}){
 const [image,setImage]=useState<{image:string;rows:number;steps:string[]}|null>(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(true),[retry,setRetry]=useState(0);const serial=JSON.stringify(request);const completed=useRef('');
 useEffect(()=>{let live=true;if(completed.current===serial&&!retry)return;setImage(null);setBusy(true);setMessage('Creating cooking illustrations for your meal…');const controller=new AbortController();
 void fetch('/api/meal-images',{method:'POST',headers:{'Content-Type':'application/json'},body:serial,signal:controller.signal}).then(async r=>{const j=await r.json();if(!r.ok)throw Error(j.error||'Images are unavailable.');if(live){completed.current=serial;setImage(j);setMessage('')}}).catch(e=>{if(live&&e.name!=='AbortError')setMessage(e.message||'Images are unavailable. Your written steps are below.')}).finally(()=>{if(live)setBusy(false)});
 return()=>{live=false;controller.abort()};
 },[serial,retry]);
 return <section className="meal-cooking-images" aria-label="Cooking illustrations" aria-busy={busy}><h3>Cook it, step by step</h3>{message&&<p role="status">{message}</p>}{busy&&<div className="meal-image-placeholder">Your written recipe is ready below. Images can take a minute or two.</div>}{image&&<><p>Illustrations of the cooking stages. Follow the written method and temperature checks; an image cannot confirm food is safely cooked.</p><div className="meal-stage-grid">{image.steps.map((step,i)=><figure key={i}><div role="img" aria-label={'Cooking illustration for step '+(i+1)} style={{backgroundImage:`url("${image.image}")`,backgroundSize:`200% ${image.rows*100}%`,backgroundPosition:`${i%2*100}% ${image.rows<=1?0:Math.floor(i/2)/(image.rows-1)*100}%`}}/><figcaption><strong>Step {i+1}</strong><p>{step}</p></figcaption></figure>)}</div></>}{!busy&&!image&&<button type="button" onClick={()=>setRetry(n=>n+1)}>Try images again</button>}</section>
}
