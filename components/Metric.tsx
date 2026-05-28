import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface Props {
  imgUrl: string;
  alt: string;
  value: string | number;
  title: string;
  href?: string;
  textStyles: string;
  imgStyles?: string;
  isAuthor?: boolean;
  titleStyles?: string;
}

export const Metric = ({ imgUrl, alt, value, title, href, textStyles, imgStyles, titleStyles }: Props) => {
  const metricContent = (
    <>
      {imgUrl ? (
        <Image src={imgUrl} width={16} height={16} alt={alt} className={`rounded-full object-contain ${imgStyles}`} />
      ) : null}

      <p className={`${textStyles} flex items-center gap-1`}>
        {value}
        {title ? <span className={cn(`small-regular line-clamp-1`, titleStyles)}>{title}</span> : null}
      </p>
    </>
  );

  return href ? (
    <Link className="flex-center gap-1" href={href}>
      {metricContent}
    </Link>
  ) : (
    <div className="flex-center gap-1">{metricContent}</div>
  );
};
