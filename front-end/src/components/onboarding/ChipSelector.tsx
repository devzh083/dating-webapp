import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface ChipSelectorProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const ChipSelector = ({
  label,
  selected,
  onClick,
  icon,
  className,
}: ChipSelectorProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border",
        selected
          ? "bg-chip-selected border-chip-border-selected text-primary"
          : "bg-chip border-chip-border text-foreground hover:bg-chip-hover hover:border-primary/30",
        className
      )}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span>{label}</span>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <Check className="w-4 h-4 text-primary" />
        </motion.div>
      )}
    </motion.button>
  );
};
