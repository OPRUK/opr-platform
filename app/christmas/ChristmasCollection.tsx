'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ChristmasMenu, ChristmasCourse } from '../../lib/christmas-recipes';
import styles from './christmas.module.css';
type Card = { slug:string; title:string; image:string; prepTime?:string; cookTime?:string; serves?:string; christmasMenus:ChristmasMenu[]; christmasCourse:ChristmasCourse };
const menus: {id:ChristmasMenu;label:string}[] = [{id:'general',label:'The Christmas table'},{id:'vegetarian',label:'Vegetarian'},{id:'vegan',label:'Vegan'}];
const courses: ChristmasCourse[] = ['Starters','Mains','Sides','Desserts'];
function minutes(value?:string) { return Number(value?.match(/^PT(\d+)M$/)?.[1] ?? 0); }
export default function ChristmasCollection({recipes}:{recipes:Card[]}) {
 const [menu,setMenu]=useState<ChristmasMenu>('general');
 const [course,setCourse]=useState<ChristmasCourse|'All'>('All');
 const [search,setSearch]=useState('');
 const available=recipes.filter(r=>r.christmasMenus.includes(menu));
 const visible=available.filter(r=>(course==='All'||r.christmasCourse===course)&&r.title.toLowerCase().includes(search.trim().toLowerCase()));
 return <section id="recipes" className={styles.collection} aria-labelledby="choose-menu">
  <div className={styles.sectionHeading}><p className={styles.kicker}>A place for everyone</p><h2 id="choose-menu">Build your Christmas menu.</h2><p>Every menu has 10 starters, 10 mains, 20 sides and 10 desserts. Choose the dishes that suit your table; each opens a full recipe with its own visual guide.</p></div>
  <fieldset className={styles.menuPicker}><legend className={styles.srOnly}>Choose a Christmas menu</legend>{menus.map(m=><button key={m.id} type="button" aria-pressed={menu===m.id} onClick={()=>setMenu(m.id)}>{m.label}</button>)}</fieldset>
  <div className={styles.tools}><fieldset className={styles.coursePicker}><legend>Browse by course</legend>{(['All',...courses] as const).map(c=><button type="button" key={c} aria-pressed={course===c} onClick={()=>setCourse(c)}>{c} <span>{c==='All'?available.length:available.filter(r=>r.christmasCourse===c).length}</span></button>)}</fieldset><label className={styles.search}>Find a dish<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Try potatoes or chocolate" /></label></div>
  <p role="status" className={styles.result}>{visible.length} {visible.length===1?'recipe':'recipes'} in {menus.find(m=>m.id===menu)?.label.toLowerCase()}{search?` matching “${search}”`:''}.</p>
  {courses.filter(c=>course==='All'||c===course).map(c=>{const items=visible.filter(r=>r.christmasCourse===c);return items.length?<section className={styles.courseSection} key={c} aria-labelledby={`course-${c}`}><div className={styles.courseHeading}><h3 id={`course-${c}`}>{c}</h3><span>{items.length} choices</span></div><div className={styles.grid}>{items.map(r=><article key={r.slug}><Link href={`/family-cookbook/${r.slug}`}><Image src={r.image} alt={`${r.title}, AI-generated serving illustration`} width={1024} height={512} sizes="(max-width:640px) calc(100vw - 40px), (max-width:1000px) 46vw, 350px" /><div><p className={styles.cardMeta}>Serves {r.serves} · {minutes(r.prepTime)+minutes(r.cookTime)} min prep &amp; cooking</p><h4>{r.title}</h4><p className={styles.readRecipe}>View the full recipe</p></div></Link></article>)}</div></section>:null;})}
  {!visible.length&&<p className={styles.empty}>No dishes match that search in this menu. Try a different word or choose another menu.</p>}
  <p className={styles.collectionNote}>110 distinct OPR recipes across three menus. Suitable dishes appear in more than one menu. Vegetarian and vegan labels describe the ingredients; always check packaging and individual dietary or allergy needs.</p>
 </section>;
}
