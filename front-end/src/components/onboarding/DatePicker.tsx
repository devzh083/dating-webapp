// src/components/DatePicker.tsx (or wherever you keep it)
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
  const thisYear = new Date().getFullYear();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
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
          "w-[360px] p-0",
          "bg-white border border-[#e5e7eb]",
          "rounded-[16px]",
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
          // key for easy month + year selection
          captionLayout="dropdown"
          fromYear={1900}
          toYear={thisYear}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
          defaultMonth={value || new Date(2000, 0)}
          initialFocus
          className={cn(
            "p-6",
            "text-[13px] leading-6",
            "font-normal text-[#111827]",
            "[&_th]:text-[#6b7280] [&_th]:font-semibold [&_th]:text-[12px]",
            "[&_button]:rounded-full [&_button]:w-8 [&_button]:h-8",
            "[&_button:hover]:bg-[#e5f7f4]"
          )}
        />
      </PopoverContent>
    </Popover>
  );
};
