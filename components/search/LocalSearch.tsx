"use client";

import Image from "next/image";
import { Input } from "../ui/input";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/url";

interface UrlQueryParams {
  route: string;
  imgSrc: string;
  placeholder: string;
  iconPosition?: "left" | "right";
  otherClasses?: string;
}

const LocalSearch = ({
  route,
  imgSrc,
  placeholder,
  otherClasses,
  iconPosition = "left",
}: UrlQueryParams) => {
  //Get the current URL
  const pathname = usePathname();
  //Enables to navigate page
  const router = useRouter();
  //Get the current query parameter e.g) ?page=1&sort=asc
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    //Delays to execute function within the callback function to elude expensive query search.
    const delayDebounce = setTimeout(() => {
      if (searchQuery === query) return;

      if (searchQuery) {
        //Generate new url to navigate to the new page based on the result of the query.
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: searchQuery,
        });
        //Navigate to the new page.
        //{ scroll: false } : hold the scrolled place
        router.push(newUrl, { scroll: false });
      } else {
        //On condition that current url equals to home one.
        if (pathname === route) {
          //remove current query
          const newUrl = removeKeysFromQuery({
            params: searchParams.toString(),
            keysToRemove: ["query"],
          });

          router.push(newUrl, { scroll: false });
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, searchParams, route, router, pathname, query]);

  return (
    <div
      className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      {iconPosition === "left" && (
        <Image
          src={imgSrc}
          alt="search"
          width={24}
          height={24}
          className="cursor-pointer"
        />
      )}
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
      />
      {iconPosition === "right" && (
        <Image
          src={imgSrc}
          alt="search"
          width={15}
          height={15}
          className="cursor-pointer"
        />
      )}
    </div>
  );
};

export default LocalSearch;
