'use client';
import {useRef,useState} from 'react';
import {mealStock} from '../../lib/meal-maker';
const favourites=['chicken','fish','eggs','potato','pasta','rice','tinned chickpeas','tomato','spinach','onion','garlic','olive oil'];
const choices=[...favourites,...mealStock.map(([name])=>name).filter(name=>!favourites.includes(name))];
export default function IngredientPicker({selected,onChange}:{selected:string[];onChange:(items:string[])=>void}){
 const [offset,setOffset]=useState(0),[message,setMessage]=useState('');
 const grid=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null);
 const available=choices.filter(name=>!selected.includes(name));
 const start=available.length?offset%available.length:0;
 const visible=[...available.slice(start),...available.slice(0,start)].slice(0,12);
 function add(name:string,index:number){onChange([...selected,name]);setMessage(name+' added. '+(available.length-1)+' ingredients left to choose from.');requestAnimationFrame(()=>{const buttons=grid.current?.querySelectorAll<HTMLButtonElement>('button');if(buttons?.length)buttons[Math.min(index,buttons.length-1)].focus();else heading.current?.focus()})}
 function remove(name:string){onChange(selected.filter(item=>item!==name));setMessage(name+' removed.');heading.current?.focus()}
 return <section className="ingredient-picker" aria-labelledby="ingredient-picker-heading"><h2 id="ingredient-picker-heading" tabIndex={-1} ref={heading}>What have you got?</h2><p>Tap everything you have. New choices appear as you pick. Include oils and seasonings you want to use.</p><div className="ingredient-selected"><h3>Your ingredients ({selected.length})</h3>{selected.length?<><ul>{selected.map(name=><li key={name}><button type="button" aria-label={'Remove '+name} onClick={()=>remove(name)}>{name}<span aria-hidden="true"> ×</span></button></li>)}</ul><button type="button" className="ingredient-clear" onClick={()=>{onChange([]);setOffset(0);setMessage('Ingredient selection cleared.');heading.current?.focus()}}>Clear selection</button></>:<p>Nothing selected yet.</p>}</div><h3>Choose from these</h3><div className="meal-maker-chips" ref={grid}>{visible.map((name,index)=><button type="button" key={index} aria-label={'Add '+name} onClick={()=>add(name,index)}>{name}</button>)}</div>{!available.length?<p>You’ve chosen every listed ingredient. You can add anything else below.</p>:<p>{available.length} more to choose from.{available.length>12?' Keep picking or browse more choices.':''}</p>}{available.length>12&&<button type="button" className="ingredient-more" onClick={()=>{setOffset((start+12)%available.length);setMessage('Showing more ingredients.')}}>Show other ingredients</button>}<p role="status" className="sr-only">{message}</p></section>
}
