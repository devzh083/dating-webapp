import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Calendar } from "../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export const DatePicker = ({
  value,
  onChange,
  placeholder = "Select your birthday",
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3",
            // shape
            "rounded-[10px] border border-[#38c3b9]",
            // fill + shadow
            "bg-[#dcf8f4] shadow-[0_1px_2px_rgba(15,23,42,0.06)]",
            // transition
            "text-left transition-[border,box-shadow,background-color] duration-150",
            open && "border-[#1fb8ad] shadow-[0_0_0_1px_rgba(31,184,173,0.38)]"
          )}
        >
          <span
            className={cn(
              "text-[13px] leading-none",
              value ? "text-[#111827] font-medium" : "text-[#9ca3af]"
            )}
          >
            {value ? format(value, "MMMM d, yyyy") : placeholder}
          </span>
          <CalendarIcon className="w-4 h-4 text-[#6b7280]" />
        </motion.button>
      </PopoverTrigger>
    <PopoverContent
      align="start"
      className={cn(
        "w-[360px] p-0",                    // fixed width like screenshot
        "bg-white border border-[#e5e7eb]", // light gray border
        "rounded-[16px]",                   // soft card radius
        "shadow-[0_18px_45px_rgba(15,23,42,0.18)]" // deep drop shadow
      )}
    >
      <Calendar
        mode="single"
        selected={value}
        onSelect={(date) => {
          onChange(date);
          setOpen(false);
        }}
        disabled={(date) =>
          date > new Date() || date < new Date("1900-01-01")
        }
        defaultMonth={value || new Date(2000, 0)}
        initialFocus
        className={cn(
          "p-6",                        // spacing around content
          "text-[13px] leading-6",      // match font size/line height
          "font-normal text-[#111827]", // dark text
          "[&_th]:text-[#6b7280] [&_th]:font-semibold [&_th]:text-[12px]", // weekday header
          "[&_button]:rounded-full [&_button]:w-8 [&_button]:h-8",        // day cells
          "[&_button:hover]:bg-[#e5f7f4]"                                 // subtle hover
        )}
      />
    </PopoverContent>

    </Popover>
  );
};
