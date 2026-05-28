import { ReactNode } from "react";

const Mocklink = ({ children, href }: { children: ReactNode; href: string }) => {
  return <a href={href}>{children}</a>;
};

export { Mocklink };
