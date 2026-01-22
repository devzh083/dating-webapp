import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-5 bg-white rounded-[24px] shadow-xl border-2 border-teal-400",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center", // Centered caption
        caption_label: "hidden", // Hide default label
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 bg-teal-50 p-0 text-teal-600 hover:text-white hover:bg-teal-500 rounded-full transition-all shadow-sm"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-between w-full mb-2",
        head_cell: "text-teal-400/80 rounded-md w-9 font-bold text-[0.8rem] uppercase tracking-wider",
        row: "flex w-full mt-2 justify-between",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-medium aria-selected:opacity-100 rounded-full hover:bg-teal-100 hover:text-teal-700 transition-all text-slate-700"
        ),
        day_selected:
          "bg-teal-500 text-white hover:bg-teal-600 hover:text-white focus:bg-teal-600 focus:text-white shadow-md shadow-teal-500/40 font-bold transform scale-105",
        day_today: "bg-teal-50 text-teal-700 font-bold border border-teal-200",
        day_outside: "text-slate-300 opacity-50 aria-selected:bg-transparent aria-selected:text-slate-300 aria-selected:opacity-30",
        day_disabled: "text-slate-300 opacity-50 cursor-not-allowed",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5" />,
        // COMPLETELY CUSTOM HEADER
        Caption: ({ displayMonth, goToMonth }) => {
          const currentYear = displayMonth.getFullYear();
          const currentMonth = displayMonth.getMonth();
          
          // Generate Years (1940 - 2030)
          const years = Array.from({ length: 91 }, (_, i) => 1940 + i);
          // Month Names
          const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];

          const handleMonthChange = (value: string) => {
            const newDate = new Date(displayMonth);
            newDate.setMonth(parseInt(value));
            goToMonth && goToMonth(newDate);
          };

          const handleYearChange = (value: string) => {
            const newDate = new Date(displayMonth);
            newDate.setFullYear(parseInt(value));
            goToMonth && goToMonth(newDate);
          };

          return (
            <div className="flex gap-2 items-center justify-center pb-2">
              {/* Month Select */}
              <Select
                value={currentMonth.toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="h-8 w-[110px] border-none p-0 focus:ring-0 font-extrabold text-teal-900 text-sm bg-transparent shadow-none hover:text-teal-600 justify-center gap-1">
                  <SelectValue>{months[currentMonth]}</SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[240px] bg-white border-2 border-teal-100 rounded-xl shadow-xl z-[60]">
                  {months.map((month, index) => (
                    <SelectItem 
                      key={month} 
                      value={index.toString()}
                      className="text-slate-600 focus:bg-teal-50 focus:text-teal-700 font-semibold cursor-pointer"
                    >
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year Select */}
              <Select
                value={currentYear.toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="h-8 w-[80px] border-none p-0 focus:ring-0 font-extrabold text-teal-900 text-sm bg-transparent shadow-none hover:text-teal-600 justify-center gap-1">
                  <SelectValue>{currentYear}</SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[240px] bg-white border-2 border-teal-100 rounded-xl shadow-xl z-[60]">
                  {years.map((year) => (
                    <SelectItem 
                      key={year} 
                      value={year.toString()}
                      className="text-slate-600 focus:bg-teal-50 focus:text-teal-700 font-semibold cursor-pointer"
                    >
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";
export { Calendar };