import { House, KeyRound } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

export default function BreadcrumbDemo() {
  return (
    <header className="grid w-full max-w-xl gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#lumen-labs">
              <House aria-hidden />
              Lumen Labs
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#aurora-web">aurora-web</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <KeyRound aria-hidden />
              Environment variables
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h3 className="text-lg font-medium text-white/90">Environment variables</h3>
          <p className="text-sm text-white/55">12 variables across Production, Preview and Development.</p>
        </div>
        <Button size="sm" variant="soft">
          Add variable
        </Button>
      </div>
    </header>
  );
}
