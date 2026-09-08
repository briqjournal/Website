"use client";

import { useEffect, useMemo, useState } from "react";

export type ScrollSpyItem = {
  id: string;
  label: string;
  level: 2 | 3;
  parentId?: string;
};

export function ScrollSpyNav({
  title,
  items,
}: {
  title: string;
  items: ScrollSpyItem[];
}) {
  const [activeId, setActiveId] = useState(items[0]?.id || "");
  const activeParentId = useMemo(() => {
    const active = items.find((item) => item.id === activeId);
    return active?.level === 3 ? active.parentId : active?.id;
  }, [activeId, items]);

  useEffect(() => {
    const updateActiveSection = () => {
      const marker = Math.min(220, window.innerHeight * 0.3);
      let current = items[0]?.id || "";

      for (const item of items) {
        const element = document.getElementById(item.id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= marker) current = item.id;
        else break;
      }

      setActiveId(current);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [items]);

  const goToSection = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    event.preventDefault();
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  return (
    <nav className="reading-nav scrollspy-nav" aria-label={title}>
      <b>{title}</b>
      {items.map((item) => {
        const isActive = item.id === activeId;
        const isParentActive = item.level === 2 && item.id === activeParentId;
        return (
          <a
            className={`scrollspy-link level-${item.level}${isActive ? " is-active" : ""}${isParentActive ? " is-parent-active" : ""}`}
            href={`#${item.id}`}
            aria-current={isActive ? "location" : undefined}
            onClick={(event) => goToSection(event, item.id)}
            key={item.id}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
