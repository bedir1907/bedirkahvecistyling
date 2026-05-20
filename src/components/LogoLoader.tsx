import Image from "next/image"

export default function LogoLoader() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div
        className="animate-spin"
        style={{ animationDuration: "1.2s", animationTimingFunction: "linear" }}
      >
        <Image
          src="/bk-logo.svg"
          alt="Yükleniyor"
          width={88}
          height={88}
          priority
        />
      </div>
    </div>
  )
}
