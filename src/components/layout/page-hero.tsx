import Image from "next/image";
import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  imageUrl: string;
  children?: ReactNode;
};

export function PageHero({ eyebrow, title, description, imageUrl, children }: PageHeroProps) {
  return (
    <section className="relative min-h-[320px] overflow-hidden border border-white/10 bg-[#101216]">
      <Image alt="" className="object-cover" fill priority sizes="(min-width: 1280px) 1200px, 100vw" src={imageUrl} />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#101216] via-[#101216]/45 to-transparent" />
      <div className="relative z-10 flex min-h-[320px] flex-col justify-end p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase text-white/52">{eyebrow}</p>
        <h1 className="mt-3 max-w-4xl font-serif text-4xl font-semibold italic leading-none text-white sm:text-6xl">
          {title}
        </h1>
        {description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-white/72 sm:text-base">{description}</p> : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
