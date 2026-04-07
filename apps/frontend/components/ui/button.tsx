import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-white hover:opacity-90 shadow-sm",
                primary:
                    "bg-primary bg-gradient-to-br from-primary to-primary-container text-white border-none rounded-md hover:opacity-90 shadow-md",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline:
                    "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                tertiary: "bg-transparent text-primary px-2 hover:bg-primary/5",
                glass: "glass text-foreground hover:bg-white/30",
                "ezee-red": "bg-[#ff9c00] text-ezee-dark-blue font-bold hover:bg-[#ffbf27] shadow-lg shadow-red-500/20 active:scale-95 transition-all text-lg",
                "ezee-blue": "bg-ezee-dark-blue text-white font-bold hover:bg-ezee-red shadow-lg shadow-blue-900/20 active:scale-95 transition-all dark:bg-primary dark:text-[#0f2a5c] dark:hover:bg-primary/90",
                "brand-red": "bg-brand-red text-white font-bold hover:bg-brand-red/90 shadow-md transition-all active:scale-95",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-5",
                xl: "h-14 rounded-md px-6 text-base",
                icon: "h-10 w-10",
            },
            shimmer: {
                true: "relative overflow-hidden group",
                false: "",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            shimmer: true,
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, shimmer = true, asChild = false, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, shimmer, className }))}
                ref={ref}
                {...props}
            >
                {shimmer && (
                  <div className="shimmer-effect" />
                )}
                {asChild ? (
                  children
                ) : (
                  <span className={cn("inline-flex items-center gap-2", shimmer && "relative z-10")}>
                    {children}
                  </span>
                )}
            </Comp>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
