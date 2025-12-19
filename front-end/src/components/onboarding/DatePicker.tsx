import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            "w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 text-left transition-all duration-300 ease-in-out outline-none",
            !value && !open && "bg-white border-gray-100 text-muted-foreground hover:border-gray-200",
            open && !value && "border-teal-500 ring-4 ring-teal-500/10 bg-white text-muted-foreground",
            value && "bg-teal-50 border-teal-500 text-gray-900",
            value && open && "ring-4 ring-teal-500/10"
          )}
        >
          <span className="text-base font-medium">
            {value ? format(value, "MMMM d, yyyy") : placeholder}
          </span>

          <CalendarIcon
            className={cn(
              "w-5 h-5 transition-colors duration-200",
              value || open ? "text-teal-600" : "text-gray-400"
            )}
          />
        </motion.button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="z-50 w-auto p-0 bg-white border border-gray-100 rounded-xl shadow-xl"
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
          captionLayout="dropdown"
          fromYear={1900}
          toYear={new Date().getFullYear()}
          initialFocus
          className="p-3"
          classNames={{
            // Header: Relative positioning is required for the absolute buttons to work
            caption: "flex justify-center pt-1 relative items-center w-full",
            caption_label: "hidden", // Hide title text since we have dropdowns

            // Navigation Container: Ensure it doesn't block layout, but buttons will break out of it anyway
            nav: "flex items-center",
            
            // Arrows: Force them to absolute positions relative to the 'caption' header
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 transition-opacity absolute top-2 z-10",
            nav_button_previous: "left-1", // Sticked to far left
            nav_button_next: "right-1",    // Sticked to far right

            // Dropdowns
            dropdown: "bg-transparent outline-none border-none text-sm font-medium text-gray-800 hover:bg-gray-50 rounded-md cursor-pointer mx-1",
            dropdown_month: "mr-2", 
            dropdown_year: "",

            // Table Grid
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            
            // Day Cells
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            
            // Day Button Styling
            day: cn(
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md",
              "hover:bg-teal-50 hover:text-teal-700 transition-colors" // Light hover
            ),

            // Selected State: Thick Teal background, White text
            day_selected:
              "bg-teal-500 text-white hover:bg-teal-500 hover:text-white focus:bg-teal-500 focus:text-white shadow-sm",
            
            day_today: "bg-gray-100 text-gray-900",
            day_outside: "text-gray-300 opacity-50",
            day_disabled: "text-gray-300 opacity-50",
            day_hidden: "invisible",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};