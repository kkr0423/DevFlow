import { MockImage } from "./image.mock";

interface Props {
  imgUrl: string;
  alt: string;
  value: number;
  title: string;
  textStyles?: string;
}

const MockMetric = ({ imgUrl, alt, value, title, textStyles }: Props) => {
  return (
    <div className={textStyles}>
      <MockImage src={imgUrl} alt={alt} />
      {value} {title}
    </div>
  );
};

export { MockMetric };
