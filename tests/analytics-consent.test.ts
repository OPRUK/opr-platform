import test from "node:test";
import assert from "node:assert/strict";
import { CONSENT_MAX_AGE, GA_ID, gaCookieNames, readChoice, startGoogleAnalytics, stopGoogleAnalytics } from "../lib/analytics-consent.ts";

test("consent requires a valid explicit, current choice", () => {
  const now = 20000000000;
  for (const raw of [null, "broken", "true", JSON.stringify({choice:"accepted"}), JSON.stringify({version:1,choice:"accepted",savedAt:now+1}),JSON.stringify({version:1,choice:"accepted",savedAt:now-CONSENT_MAX_AGE})]) assert.equal(readChoice(raw,now),null);
  for (const choice of ["accepted","rejected"]) assert.equal(readChoice(JSON.stringify({version:1,choice,savedAt:now-100}),now),choice);
});

test("accepted analytics initializes the correct property once, with advertising denied", () => {
  const appended: unknown[] = [];
  const win = {location:{hostname:"otherpeoplesrecipes.co.uk"}} as unknown as Window;
  const doc = {getElementById:()=>appended[0],createElement:()=>({}),head:{appendChild:(script:unknown)=>appended.push(script)}} as unknown as Document;
  startGoogleAnalytics(win,doc);startGoogleAnalytics(win,doc);
  assert.equal(appended.length,1);
  assert.match((appended[0] as {src:string}).src,new RegExp(GA_ID));
  const commands=(win as unknown as {dataLayer:IArguments[]}).dataLayer.map(args=>Array.from(args));
  assert.deepEqual(commands[0],['consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'}]);
  const config=commands.find(c=>c[0]==='config')!;
  assert.equal(config[1],GA_ID);assert.equal((config[2] as {allow_google_signals:boolean}).allow_google_signals,false);
});

test("withdrawal disables sending and expires Google cookies without deleting unrelated cookies", () => {
  const writes:string[]=[];
  const win={location:{hostname:'www.otherpeoplesrecipes.co.uk'}} as unknown as Window;
  const doc={get cookie(){return '_ga=one; _ga_KRYXGNPZES=two; session=keep';},set cookie(value:string){writes.push(value);}} as Document;
  stopGoogleAnalytics(win,doc);
  assert.equal((win as unknown as Record<string,boolean>)[`ga-disable-${GA_ID}`],true);
  assert.ok(writes.some(s=>s.includes('domain=otherpeoplesrecipes.co.uk')));
  assert.ok(writes.every(s=>s.includes('Max-Age=0') && !s.startsWith('session=')));
  assert.deepEqual(gaCookieNames(doc.cookie),['_ga','_ga_KRYXGNPZES']);
});
