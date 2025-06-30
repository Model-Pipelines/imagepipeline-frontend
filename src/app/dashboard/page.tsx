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
import dynamic from "next/dynamic";

const API_BASE_URL = "https://metrics.imagepipeline.io";

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
  error: boolean;
  description: string;
  onRetry: () => void;
}

interface UserPlan {
  user_id: string;
  subscription_id: string;
  plan: string;
  pod_id: string;
  pod_status: string;
  period_start: string;
  period_end: string;
  subscription_status: string;
  sqs: string;
}

// Client-side only tooltip components
const ClientTooltip = dynamic(
  () => import("@radix-ui/react-tooltip").then((mod) => mod.Root),
  { ssr: false },
);

const ClientTooltipTrigger = dynamic(
  () => import("@radix-ui/react-tooltip").then((mod) => mod.Trigger),
  { ssr: false },
);

const ClientTooltipPortal = dynamic(
  () => import("@radix-ui/react-tooltip").then((mod) => mod.Portal),
  { ssr: false },
);

const ClientTooltipContent = dynamic(
  () => import("@radix-ui/react-tooltip").then((mod) => mod.Content),
  { ssr: false },
);

const ClientTooltipArrow = dynamic(
  () => import("@radix-ui/react-tooltip").then((mod) => mod.Arrow),
  { ssr: false },
);

const ClientTooltipProvider = dynamic(
  () => import("@radix-ui/react-tooltip").then((mod) => mod.Provider),
  { ssr: false },
);

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

  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

  Object.keys(metricsMap).forEach((metric) => {
    metricsMap[metric] = metricsMap[metric]
      .filter((item) => item.fullTime >= cutoffTime)
      .sort((a, b) => a.fullTime.getTime() - b.fullTime.getTime());
  });

  return metricsMap;
};

// Client-side only component wrapper
const ClientOnlyWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  data,
  unit = "Count",
  color,
  chartType = "line",
  loading = false,
  error = false,
  description,
  onRetry,
}) => {
  const currentValue =
    data && data.length > 0 ? data[data.length - 1]?.value || 0 : 0;

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="h-full min-h-[300px] shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </CardTitle>
              <div className="flex items-center gap-3">
                <ClientOnlyWrapper>
                  <ClientTooltipProvider>
                    <ClientTooltip>
                      <ClientTooltipTrigger asChild>
                        <HelpCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-help" />
                      </ClientTooltipTrigger>
                      <ClientTooltipPortal>
                        <ClientTooltipContent
                          className="max-w-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-sm text-gray-700 dark:text-gray-300"
                          side="top"
                          align="center"
                        >
                          {description}
                          <ClientTooltipArrow className="fill-white dark:fill-gray-800" />
                        </ClientTooltipContent>
                      </ClientTooltipPortal>
                    </ClientTooltip>
                  </ClientTooltipProvider>
                </ClientOnlyWrapper>
                <MoreHorizontal className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer" />
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {unit}
            </div>
          </CardHeader>
          <CardContent className="pt-0 flex items-center justify-center h-[220px]">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
              </motion.div>
              <div className="text-sm font-medium mb-4">
                Something went wrong
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="flex items-center gap-2 bg-gray-800 text-gray-200 border-gray-700 shadow-sm hover:bg-gray-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <Card className="h-full min-h-[300px] shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </CardTitle>
            <div className="flex items-center gap-3">
              <ClientOnlyWrapper>
                <ClientTooltipProvider>
                  <ClientTooltip>
                    <ClientTooltipTrigger asChild>
                      <HelpCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-help" />
                    </ClientTooltipTrigger>
                    <ClientTooltipPortal>
                      <ClientTooltipContent
                        className="max-w-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-sm text-gray-700 dark:text-gray-300"
                        side="top"
                        align="center"
                      >
                        {description}
                        <ClientTooltipArrow className="fill-white dark:fill-gray-800" />
                      </ClientTooltipContent>
                    </ClientTooltipPortal>
                  </ClientTooltip>
                </ClientTooltipProvider>
              </ClientOnlyWrapper>
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
              <ClientOnlyWrapper>
                <ClientTooltipProvider>
                  <ClientTooltip>
                    <ClientTooltipTrigger asChild>
                      <HelpCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-help" />
                    </ClientTooltipTrigger>
                    <ClientTooltipPortal>
                      <ClientTooltipContent
                        className="max-w-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-sm text-gray-700 dark:text-gray-300"
                        side="top"
                        align="center"
                      >
                        {description}
                        <ClientTooltipArrow className="fill-white dark:fill-gray-800" />
                      </ClientTooltipContent>
                    </ClientTooltipPortal>
                  </ClientTooltip>
                </ClientTooltipProvider>
              </ClientOnlyWrapper>
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
            <ClientOnlyWrapper>
              <ClientTooltipProvider>
                <ClientTooltip>
                  <ClientTooltipTrigger asChild>
                    <HelpCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-help" />
                  </ClientTooltipTrigger>
                  <ClientTooltipPortal>
                    <ClientTooltipContent
                      className="max-w-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-sm text-gray-700 dark:text-gray-300"
                      side="top"
                      align="center"
                    >
                      {description}
                      <ClientTooltipArrow className="fill-white dark:fill-gray-800" />
                    </ClientTooltipContent>
                  </ClientTooltipPortal>
                </ClientTooltip>
              </ClientTooltipProvider>
            </ClientOnlyWrapper>
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
  const [error, setError] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [sqsUrl, setSqsUrl] = useState<string | null>(null);
  const { getToken, userId } = useAuth();

  const metrics: MetricConfig[] = [
    {
      key: "ApproximateNumberOfMessagesVisible",
      title: "Messages Visible",
      unit: "Count",
      color: "#2563eb",
      chartType: "line",
      description: metricDescriptions.ApproximateNumberOfMessagesVisible,
    },
    {
      key: "ApproximateNumberOfMessagesDelayed",
      title: "Messages Delayed",
      unit: "Count",
      color: "#dc2626",
      chartType: "line",
      description: metricDescriptions.ApproximateNumberOfMessagesDelayed,
    },
    {
      key: "ApproximateNumberOfMessagesNotVisible",
      title: "Messages Not Visible",
      unit: "Count",
      color: "#059669",
      chartType: "line",
      description: metricDescriptions.ApproximateNumberOfMessagesNotVisible,
    },
    {
      key: "NumberOfMessagesSent",
      title: "Messages Sent",
      unit: "Count",
      color: "#d97706",
      chartType: "bar",
      description: metricDescriptions.NumberOfMessagesSent,
    },
    {
      key: "NumberOfMessagesReceived",
      title: "Messages Received",
      unit: "Count",
      color: "#7c3aed",
      chartType: "bar",
      description: metricDescriptions.NumberOfMessagesReceived,
    },
    {
      key: "NumberOfMessagesDeleted",
      title: "Messages Deleted",
      unit: "Count",
      color: "#0891b2",
      chartType: "bar",
      description: metricDescriptions.NumberOfMessagesDeleted,
    },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchUserPlan = async () => {
    if (!userId) {
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const token = await getToken();
      if (!token) {
        setError(true);
        return;
      }

      const response = await fetch(
        `https://api.imagepipeline.io/user/${userId}/subscriptions`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        setError(true);
        return;
      }

      const userPlan: UserPlan = await response.json();
      if (!userPlan.sqs) {
        setError(true);
        return;
      }

      setSqsUrl(userPlan.sqs);
    } catch (err: any) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    if (!sqsUrl) {
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const token = await getToken();
      if (!token) {
        setError(true);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/sqs/metrics-timeline?sqs_url=${encodeURIComponent(sqsUrl)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        setError(true);
        return;
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
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(false);
    if (userId && !sqsUrl) {
      fetchUserPlan();
    } else if (sqsUrl) {
      fetchMetrics();
    }
  };

  const handleRefresh = () => {
    setError(false);
    fetchMetrics();
  };

  useEffect(() => {
    if (isClient && userId) {
      fetchUserPlan();
    }
  }, [isClient, userId]);

  useEffect(() => {
    if (isClient && sqsUrl) {
      fetchMetrics();
    }
  }, [timeRange, isClient, sqsUrl]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-3xl font-bold text-gray-100 mb-4">
          SQS Metrics Dashboard
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Real-time monitoring of your SQS queue metrics
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-300">Time Range:</span>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-gray-800 text-gray-200 border-gray-700 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem
                value="1h"
                className="text-gray-200 hover:bg-gray-700"
              >
                1 Hour
              </SelectItem>
              <SelectItem
                value="3h"
                className="text-gray-200 hover:bg-gray-700"
              >
                3 Hours
              </SelectItem>
              <SelectItem
                value="12h"
                className="text-gray-200 hover:bg-gray-700"
              >
                12 Hours
              </SelectItem>
              <SelectItem
                value="24h"
                className="text-gray-200 hover:bg-gray-700"
              >
                24 Hours
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Last updated:{" "}
              {lastUpdated.toLocaleTimeString("en-US", { hour12: true })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || !sqsUrl}
            className="flex items-center gap-2 bg-gray-800 text-gray-200 border-gray-700 shadow-sm hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

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
              error={error}
              description={metric.description}
              onRetry={handleRetry}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SQSMetricsDashboard;
