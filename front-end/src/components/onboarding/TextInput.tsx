import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";


interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const TextInput = ({
  value,
  onChange,
  placeholder,
  label,
  icon,
  className,
}: TextInputProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <motion.div
        animate={{
          borderColor: focused ? "hsl(var(--primary))" : "hsl(var(--chip-border))",
        }}
        className={cn(
          "flex items-center gap-3 px-4 py-4 rounded-xl border-2 bg-chip transition-all duration-200",
          focused && "ring-2 ring-primary/20"
        )}
      >
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </motion.div>
    </div>
  );
};
