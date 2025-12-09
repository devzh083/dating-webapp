import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const CheckboxField = ({
  label,
  checked,
  onChange,
  className,
}: CheckboxFieldProps) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center gap-3 w-full py-3 text-left",
        className
      )}
    >
      <motion.div
        whileTap={{ scale: 0.9 }}
        className={cn(
          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200",
          checked
            ? "bg-primary border-primary"
            : "border-chip-border hover:border-primary/50"
        )}
      >
        {checked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Check className="w-4 h-4 text-primary-foreground" />
          </motion.div>
        )}
      </motion.div>
      <span className="text-sm text-foreground">{label}</span>
    </button>
  );
};
