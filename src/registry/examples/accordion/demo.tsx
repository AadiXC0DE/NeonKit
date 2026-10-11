import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    value: "free",
    question: "Is NeonKit free?",
    answer:
      "Yes. Every component is MIT licensed. Use it in personal and commercial projects, change whatever you like, and ship it without attribution.",
  },
  {
    value: "tailwind",
    question: "Do I need Tailwind CSS 4?",
    answer:
      "No. The components avoid utilities that were renamed between versions, so the same file works in Tailwind 3.4 and 4. Colors live in arbitrary values, so there is nothing to add to your config.",
  },
  {
    value: "color",
    question: "How do I change the color?",
    answer:
      "Pass color to any component, either a palette name like \"magenta\" or a hex value. To recolor a whole page or section, set --neon-accent on a parent element and every component inside follows it.",
  },
  {
    value: "shadcn",
    question: "Can I use it with shadcn/ui?",
    answer:
      "Yes. The registry is shadcn-compatible, so the shadcn CLI pulls a component and its dependencies into the same components/ui folder as your existing shadcn components.",
  },
];

export default function AccordionDemo() {
  return (
    <Accordion type="single" defaultValue="free" className="max-w-lg">
      {faqs.map((faq) => (
        <AccordionItem key={faq.value} value={faq.value}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
