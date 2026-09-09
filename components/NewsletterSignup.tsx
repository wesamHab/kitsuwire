"use client";

import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";

export function NewsletterSignup(){
 const[message,setMessage]=useState("");
 const[busy,setBusy]=useState(false);
 const submit=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  if(busy)return;
  const form=event.currentTarget;
  const data=new FormData(form);
  const email=String(data.get("email")??"");
  setBusy(true);setMessage("");
  try{
   const response=await fetch("/api/newsletter/subscribe",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email,source:"homepage"})});
   const payload=await response.json() as {ok?:boolean;message?:string};
   setMessage(payload.message??(response.ok?"Subscription request received.":"Something went wrong."));
   if(response.ok)form.reset();
  }catch{setMessage("Could not submit right now. Please try again.");}
  finally{setBusy(false);}
 };
 return <div><form className="reference-newsletter-form" onSubmit={submit}><input name="email" type="email" placeholder="you@example.com" aria-label="Email address" autoComplete="email" required/><button type="submit" disabled={busy}>{busy?"Sending…":"Subscribe"} <ArrowRight size={15}/></button></form><p className="newsletter-consent">By subscribing, you request the KitsuWire newsletter. You can unsubscribe at any time.</p>{message?<p className="newsletter-status" role="status">{message}</p>:null}</div>;
}
