import Image from "next/image";

export const CustomImage = (props) => {
  const { alt, src, width } = props;

  if (!src) {
    console.warn("CustomImage: No src provided");
    return null;
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
