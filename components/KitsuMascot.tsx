type Props={className?:string};

export function KitsuMascot({className=""}:Props){return <svg className={className} viewBox="0 0 640 520" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>
  <linearGradient id="kitsuFur" x1="180" y1="70" x2="430" y2="440" gradientUnits="userSpaceOnUse"><stop stopColor="#ffffff"/><stop offset="1" stopColor="#ecece7"/></linearGradient>
  <linearGradient id="kitsuLime" x1="330" y1="75" x2="510" y2="360" gradientUnits="userSpaceOnUse"><stop stopColor="#dfff79"/><stop offset="1" stopColor="#8edc20"/></linearGradient>
  <filter id="kitsuShadow" x="60" y="20" width="540" height="490" filterUnits="userSpaceOnUse"><feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="#071015" floodOpacity=".18"/></filter>
</defs>
<g filter="url(#kitsuShadow)" stroke="#0a0d0f" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
  <path d="M224 147L193 56L270 118C291 103 318 96 348 99L412 48L402 145C432 169 450 205 448 244C446 281 426 314 394 334C379 343 363 350 345 353C313 358 278 350 251 329C221 306 202 269 202 228C202 196 209 168 224 147Z" fill="url(#kitsuFur)"/>
  <path d="M198 66L231 141L211 151L198 66Z" fill="url(#kitsuLime)"/>
  <path d="M407 58L365 119L398 145L407 58Z" fill="url(#kitsuLime)"/>
  <path d="M188 214C166 206 150 209 136 219C151 222 164 229 173 241C158 243 145 249 135 260C159 269 184 266 203 252" fill="url(#kitsuFur)"/>
  <path d="M240 207C257 186 281 177 304 180"/>
  <path d="M352 180C370 179 388 188 400 203"/>
  <path d="M282 238C295 247 309 247 322 238"/>
  <path d="M298 255C306 263 317 267 330 267"/>
  <path d="M299 255C291 263 280 267 267 267"/>
  <path d="M287 351C256 365 232 390 221 423C256 415 287 417 313 429C337 440 365 443 392 438C374 419 363 396 360 369" fill="url(#kitsuFur)"/>
  <path d="M352 351C389 331 428 329 465 342C506 357 535 386 549 423C526 414 502 413 480 421C501 430 517 444 527 464C489 482 447 486 405 472C374 462 348 446 325 426" fill="url(#kitsuFur)"/>
  <path d="M459 343C490 351 517 371 535 398C514 392 494 393 476 401C490 407 503 417 514 430C487 439 459 439 434 429" fill="url(#kitsuLime)"/>
  <path d="M246 331C219 344 197 363 182 388"/>
  <path d="M393 333C408 349 418 370 421 393"/>
  <path d="M239 350C220 366 208 388 205 413"/>
  <path d="M362 369C350 391 346 413 350 437"/>
  <path d="M247 427C260 443 276 456 296 465"/>
</g>
<path d="M249 180C265 164 283 156 301 157" stroke="#9fe52d" strokeWidth="10" strokeLinecap="round"/>
<path d="M357 157C376 160 392 169 403 183" stroke="#9fe52d" strokeWidth="10" strokeLinecap="round"/>
<circle cx="282" cy="209" r="7" fill="#0a0d0f"/>
<circle cx="373" cy="209" r="7" fill="#0a0d0f"/>
<path d="M178 230C168 226 158 228 151 235" stroke="#0a0d0f" strokeWidth="8" strokeLinecap="round"/>
</svg>}
