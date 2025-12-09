import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface PillButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export const PillButton = ({
  label,
  selected,
  onClick,
  className,
}: PillButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 border-2",
        selected
          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
          : "bg-pill border-pill-border text-foreground hover:border-primary/50 hover:bg-chip-hover",
        className
      )}
    >
      {label}
    </motion.button>
  );
};
