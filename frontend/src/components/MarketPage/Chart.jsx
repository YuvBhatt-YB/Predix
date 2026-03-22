import React from 'react'
import { TrendingUp } from "lucide-react"
import { CartesianGrid, Dot, Line, LineChart,ResponsiveContainer,XAxis,YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { chartData } from '@/utils/demo-chart-data'
export const description = "A line chart with dots and colors"


const chartConfig = {
  price: {
    label: "Yes",
    color: "var(--chart-2)",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} 
const Chart = ({chartData}) => {
  return (
      <Card className=" shadow-none border-none font-secondary">
          <CardContent className="p-0">
              <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%">
                      <LineChart
                          accessibilityLayer
                          data={chartData}
                          margin={{
                              top: 10,
                              left: -15,
                              right: 20,
                          }}
                      >
                          <CartesianGrid vertical={false} />
                          <XAxis
                              dataKey="time"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={10}
                              interval="preserveStartEnd"
                              minTickGap={30}
                              tickFormatter={(time) => {
                                  const d = new Date(time);
                                  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
                              }}
                          />
                          <YAxis
                              dataKey="price"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={10}
                              domain={[0, 100]}
                              tickFormatter={(value) => `${value}%`}
                          />
                          <ChartTooltip
                              cursor={false}
                              content={
                                  <ChartTooltipContent
                                      indicator="line"
                                      nameKey="price"
                                      hideLabel
                                  />
                              }
                          />
                          <Line
                              dataKey="price"
                              type="monotone"
                              stroke="#1452F0"
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              isAnimationActive
                              animationDuration={300}
                          />
                      </LineChart>
                  </ResponsiveContainer>
              </ChartContainer>
          </CardContent>
      </Card>
  );
}


export default Chart