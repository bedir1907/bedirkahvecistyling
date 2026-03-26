"use client"

import { CldUploadButton } from "next-cloudinary"

type Props = {
  onUploadSuccess: (url: string) => void
  buttonText?: string
}

type CloudinaryUploadResult = {
  info?: {
    secure_url?: string
  }
}

export default function CloudinaryUploadButton({
  onUploadSuccess,
  buttonText = "Görsel Seç",
}: Props) {
  return (
    <CldUploadButton
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{
        multiple: false,
        folder: "products",
        resourceType: "image",
      }}
      onSuccess={(result) => {
        const data = result as CloudinaryUploadResult
        const url = data?.info?.secure_url

        if (url) {
          onUploadSuccess(url)
        }
      }}
      className="border border-black px-4 py-3 rounded-xl hover:bg-black hover:text-white transition"
    >
      {buttonText}
    </CldUploadButton>
  )
}