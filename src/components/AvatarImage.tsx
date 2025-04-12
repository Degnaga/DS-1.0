import Image from "next/image";

type AvatarImageProps = {
  image: string | null;
  alt: string;
};

export default function AvatarImage({ image, alt }: AvatarImageProps) {
  return (
    <Image
      src={image || "/avatar-32-32.png"}
      alt={alt[0]}
      width={32}
      height={32}
    />
  );
}
