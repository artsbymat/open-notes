import Image from "next/image";
import { RenderExcalidraw } from "@/components//RenderExcalidraw";

// Maybe needed
// const isCloudImage = (src) => {
//   if (typeof src !== "string") return false;
//   return src.startsWith("http://") || src.startsWith("https://");
// };

// const isLocalImage = (src) => {
//   if (typeof src !== "string") return false;
//   return src.startsWith("/") && !isCloudImage(src);
// };

export const CustomImage = (props) => {
  const { alt, src, width } = props;

  if (!src) {
    console.warn("CustomImage: No src provided");
    return null;
  }

  // const isCloud = isCloudImage(src);
  // const isLocal = isLocalImage(src);

  const pattern = /^\/content\/assets\/(?:.+\/)*.+\.excalidraw\.svg$/;

  if (pattern.test(src)) {
    return <RenderExcalidraw alt={alt} src={src} />;
  }

  const dynamicWidth = (() => {
    const match = alt?.match(/\|(\d+)\s*$/);
    return match ? parseInt(match[1], 10) : null;
  })();

  const cleanAlt = alt?.replace(/\|\d+\s*$/, "") || alt;
  const finalWidth = dynamicWidth || width;
  const isGif = typeof src === "string" && /\.gif($|\?)/i.test(src);

  if (finalWidth) {
    return (
      <Image
        src={src}
        alt={cleanAlt}
        width={finalWidth}
        height={finalWidth}
        loading="lazy"
        sizes="100vw"
        unoptimized={isGif}
        className="mx-auto mb-4"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={cleanAlt}
      height={600}
      width={800}
      loading="lazy"
      unoptimized={isGif}
      className="mx-auto mb-4 w-auto"
    />
  );
};
