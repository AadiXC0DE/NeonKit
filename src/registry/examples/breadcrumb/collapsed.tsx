import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const trail = [
  { label: "Help Center", href: "#help" },
  { label: "Billing", href: "#billing" },
  { label: "Invoices", href: "#invoices" },
  { label: "Taxes", href: "#taxes" },
  { label: "EU VAT", href: "#eu-vat" },
];

export default function BreadcrumbCollapsed() {
  return (
    <Breadcrumb maxItems={3}>
      <BreadcrumbList>
        {trail.map((crumb) => (
          <Fragment key={crumb.href}>
            <BreadcrumbItem>
              <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </Fragment>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>Reverse charge</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
