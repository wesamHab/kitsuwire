"use client";

import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";

export function NewsletterSignup(){
 const[message,setMessage]=useState("");
 const submit=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();setMessage("The KitsuWire newsletter is launching soon. No email was stored.")};
 return <div><form className="reference-newsletter-form" onSubmit={submit}><input type="email" placeholder="you@example.com" aria-label="Email address" required/><button type="submit">Subscribe <ArrowRight size={15}/></button></form>{message?<p className="newsletter-status" role="status">{message}</p>:null}</div>;
}
