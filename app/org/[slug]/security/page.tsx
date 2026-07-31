import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Shield, Download, AlertCircle } from 'lucide-react'

const auditLogs = [
  {
    id: '1',
    timestamp: '2024-06-05 14:30:22',
    user: 'you@example.com',
    action: 'Case Created',
    entity: 'Smith v. Johnson',
    status: 'success',
    details: 'New litigation case created',
  },
  {
    id: '2',
    timestamp: '2024-06-05 14:15:45',
    user: 'sarah@example.com',
    action: 'Document Shared',
    entity: 'motion_brief.pdf',
    status: 'success',
    details: 'Shared with john@example.com',
  },
  {
    id: '3',
    timestamp: '2024-06-05 13:42:10',
    user: 'you@example.com',
    action: 'Case Updated',
    entity: 'Corporate Merger',
    status: 'success',
    details: 'Status changed to In Progress',
  },
  {
    id: '4',
    timestamp: '2024-06-05 12:20:33',
    user: 'admin@example.com',
    action: 'User Added',
    entity: 'sarah@example.com',
    status: 'success',
    details: 'Added as Admin to organization',
  },
  {
    id: '5',
    timestamp: '2024-06-04 16:55:02',
    user: 'you@example.com',
    action: 'Password Changed',
    entity: 'User Account',
    status: 'success',
    details: 'Security: Password updated',
  },
]

const securityMetrics = [
  {
    label: 'Encryption',
    value: 'AES-256',
    description: 'All data encrypted at rest',
  },
  {
    label: 'Authentication',
    value: 'MFA Ready',
    description: 'Multi-factor authentication available',
  },
  {
    label: 'HTTPS',
    value: 'Enabled',
    description: 'TLS 1.3 for all connections',
  },
  {
    label: 'Compliance',
    value: 'GDPR Ready',
    description: 'Data privacy compliance',
  },
]

export default function SecurityPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Security & Compliance</h1>
        <p className="text-muted-foreground mt-2">
          Monitor security events and audit trails
        </p>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {securityMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">
                {metric.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Features */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">
                Data Encryption
              </h3>
              <p className="text-sm text-muted-foreground">
                All sensitive data is encrypted using AES-256 encryption at rest
                and TLS 1.3 in transit.
              </p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">
                Row Level Security
              </h3>
              <p className="text-sm text-muted-foreground">
                Data is isolated per organization with per-user scoping to prevent
                cross-tenant access.
              </p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">
                Audit Logging
              </h3>
              <p className="text-sm text-muted-foreground">
                All actions are logged with timestamps, user information, and
                details for compliance tracking.
              </p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">
                Role-Based Access
              </h3>
              <p className="text-sm text-muted-foreground">
                Control access with Owner, Admin, and Member roles for fine-grained
                permission management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Audit Log</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">{log.timestamp}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>{log.entity}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.details}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-600">
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Security Alerts & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="border-l-4 border-yellow-600 pl-4 py-2">
              <p className="font-semibold text-foreground">
                Enable Two-Factor Authentication
              </p>
              <p className="text-sm text-muted-foreground">
                Enhance your account security by enabling 2FA for all team members
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Enable 2FA
              </Button>
            </div>
            <div className="border-l-4 border-green-600 pl-4 py-2">
              <p className="font-semibold text-foreground">
                GDPR Compliance Achieved
              </p>
              <p className="text-sm text-muted-foreground">
                Your organization meets GDPR requirements for data protection
              </p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4 py-2">
              <p className="font-semibold text-foreground">
                Regular Security Backups
              </p>
              <p className="text-sm text-muted-foreground">
                Daily automated backups are configured and encryption-protected
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
