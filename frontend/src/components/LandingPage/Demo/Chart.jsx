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
const Chart = () => {
    return (
        <Card className=" shadow-none border-none font-secondary">
            <CardContent className="p-0">
                <ChartContainer config={chartConfig} className="w-full h-[260px] sm:h-[320px] md:h-[360px] min-h-[260px]">
                    <LineChart
                        accessibilityLayer
                        data={chartData.priceHistory}
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
                        />
                        <YAxis
                            dataKey="price"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
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
                            type="natural"
                            stroke="#1452F0"
                            strokeWidth={2}
                            dot={({ payload,index, ...props }) => {
                                return (
                                    <Dot
                                        key={`price-dot-${index}`}
                                        r={3}
                                        cx={props.cx}
                                        cy={props.cy}
                                        fill="#1452F0"
                                        stroke={payload.fill}
                                    />
                                );
                            }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};


export default Chart