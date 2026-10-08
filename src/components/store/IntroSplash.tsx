import { LogoMark } from "@/components/LogoLoader"

/**
 * Siteye girişte oturum başına bir kez gösterilen marka splash'ı.
 * Görünürlük <head>'deki INTRO_SPLASH_SCRIPT'in <html>'e eklediği `bk-intro` sınıfına bağlı; splash saf
 * CSS ile kendiliğinden kaybolur (JS/hydration beklemez). İçerik arkada normal render edilir — arama
 * motorları aynı HTML'i görür; botlarda ve admin panelinde gösterilmez.
 */
export default function IntroSplash() {
  return (
    <div className="bk-intro-splash fixed inset-0 z-[100] flex-col items-center justify-center bg-white" aria-hidden="true">
      <LogoMark />
    </div>
  )
}

export const INTRO_SPLASH_SCRIPT = `try{var p=location.pathname,u=navigator.userAgent;if(p.indexOf("/bksy0net1mp4neli")!==0&&!/bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview/i.test(u)&&!sessionStorage.getItem("bk-intro")){sessionStorage.setItem("bk-intro","1");document.documentElement.classList.add("bk-intro")}}catch(e){}`
