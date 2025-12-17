// src/components/DatePicker.tsx
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
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3",
            "rounded-[10px] border border-[#38c3b9]",
            "bg-[#dcf8f4] shadow-[0_1px_2px_rgba(15,23,42,0.06)]",
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
          "w-auto p-0",
          "bg-white border border-[#e5e7eb]",
          "rounded-[12px]",
          "shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
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
          initialFocus
          className={cn(
            "p-4",
            "text-[13px] leading-6 text-[#111827]",
            // center month title
            "[&_caption]:flex [&_caption]:items-center [&_caption]:justify-center",
            // weekday header row
            "[&_thead_tr]:h-8",
            "[&_th]:w-8 [&_th]:text-xs [&_th]:font-medium [&_th]:text-[#6b7280] [&_th]:text-center",
            // DAYS GRID: 7 equal columns
            "[&_tbody]:grid [&_tbody]:grid-cols-7 [&_tbody]:gap-y-2",
            "[&_tbody_tr]:contents", // keep rows from breaking the grid
            "[&_tbody_td]:flex [&_tbody_td]:items-center [&_tbody_td]:justify-center",
            // day buttons
            "[&_button]:rounded-full [&_button]:w-8 [&_button]:h-8",
            "[&_button]:text-[12px]",
            "[&_button:hover]:bg-[#e5f7f4]",
            // outside days dimmed
            "[&_button[data-outside='true']]:text-[#d1d5db]",
            // selected day
            "[&_button[aria-selected='true']]:bg-black [&_button[aria-selected='true']]:text-white"
          )}
        />

      </PopoverContent>
    </Popover>
  );
};
