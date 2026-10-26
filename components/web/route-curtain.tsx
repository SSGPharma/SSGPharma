"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function RouteCurtain() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const firstRender = useRef(true);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      prevPathname.current = pathname;
      return;
    }

    // Only fire the route transition animation for actual page navigation,
    // not for in-page query/pagination changes.
    if (pathname === prevPathname.current) {
      return;
    }

    prevPathname.current = pathname;
    let deactivateTimeout: number | undefined;
    const activateTimeout = window.setTimeout(() => {
      setActive(true);
      deactivateTimeout = window.setTimeout(() => setActive(false), 760);
    }, 0);

    return () => {
      window.clearTimeout(activateTimeout);
      if (deactivateTimeout !== undefined) window.clearTimeout(deactivateTimeout);
    };
  }, [pathname]);

  return (
    <div className={cn("route-curtain", active && "route-curtain-active")} aria-hidden="true">
      <span>SSG PHARMA</span>
    </div>
  );
}
