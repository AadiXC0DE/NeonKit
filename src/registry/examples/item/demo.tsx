"use client";

import * as React from "react";
import { ChevronRight, KeyRound, Laptop, ShieldCheck, Smartphone } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";

export default function ItemDemo() {
  const [twoFactor, setTwoFactor] = React.useState(true);

  return (
    <div className="min-w-0 w-full max-w-xl">
      <h3 className="px-4 pb-2 text-[15px] font-semibold text-white/90">Sign-in and security</h3>
      <ItemGroup>
        <Item>
          <ItemMedia variant="icon">
            <ShieldCheck />
          </ItemMedia>
          <ItemContent>
            <ItemTitle id="two-factor">Two-factor authentication</ItemTitle>
            <ItemDescription lines="none">
              {twoFactor ? "A code from your authenticator app at every sign-in." : "Off. Anyone with your password can sign in."}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Switch aria-labelledby="two-factor" checked={twoFactor} onCheckedChange={setTwoFactor} />
          </ItemActions>
        </Item>
        <ItemSeparator inset={70} />
        <Item>
          <ItemMedia variant="icon">
            <KeyRound />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Passkeys</ItemTitle>
            <ItemDescription lines="none">2 registered. Last used on a MacBook Pro, 3 days ago.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="ghost" size="sm">
              Manage
            </Button>
          </ItemActions>
        </Item>
        <ItemSeparator inset={70} />
        <Item asChild>
          <a href="#sessions">
            <ItemMedia variant="icon">
              <Laptop />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Active sessions</ItemTitle>
              <ItemDescription lines="none">4 devices in Lisbon and Berlin</ItemDescription>
            </ItemContent>
            <ItemActions>
              <ChevronRight className="size-4 text-white/35 transition-transform duration-200 group-hover/item:translate-x-0.5" />
            </ItemActions>
          </a>
        </Item>
        <ItemSeparator inset={70} />
        <Item>
          <ItemMedia variant="icon">
            <Smartphone />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Recovery codes</ItemTitle>
            <ItemDescription lines="none">Generated 14 March. 8 of 10 unused.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="ghost" size="sm">
              Regenerate
            </Button>
          </ItemActions>
        </Item>
      </ItemGroup>
    </div>
  );
}
