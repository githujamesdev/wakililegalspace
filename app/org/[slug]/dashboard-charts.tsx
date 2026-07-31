'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const mockChartData = [
  { name: 'Jan', cases: 4, documents: 24, tasks: 12 },
  { name: 'Feb', cases: 3, documents: 18, tasks: 15 },
  { name: 'Mar', cases: 5, documents: 30, tasks: 20 },
  { name: 'Apr', cases: 4, documents: 25, tasks: 18 },
  { name: 'May', cases: 6, documents: 35, tasks: 25 },
  { name: 'Jun', cases: 5, documents: 28, tasks: 22 },
]

const caseStatusData = [
  { name: 'Open', value: 8, color: '#3b82f6' },
  { name: 'Closed', value: 4, color: '#10b981' },
  { name: 'On Hold', value: 2, color: '#f59e0b' },
]

export function ActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={mockChartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" stroke="var(--muted-foreground)" />
        <YAxis stroke="var(--muted-foreground)" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey="cases" fill="var(--primary)" />
        <Bar dataKey="documents" fill="var(--accent)" />
        <Bar dataKey="tasks" fill="var(--secondary-foreground)" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CaseStatusChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={caseStatusData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {caseStatusData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}