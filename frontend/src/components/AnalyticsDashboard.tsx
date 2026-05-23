import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import StatCard from "./StatCard";
import { Users, Calendar, Eye, TrendingUp } from "lucide-react";

const registrationData = [
  { name: "Tech Summit", registrations: 1243 },
  { name: "Workshop", registrations: 567 },
  { name: "Hackathon", registrations: 891 },
  { name: "AI Conf", registrations: 2100 },
  { name: "Design Meet", registrations: 456 },
  { name: "Startup Night", registrations: 789 },
];

const categoryData = [
  { name: "Technology", value: 35, color: "hsl(263, 70%, 58%)" },
  { name: "Design", value: 25, color: "hsl(187, 94%, 43%)" },
  { name: "Business", value: 20, color: "hsl(142, 71%, 45%)" },
  { name: "Marketing", value: 20, color: "hsl(38, 92%, 50%)" },
];

const trendData = [
  { month: "Jan", visitors: 2400, registrations: 1200 },
  { month: "Feb", visitors: 3100, registrations: 1800 },
  { month: "Mar", visitors: 4200, registrations: 2400 },
  { month: "Apr", visitors: 3800, registrations: 2100 },
  { month: "May", visitors: 5100, registrations: 3200 },
  { month: "Jun", visitors: 4800, registrations: 2900 },
];

const AnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">Track your event performance and engagement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Registrations" value="6,046" change="+12.5% from last month" changeType="positive" icon={Users} />
        <StatCard title="Active Events" value="14" change="+3 new this week" changeType="positive" icon={Calendar} iconBg="bg-accent/10" iconColor="text-accent" />
        <StatCard title="Page Views" value="24.5K" change="+8.2% from last month" changeType="positive" icon={Eye} iconBg="bg-success/10" iconColor="text-success" />
        <StatCard title="Conversion Rate" value="18.3%" change="-2.1% from last month" changeType="negative" icon={TrendingUp} iconBg="bg-warning/10" iconColor="text-warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="ef-card">
          <h3 className="font-display font-semibold text-foreground mb-6">Registrations by Event</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={registrationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid hsl(214, 32%, 91%)",
                  borderRadius: "12px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                }}
              />
              <Bar dataKey="registrations" fill="hsl(263, 70%, 58%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="ef-card">
          <h3 className="font-display font-semibold text-foreground mb-6">Event Categories</h3>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="50%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                  <span className="text-sm text-foreground">{cat.name}</span>
                  <span className="text-sm font-semibold text-foreground ml-auto">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="ef-card">
        <h3 className="font-display font-semibold text-foreground mb-6">Visitor & Registration Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
            <Tooltip
              contentStyle={{
                background: "white",
                border: "1px solid hsl(214, 32%, 91%)",
                borderRadius: "12px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
              }}
            />
            <Line type="monotone" dataKey="visitors" stroke="hsl(187, 94%, 43%)" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="registrations" stroke="hsl(263, 70%, 58%)" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
