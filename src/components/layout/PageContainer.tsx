import * as React from "react";
import { cn } from "@/lib/utils"; 

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function PageContainer({ children, className }: Props) {
  return (
    <div className={cn("mx-auto w-full max-w-[1180px] px-4 md:px-6", className)}>
      {children}
    </div>
  );
}