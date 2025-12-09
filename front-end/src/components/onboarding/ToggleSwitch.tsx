import { motion } from "framer-motion";
import { cn } from "../../lib/utils";


interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const ToggleSwitch = ({
  label,
  checked,
  onChange,
  className,
}: ToggleSwitchProps) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center justify-between w-full py-4 px-4 rounded-xl border transition-all duration-200",
        checked
          ? "border-primary/30 bg-chip-selected"
          : "border-chip-border bg-chip hover:bg-chip-hover",
        className
      )}
    >
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div
        className={cn(
          "w-12 h-7 rounded-full p-1 transition-colors duration-200",
          checked ? "bg-primary" : "bg-slider-track"
        )}
      >
        <motion.div
          className="w-5 h-5 rounded-full bg-white shadow-md"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
};
