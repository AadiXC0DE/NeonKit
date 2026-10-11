"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const INVALID = "#ff4d5e";

// Same label scale as Input, Select and Textarea, so mixed forms line up.
const labelSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm",
} as const;

// Elements a <label for> can point at. Anything else gets aria-labelledby instead.
const LABELABLE = new Set(["input", "select", "textarea", "button", "meter", "output", "progress"]);
const FOCUSABLE =
  'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), [tabindex]:not([tabindex="-1"])';

type FieldContextValue = {
  id: string;
  labelId?: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
};

const FieldContext = React.createContext<FieldContextValue | null>(null);

export interface FieldControlProps {
  id?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  required?: true;
}

/**
 * Props for a custom control inside a <Field>. Spread them onto the focusable
 * element. Outside a Field it returns an empty object.
 */
function useFieldControl(): FieldControlProps {
  const field = React.useContext(FieldContext);
  if (!field) return {};
  return {
    id: field.id,
    "aria-labelledby": field.labelId,
    "aria-describedby": field.describedBy,
    "aria-invalid": field.invalid || undefined,
    required: field.required || undefined,
  };
}

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Shows a small neon dot after the text. Set `required` on the control too. */
  required?: boolean;
  size?: keyof typeof labelSizes;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, size = "md", htmlFor, children, ...props }, ref) => {
    const field = React.useContext(FieldContext);
    const isRequired = required ?? field?.required ?? false;

    return (
      <label
        ref={ref}
        htmlFor={htmlFor ?? field?.id}
        className={cn("w-fit font-medium text-white/80", labelSizes[size], className)}
        {...props}
      >
        {children}
        {isRequired && (
          <span
            aria-hidden
            title="Required"
            className={cn(
              "[--neon:var(--neon-accent,34_211_238)]",
              "relative -top-px ml-1.5 inline-block size-[5px] rounded-full align-middle",
              "bg-[rgb(var(--neon))] shadow-[0_0_4px_rgb(var(--neon)/0.9),0_0_10px_rgb(var(--neon)/0.5)]",
            )}
          />
        )}
      </label>
    );
  },
);
Label.displayName = "Label";

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-xs leading-5 text-white/55", className)} {...props} />
));
FieldDescription.displayName = "FieldDescription";

const FieldError = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    if (children == null || children === false || children === "") return null;
    return (
      <p ref={ref} className={cn("text-xs leading-5 text-[#ff4d5e]", className)} {...props}>
        {children}
      </p>
    );
  },
);
FieldError.displayName = "FieldError";

type ControlElementProps = {
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
};

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  label?: React.ReactNode;
  /** Helper text under the control. Hidden while `error` is set. */
  description?: React.ReactNode;
  /** Marks the field invalid and shows this message. Pass `true` for the red state alone. */
  error?: React.ReactNode;
  /** Shows the neon dot on the label and sets `required` on the control. */
  required?: boolean;
  /** The control's id. Defaults to the child's own id, then a generated one. */
  id?: string;
  /** Palette name or any hex color, passed down to the control. Red while `error` is set. */
  color?: NeonColor;
  /** Label text size, matching the control's size. */
  size?: keyof typeof labelSizes;
  /** "horizontal" puts the label and message on the left and the control on the right. */
  orientation?: "vertical" | "horizontal";
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  (
    {
      className,
      style,
      label,
      description,
      error,
      required = false,
      id: idProp,
      color,
      size = "md",
      orientation = "vertical",
      children,
      ...props
    },
    ref,
  ) => {
    const autoId = React.useId();
    const child =
      React.isValidElement<ControlElementProps>(children) && children.type !== React.Fragment
        ? children
        : null;
    const id = idProp ?? child?.props.id ?? autoId;
    const labelId = label ? `${id}-label` : undefined;

    const invalid = Boolean(error);
    const message = invalid ? (error === true ? null : error) : description;
    const messageId = message ? `${id}-${invalid ? "error" : "description"}` : undefined;

    const context = React.useMemo<FieldContextValue>(
      () => ({ id, labelId, describedBy: messageId, invalid, required }),
      [id, labelId, messageId, invalid, required],
    );

    let control: React.ReactNode = children;
    if (child) {
      const own = child.props;
      const labelable = typeof child.type === "string" && LABELABLE.has(child.type);
      const named = own["aria-label"] != null || own["aria-labelledby"] != null;
      control = React.cloneElement(child, {
        id,
        "aria-describedby": [own["aria-describedby"], messageId].filter(Boolean).join(" ") || undefined,
        "aria-invalid": invalid || own["aria-invalid"],
        ...(required ? { required: true } : null),
        ...(labelId && !labelable && !named ? { "aria-labelledby": labelId } : null),
      } as ControlElementProps);
    }

    // A label only focuses labelable elements. For the rest (a slider thumb,
    // a custom group), move focus to the first focusable part ourselves.
    function handleLabelClick(event: React.MouseEvent<HTMLLabelElement>) {
      const target = document.getElementById(id);
      if (!target || LABELABLE.has(target.tagName.toLowerCase())) return;
      const focusable = target.matches(FOCUSABLE) ? target : target.querySelector<HTMLElement>(FOCUSABLE);
      if (!focusable) return;
      event.preventDefault();
      focusable.focus();
    }

    const labelEl = label && (
      <Label id={labelId} htmlFor={id} required={required} size={size} onClick={handleLabelClick}>
        {label}
      </Label>
    );

    const messageEl =
      message &&
      (invalid ? (
        <FieldError id={messageId}>{message}</FieldError>
      ) : (
        <FieldDescription id={messageId}>{message}</FieldDescription>
      ));

    return (
      <FieldContext.Provider value={context}>
        <div
          ref={ref}
          data-invalid={invalid ? "" : undefined}
          data-orientation={orientation}
          style={neonVars(invalid ? INVALID : color, style)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            orientation === "horizontal"
              ? "flex w-full items-center justify-between gap-x-6"
              : "grid w-full gap-1.5",
            className,
          )}
          {...props}
        >
          {orientation === "horizontal" ? (
            <>
              {(labelEl || messageEl) && (
                <div className="grid min-w-0 gap-0.5">
                  {labelEl}
                  {messageEl}
                </div>
              )}
              <div className="flex shrink-0 items-center">{control}</div>
            </>
          ) : (
            <>
              {labelEl}
              {control}
              {messageEl}
            </>
          )}
        </div>
      </FieldContext.Provider>
    );
  },
);
Field.displayName = "Field";

export { Field, Label, FieldDescription, FieldError, useFieldControl };
