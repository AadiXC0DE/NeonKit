"use client";

import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

const sections = ["Overview", "Deployments", "Analytics", "Logs", "Settings"];

export default function NavigationMenuLinks() {
  const [current, setCurrent] = React.useState("Deployments");

  return (
    <div className="w-full max-w-xl border-b border-white/10">
      <NavigationMenu aria-label="Project">
        <NavigationMenuList>
          {sections.map((section) => (
            <NavigationMenuItem key={section}>
              <NavigationMenuLink
                href={`#${section.toLowerCase()}`}
                active={current === section}
                onClick={(event) => {
                  // Client-side routing: swap the view without a page load.
                  event.preventDefault();
                  setCurrent(section);
                }}
              >
                {section}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
