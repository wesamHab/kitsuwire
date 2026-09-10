import Image from "next/image";

export function HeroSignal(){
  return <div className="hero-signal hero-art home-hero-scene" aria-hidden="true">
    <div className="hero-image-frame">
      <Image
        className="hero-reference-image"
        src="/kitsuwire-home-hero.webp"
        alt=""
        fill
        priority
        sizes="(max-width: 860px) 100vw, 56vw"
      />
    </div>
  </div>;
}
