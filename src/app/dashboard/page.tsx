"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { motion } from "framer-motion";
import {
  RefreshCw,
  HelpCircle,
  MoreHorizontal,
  AlertCircle,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Define interfaces for type safety
interface MetricDataPoint {
  time: string;
  fullTime: Date;
  value: number;
  timestamp: string;
}

interface MetricsData {
  [key: string]: MetricDataPoint[];
}

interface MetricConfig {
  key: string;
  title: string;
  unit: string;
  color: string;
  chartType: "line" | "bar";
  description: string;
}

interface MetricCardProps {
  title: string;
  data: MetricDataPoint[];
  unit: string;
  color: string;
  chartType: "line" | "bar";
  loading: boolean;
  description: string;
}

// Metric descriptions for tooltips
const metricDescriptions: { [key: string]: string } = {
  ApproximateNumberOfMessagesVisible:
    "The number of messages available in the queue for delivery. These are messages that have been sent but not yet received or processed by a consumer.",
  ApproximateNumberOfMessagesDelayed:
    "The number of messages in the queue that are delayed and not immediately available for delivery due to a delay setting.",
  ApproximateNumberOfMessagesNotVisible:
    "The number of messages that have been received by a consumer but are still in flight (e.g., being processed) and not yet deleted.",
  NumberOfMessagesSent:
    "The total number of messages sent to the queue over the selected time period.",
  NumberOfMessagesReceived:
    "The total number of messages retrieved from the queue by consumers over the selected time period.",
  NumberOfMessagesDeleted:
    "The total number of messages removed from the queue after being processed by a consumer over the selected time period.",
};

// Transform API data for chart visualization
const transformMetricsData = (
  rawData: any[],
  hours: number = 24,
): MetricsData => {
  const metricsMap: MetricsData = {};

  // Group data by metric name
  rawData.forEach((item) => {
    if (!metricsMap[item.metric_name]) {
      metricsMap[item.metric_name] = [];
    }
    metricsMap[item.metric_name].push({
      time: new Date(item.timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      fullTime: new Date(item.timestamp),
      value: Number(item.value) || 0,
      timestamp: item.timestamp,
    });
  });

  // Sort by timestamp and filter by time range
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

  Object.keys(metricsMap).forEach((metric) => {
    metricsMap[metric] = metricsMap[metric]
      .filter((item) => item.fullTime >= cutoffTime)
      .sort((a, b) => a.fullTime.getTime() - b.fullTime.getTime());
  });

  return metricsMap;
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  data,
  unit = "Count",
  color,
  chartType = "line",
  loading = false,
  description,
}) => {
  const currentValue =
    data && data.length > 0 ? data[data.length - 1]?.value || 0 : 0;

  if (loading) {
    return (
      <Card className="h-full min-h-[300px] shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </CardTitle>
            <div className="flex items-center gap-3">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <HelpCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-help" />
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="max-w-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-sm text-gray-700 dark:text-gray-300"
                      side="top"
                      align="center"
                    >
                      {description}
                      <Tooltip.Arrow className="fill-white dark:fill-gray-800" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
              <MoreHorizontal className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer" />
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{unit}</div>
        </CardHeader>
        <CardContent className="pt-0 flex items-center justify-center h-[220px]">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-full min-h-[300px] shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </CardTitle>
            <div className="flex items-center gap-3">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <HelpCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-help" />
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="max-w-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-sm text-gray-700 dark:text-gray-300"
                      side="top"
                      align="center"
                    >
                      {description}
                      <Tooltip.Arrow className="fill-white dark:fill-gray-800" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
              <MoreHorizontal className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer" />
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{unit}</div>
        </CardHeader>
        <CardContent className="pt-0 flex items-center justify-center h-[220px]">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
            <div className="text-sm font-medium">No data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full min-h-[300px] shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </CardTitle>
          <div className="flex items-center gap-3">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <HelpCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-help" />
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="max-w-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-sm text-gray-700 dark:text-gray-300"
                    side="top"
                    align="center"
                  >
                    {description}
                    <Tooltip.Arrow className="fill-white dark:fill-gray-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
            <MoreHorizontal className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer" />
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{unit}</div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {Math.round(currentValue)}
        </div>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  className="dark:stroke-gray-600"
                />
                <XAxis
                  dataKey="time"
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                  className="dark:[&>line]:stroke-gray-600 dark:[&>text]:fill-gray-400"
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                  className="dark:[&>line]:stroke-gray-600 dark:[&>text]:fill-gray-400"
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                  domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                    color: "#1f2937",
                  }}
                  className="dark:[&>div]:bg-gray-800 dark:[&>div]:border-gray-700 dark:[&>div]:text-gray-300"
                  labelStyle={{ color: "#1f2937", fontWeight: "500" }}
                />
                <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  className="dark:stroke-gray-600"
                />
                <XAxis
                  dataKey="time"
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                  className="dark:[&>line]:stroke-gray-600 dark:[&>text]:fill-gray-400"
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                  className="dark:[&>line]:stroke-gray-600 dark:[&>text]:fill-gray-400"
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                  domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                    color: "#1f2937",
                  }}
                  className="dark:[&>div]:bg-gray-800 dark:[&>div]:border-gray-700 dark:[&>div]:text-gray-300"
                  labelStyle={{ color: "#1f2937", fontWeight: "500" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: color,
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        {data.length > 0 && (
          <div className="flex justify-between items-center mt-3 text-xs text-gray-500 dark:text-gray-400">
            <span>{data[0]?.time}</span>
            <span>{data[data.length - 1]?.time}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SQSMetricsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>("24h");
  const [metricsData, setMetricsData] = useState<MetricsData>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { getToken } = useAuth();

  const metrics: MetricConfig[] = [
    {
      key: "ApproximateNumberOfMessagesVisible",
      title: "Messages Visible",
      unit: "Count",
      color: "#2563eb", // Blue
      chartType: "line",
      description: metricDescriptions.ApproximateNumberOfMessagesVisible,
    },
    {
      key: "ApproximateNumberOfMessagesDelayed",
      title: "Messages Delayed",
      unit: "Count",
      color: "#dc2626", // Red
      chartType: "line",
      description: metricDescriptions.ApproximateNumberOfMessagesDelayed,
    },
    {
      key: "ApproximateNumberOfMessagesNotVisible",
      title: "Messages Not Visible",
      unit: "Count",
      color: "#059669", // Green
      chartType: "line",
      description: metricDescriptions.ApproximateNumberOfMessagesNotVisible,
    },
    {
      key: "NumberOfMessagesSent",
      title: "Messages Sent",
      unit: "Count",
      color: "#d97706", // Amber
      chartType: "bar",
      description: metricDescriptions.NumberOfMessagesSent,
    },
    {
      key: "NumberOfMessagesReceived",
      title: "Messages Received",
      unit: "Count",
      color: "#7c3aed", // Purple
      chartType: "bar",
      description: metricDescriptions.NumberOfMessagesReceived,
    },
    {
      key: "NumberOfMessagesDeleted",
      title: "Messages Deleted",
      unit: "Count",
      color: "#0891b2", // Cyan
      chartType: "bar",
      description: metricDescriptions.NumberOfMessagesDeleted,
    },
  ];

  const fetchMetrics = async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(`${API_BASE_URL}/sqs/metrics-timeline`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const rawData = await response.json();

      const hours =
        timeRange === "1h"
          ? 1
          : timeRange === "3h"
            ? 3
            : timeRange === "12h"
              ? 12
              : 24;
      const transformedData = transformMetricsData(rawData, hours);

      setMetricsData(transformedData);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Error fetching metrics:", err);
      setError(err.message || "Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchMetrics();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          SQS Metrics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          Real-time monitoring of your SQS queue metrics
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300"
        >
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Time Range:
          </span>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem
                value="1h"
                className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                1 Hour
              </SelectItem>
              <SelectItem
                value="3h"
                className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                3 Hours
              </SelectItem>
              <SelectItem
                value="12h"
                className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                12 Hours
              </SelectItem>
              <SelectItem
                value="24h"
                className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                24 Hours
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last updated:{" "}
              {lastUpdated.toLocaleTimeString("en-US", { hour12: true })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full"
          >
            <MetricCard
              title={metric.title}
              data={metricsData[metric.key] || []}
              unit={metric.unit}
              color={metric.color}
              chartType={metric.chartType}
              loading={loading}
              description={metric.description}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SQSMetricsDashboard;
