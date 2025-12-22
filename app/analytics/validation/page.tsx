import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { createClient } from "@/lib/supabase/server";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
}

function MetricCard({ title, value, change }: MetricCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground mt-1">{change}</p>
        )}
      </CardContent>
    </Card>
  );
}

async function getValidationMetrics() {
  const supabase = await createClient();

  // Mock data for validation metrics
  const mlAccuracyData = [
    { month: "Jan", accuracy: 92.5 },
    { month: "Feb", accuracy: 93.2 },
    { month: "Mar", accuracy: 94.1 },
    { month: "Apr", accuracy: 93.8 },
    { month: "May", accuracy: 95.0 },
    { month: "Jun", accuracy: 94.7 },
  ];

  const vettingPerformance = [
    { category: "Documents", approved: 85, rejected: 12, pending: 3 },
    { category: "Location", approved: 78, rejected: 18, pending: 4 },
    { category: "Photos", approved: 92, rejected: 6, pending: 2 },
    { category: "Pricing", approved: 88, rejected: 9, pending: 3 },
  ];

  // Placeholder for real queries
  const totalValidations = 15420;
  const avgProcessingTime = "2.4 days";
  const approvalRate = "87.3%";

  return {
    totalValidations,
    avgProcessingTime,
    approvalRate,
    mlAccuracyData,
    vettingPerformance,
  };
}

export default async function ValidationPage() {
  const metrics = await getValidationMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Validation Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          ML validation performance, vetting team metrics, and approval pipeline
          analytics.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Validations"
          value={metrics.totalValidations.toLocaleString()}
          change="+12% from last month"
        />
        <MetricCard
          title="Avg. Processing Time"
          value={metrics.avgProcessingTime}
          change="-8% from last month"
        />
        <MetricCard
          title="Overall Approval Rate"
          value={metrics.approvalRate}
          change="+3% from last month"
        />
      </div>

      {/* ML Accuracy Trend */}
      <Card className="bg-card border-border">
        <CardHeader>
          <h2 className="text-xl font-semibold text-foreground">
            ML Validation Accuracy
          </h2>
          <p className="text-sm text-muted-foreground">
            Monthly accuracy rates for automated property validation
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={metrics.mlAccuracyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                domain={[90, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Accuracy"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#ADF434"
                strokeWidth={3}
                dot={{ fill: "#ADF434", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Vetting Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">
              Vetting Category Performance
            </h2>
            <p className="text-sm text-muted-foreground">
              Approval rates by validation category
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.vettingPerformance}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="category"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar
                  dataKey="approved"
                  stackId="a"
                  fill="#07402F"
                  name="Approved"
                />
                <Bar
                  dataKey="rejected"
                  stackId="a"
                  fill="#2E322E"
                  name="Rejected"
                />
                <Bar
                  dataKey="pending"
                  stackId="a"
                  fill="#ADF434"
                  name="Pending"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Validation Queue Status */}
        <Card className="bg-card border-border">
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">
              Validation Queue Status
            </h2>
            <p className="text-sm text-muted-foreground">
              Current status of properties in validation pipeline
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-sm">ML Validation Complete</span>
                </div>
                <span className="text-sm font-medium">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <span className="text-sm">Awaiting Physical Vetting</span>
                </div>
                <span className="text-sm font-medium">834</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm">Under Review</span>
                </div>
                <span className="text-sm font-medium">456</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-destructive rounded-full"></div>
                  <span className="text-sm">Requires Revision</span>
                </div>
                <span className="text-sm font-medium">123</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
