"use client";

import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { formUrlQuery } from "@/lib/url";
import Image from "next/image";

interface Filter {
  name: string;
  value: string;
}

interface Props {
  filters: Filter[];
  otherClasses: string;
  containerClasses?: string;
  imgSrc?: string;
  placeholder?: string;
}

const CommonFilter = ({
  filters,
  otherClasses,
  containerClasses,
  imgSrc = "",
  placeholder = "Select a filter",
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramsFilter = searchParams.get("filter");

  const handleUpdateParams = (value: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "filter",
      value,
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className={cn("relative", containerClasses)}>
      <Select
        onValueChange={handleUpdateParams}
        defaultValue={paramsFilter || undefined}
      >
        <SelectTrigger
          className={cn(
            "body-regular no-focus light-border background-light800_dark300 text-dark500_light700 border px-5 py-2.5",
            otherClasses
          )}
          aria-label="Filter options"
        >
          <div className="flex gap-4">
            {imgSrc && (
              <Image src={imgSrc} alt="select" width={16} height={16} />
            )}

            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            {filters.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CommonFilter;
