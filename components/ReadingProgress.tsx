"use client";

import { useEffect, useState } from "react";

export function ReadingProgress(){
 const[progress,setProgress]=useState(0);
 useEffect(()=>{
  const update=()=>{const root=document.documentElement;const max=root.scrollHeight-root.clientHeight;setProgress(max>0?Math.min(100,Math.max(0,(root.scrollTop/max)*100)):0)};
  update();window.addEventListener("scroll",update,{passive:true});window.addEventListener("resize",update);return()=>{window.removeEventListener("scroll",update);window.removeEventListener("resize",update)};
 },[]);
 return <div className="reading-progress" aria-hidden="true"><span style={{width:`${progress}%`}}/></div>;
}
