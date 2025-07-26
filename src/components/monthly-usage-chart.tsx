
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "./ui/chart"

const chartData = [
  { month: "Fev", photos: 186 },
  { month: "Mar", photos: 305 },
  { month: "Abr", photos: 237 },
  { month: "Mai", photos: 73 },
  { month: "Jun", photos: 209 },
  { month: "Jul", photos: 214 },
]

const chartConfig = {
  photos: {
    label: "Fotos",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function MonthlyUsageChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[150px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                        hideLabel 
                        formatter={(value, name, props) => (
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">{props.payload.month}</span>
                            <span className="font-bold text-foreground">{value} fotos</span>
                          </div>
                        )}
                    />} 
                />
                <Bar dataKey="photos" fill="var(--color-photos)" radius={4} />
            </BarChart>
        </ResponsiveContainer>
    </ChartContainer>
  )
}
