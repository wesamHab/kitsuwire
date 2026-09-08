type Props={className?:string};

export function KitsuMascot({className=""}:Props){return <svg className={className} viewBox="0 0 520 420" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs><linearGradient id="fur" x1="120" y1="80" x2="390" y2="360" gradientUnits="userSpaceOnUse"><stop stopColor="#fff"/><stop offset="1" stopColor="#e9e9e2"/></linearGradient><linearGradient id="lime" x1="300" y1="60" x2="420" y2="300" gradientUnits="userSpaceOnUse"><stop stopColor="#d9ff72"/><stop offset="1" stopColor="#9ee524"/></linearGradient><filter id="shadow" x="70" y="42" width="390" height="350"><feDropShadow dx="0" dy="18" stdDeviation="18" floodOpacity=".13"/></filter></defs>
<g filter="url(#shadow)" stroke="#0b0d0f" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
<path d="M174 129L146 65L215 105C234 92 257 87 281 91L326 52L322 125C354 147 374 184 369 221C364 263 335 296 292 307C248 319 197 301 174 261C149 219 151 165 174 129Z" fill="url(#fur)"/>
<path d="M151 69L183 123L165 130L151 69Z" fill="url(#lime)"/>
<path d="M324 56L293 105L319 123L324 56Z" fill="url(#lime)"/>
<path d="M225 187C236 174 253 167 269 171"/>
<path d="M313 170C324 168 337 172 345 181"/>
<path d="M272 226L286 237L300 226"/>
<path d="M286 238C286 254 273 264 258 265"/>
<path d="M286 238C286 254 299 264 314 265"/>
<path d="M199 286C166 307 139 335 129 371C176 354 220 354 257 372C297 391 351 390 397 365C370 352 346 339 330 319" fill="url(#fur)"/>
<path d="M333 318C373 292 415 298 444 326C427 329 412 337 401 352C422 351 438 357 450 369C401 396 348 393 305 372" fill="url(#lime)"/>
<path d="M209 302C188 321 177 344 176 365"/>
</g>
<circle cx="241" cy="196" r="8" fill="#0b0d0f"/><circle cx="328" cy="196" r="8" fill="#0b0d0f"/>
<path d="M208 151C227 140 250 137 269 145" stroke="#b8ef39" strokeWidth="8" strokeLinecap="round"/>
<path d="M318 143C336 145 350 153 361 166" stroke="#b8ef39" strokeWidth="8" strokeLinecap="round"/>
</svg>}
