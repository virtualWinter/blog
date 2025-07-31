'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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

interface AnalyticsMultiChartProps {
  title: string;
  description: string;
  data: Array<{
    date: string;
    [key: string]: string | number;
  }>;
  metrics: Array<{
    key: string;
    label: string;
    color: string;
  }>;
  formatValue?: (value: number) => string;
}

export function AnalyticsMultiChart({
  title,
  description,
  data,
  metrics,
  formatValue = (value) => value.toString(),
}: AnalyticsMultiChartProps) {
  const chartConfig = metrics.reduce((config, metric) => {
    config[metric.key] = {
      label: metric.label,
      color: metric.color,
    };
    return config;
  }, {} as ChartConfig);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatValue}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            {metrics.map((metric, index) => (
              <Area
                key={metric.key}
                dataKey={metric.key}
                type="natural"
                fill={metric.color}
                fillOpacity={0.4}
                stroke={metric.color}
                stackId={index === 0 ? 'a' : undefined}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}