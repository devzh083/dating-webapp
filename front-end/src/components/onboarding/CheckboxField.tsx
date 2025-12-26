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
    <motion.button
      type="button"
      onClick={() => onChange(!checked)}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full flex items-center justify-between rounded-2xl px-5 py-4 transition-all duration-200",
        "text-left",
        checked
          ? "bg-teal-50 ring-2 ring-teal-400"
          : "bg-gray-50 hover:bg-gray-100",
        className
      )}
    >
      {/* Label */}
      <span
        className={cn(
          "text-sm transition-colors",
          checked
            ? "text-teal-900 font-semibold"
            : "text-gray-700 font-medium"
        )}
      >
        {label}
      </span>

      {/* Check Indicator */}
      <motion.div
        initial={false}
        animate={{
          scale: checked ? 1 : 0.8,
          opacity: checked ? 1 : 0.5,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-full border-2",
          checked
            ? "bg-teal-500 border-teal-500"
            : "border-gray-300 bg-white"
        )}
      >
        <motion.div
          initial={false}
          animate={{ scale: checked ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Check className="w-4 h-4 text-white stroke-[3]" />
        </motion.div>
      </motion.div>
    </motion.button>
  );
};
