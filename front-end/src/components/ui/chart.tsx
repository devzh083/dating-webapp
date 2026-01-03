import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  };
};

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) {
    throw new Error("useChart must be used inside ChartContainer");
  }
  return ctx;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ReactNode;
  }
>(({ className, config, children, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn("flex aspect-video justify-center text-xs", className)}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  RechartsPrimitive.TooltipProps<any, any> & {
    indicator?: "dot" | "line" | "dashed";
  }
>((props, ref) => {
  const { active, payload, indicator = "dot" } = props;
  const { config } = useChart();

  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      ref={ref}
      className="rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl"
    >
      {payload.map((item: any, index: number) => {
        const key = String(item.dataKey ?? index);
        const cfg = config[key];

        return (
          <div key={key} className="flex items-center gap-2">
            <div
              className={cn(
                indicator === "dot" && "h-2.5 w-2.5 rounded",
                indicator === "line" && "h-2.5 w-1",
                indicator === "dashed" &&
                  "h-2.5 w-1 border border-dashed"
              )}
              style={{ backgroundColor: item.color }}
            />
            <span>{cfg?.label ?? item.name}</span>
            <span className="ml-auto font-mono">
              {item.value?.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltip";

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  { payload?: any[] }
>(({ payload }, ref) => {
  const { config } = useChart();

  if (!payload || payload.length === 0) return null;

  return (
    <div ref={ref} className="flex justify-center gap-4">
      {payload.map((item) => {
        const cfg = config[String(item.dataKey)];
        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded"
              style={{ backgroundColor: item.color }}
            />
            {cfg?.label}
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegend";

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
};
