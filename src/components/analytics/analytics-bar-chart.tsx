'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface AnalyticsBarChartProps {
  title: string;
  description: string;
  data: Array<{
    name: string;
    value: number;
    label?: string;
  }>;
  dataKey: string;
  nameKey: string;
  color?: string;
  formatValue?: (value: number) => string;
  maxItems?: number;
}

export function AnalyticsBarChart({
  title,
  description,
  data,
  dataKey,
  nameKey,
  color = 'hsl(var(--chart-1))',
  formatValue = (value) => value.toString(),
  maxItems = 10,
}: AnalyticsBarChartProps) {
  const chartConfig = {
    [dataKey]: {
      label: title,
      color: color,
    },
  } satisfies ChartConfig;

  // Limit the number of items and sort by value
  const chartData = data
    .sort((a, b) => b.value - a.value)
    .slice(0, maxItems)
    .map(item => ({
      [nameKey]: item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name,
      [dataKey]: item.value,
      fullName: item.name,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="horizontal"
            margin={{
              left: 80,
              right: 12,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey={nameKey}
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={80}
              fontSize={12}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatValue}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey={dataKey}
              fill={color}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}