import { motion } from "framer-motion";

interface CustomSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
}

export const CustomSlider = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = "",
}: CustomSliderProps) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{min}{unit}</span>
        <motion.span
          key={value}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold gradient-text"
        >
          {value}{unit}
        </motion.span>
        <span className="text-sm text-muted-foreground">{max}{unit}</span>
      </div>

      <div className="relative h-3">
        {/* Track background */}
        <div className="absolute inset-0 rounded-full bg-slider-track" />
        
        {/* Filled track */}
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full gradient-primary"
          style={{ width: `${percentage}%` }}
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {/* Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* Thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slider-thumb border-4 border-primary shadow-lg pointer-events-none"
          style={{ left: `calc(${percentage}% - 12px)` }}
          initial={false}
          animate={{ left: `calc(${percentage}% - 12px)` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  );
};
