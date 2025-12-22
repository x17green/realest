import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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

async function getTeamMetrics() {
  const supabase = await createClient();

  // Mock data for team performance
  const teamPerformance = [
    { name: "Adebayo K.", validations: 245, avgTime: 2.1, accuracy: 94 },
    { name: "Chioma N.", validations: 223, avgTime: 2.3, accuracy: 96 },
    { name: "Emeka O.", validations: 198, avgTime: 2.5, accuracy: 92 },
    { name: "Funmi A.", validations: 267, avgTime: 1.9, accuracy: 97 },
    { name: "Gbenga T.", validations: 189, avgTime: 2.7, accuracy: 91 },
  ];

  const teamSkills = [
    {
      skill: "Document Verification",
      A: 95,
      B: 90,
      C: 85,
      D: 88,
      E: 92,
      fullMark: 100,
    },
    {
      skill: "Location Assessment",
      A: 88,
      B: 92,
      C: 78,
      D: 95,
      E: 89,
      fullMark: 100,
    },
    {
      skill: "Photo Analysis",
      A: 92,
      B: 96,
      C: 89,
      D: 91,
      E: 94,
      fullMark: 100,
    },
    {
      skill: "Pricing Validation",
      A: 89,
      B: 87,
      C: 91,
      D: 93,
      E: 86,
      fullMark: 100,
    },
    {
      skill: "Compliance Check",
      A: 96,
      B: 94,
      C: 93,
      D: 97,
      E: 95,
      fullMark: 100,
    },
  ];

  // Placeholder for real queries
  const activeVettingAgents = 12;
  const avgResponseTime = "4.2 hours";
  const teamSatisfaction = "4.8/5";

  return {
    activeVettingAgents,
    avgResponseTime,
    teamSatisfaction,
    teamPerformance,
    teamSkills,
  };
}

export default async function TeamPage() {
  const metrics = await getTeamMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Team Performance Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Vetting team metrics, individual performance tracking, and team
          efficiency analytics.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Active Vetting Agents"
          value={metrics.activeVettingAgents}
          change="+2 from last month"
        />
        <MetricCard
          title="Avg. Response Time"
          value={metrics.avgResponseTime}
          change="-12% from last month"
        />
        <MetricCard
          title="Team Satisfaction"
          value={metrics.teamSatisfaction}
          change="Stable"
        />
      </div>

      {/* Individual Performance Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <h2 className="text-xl font-semibold text-foreground">
            Individual Agent Performance
          </h2>
          <p className="text-sm text-muted-foreground">
            Monthly validations, average processing time, and accuracy rates
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={metrics.teamPerformance}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                yAxisId="left"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="validations"
                fill="#07402F"
                name="Validations"
              />
              <Bar
                yAxisId="right"
                dataKey="accuracy"
                fill="#ADF434"
                name="Accuracy %"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Team Skills Radar and Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">
              Team Skills Assessment
            </h2>
            <p className="text-sm text-muted-foreground">
              Skill proficiency across different validation categories
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={metrics.teamSkills}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Radar
                  name="Adebayo K."
                  dataKey="A"
                  stroke="#07402F"
                  fill="#07402F"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Chioma N."
                  dataKey="B"
                  stroke="#2E322E"
                  fill="#2E322E"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Funmi A."
                  dataKey="D"
                  stroke="#ADF434"
                  fill="#ADF434"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="bg-card border-border">
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">
              Top Performers This Month
            </h2>
            <p className="text-sm text-muted-foreground">
              Agents with highest validation accuracy and efficiency
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Funmi Adeyemi</p>
                    <p className="text-sm text-muted-foreground">
                      267 validations • 97% accuracy
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-success">⭐ 4.9</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Chioma Nwosu</p>
                    <p className="text-sm text-muted-foreground">
                      223 validations • 96% accuracy
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-success">⭐ 4.8</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Adebayo Kuti</p>
                    <p className="text-sm text-muted-foreground">
                      245 validations • 94% accuracy
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-success">⭐ 4.7</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
