'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Users, MessageSquare, History, Lock, Unlock, Download, Share2, ArrowLeft, Trash2 } from 'lucide-react'

const mockDocuments: Record<string, any> = {
  '1': {
    id: '1',
    title: 'Case Motion Brief',
    fileName: 'motion_brief_2024.pdf',
    fileSize: '2.4 MB',
    caseTitle: 'Smith v. Johnson',
    visibility: 'Private',
    uploadedDate: '2024-05-15',
    uploadedBy: 'You',
    description: 'Motion brief for summary judgment',
  },
  '2': {
    id: '2',
    title: 'Contract Agreement',
    fileName: 'contract_final.docx',
    fileSize: '1.8 MB',
    caseTitle: 'Corporate Merger',
    visibility: 'Team',
    uploadedDate: '2024-05-10',
    uploadedBy: 'Sarah Johnson',
    description: 'Final contract agreement for merger',
  },
  '3': {
    id: '3',
    title: 'Evidence Documentation',
    fileName: 'evidence_photos.zip',
    fileSize: '15.3 MB',
    caseTitle: 'Property Dispute',
    visibility: 'Private',
    uploadedDate: '2024-05-08',
    uploadedBy: 'You',
    description: 'Photographic evidence and documentation',
  },
}

const mockVersions = [
  { version: 3, date: '2024-05-17', size: '1.9 MB', changedBy: 'You', changes: 'Final review' },
  { version: 2, date: '2024-05-16', size: '1.8 MB', changedBy: 'Sarah Johnson', changes: 'Updated clauses' },
  { version: 1, date: '2024-05-15', size: '1.7 MB', changedBy: 'You', changes: 'Initial upload' },
]

const mockComments = [
  { id: '1', author: 'Sarah Johnson', date: '2024-05-17', text: 'This clause needs review' },
  { id: '2', author: 'You', date: '2024-05-16', text: 'Updated - please review changes' },
]

const mockCollaborators = [
  { id: '1', name: 'Sarah Johnson', role: 'Attorney', permission: 'Edit' },
  { id: '2', name: 'You', role: 'Attorney', permission: 'Manage' },
]

const mockActivity = [
  { date: '2024-05-17 14:32', user: 'You', action: 'lock', description: 'Document locked for editing' },
  { date: '2024-05-17 14:30', user: 'You', action: 'comment', description: 'Added comment' },
  { date: '2024-05-16 10:00', user: 'Sarah Johnson', action: 'edit', description: 'Updated document (v2)' },
  { date: '2024-05-15 09:00', user: 'You', action: 'upload', description: 'Uploaded document' },
]

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const id = params.id as string

  const document = mockDocuments[id]

  if (!document) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Document not found</h1>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/org/${slug}/documents`} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documents
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <FileText className="h-12 w-12 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">{document.title}</h1>
              <p className="text-muted-foreground mt-1">{document.fileName}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={document.visibility === 'Private' ? 'secondary' : 'default'}>
                  {document.visibility}
                </Badge>
                <span className="text-sm text-muted-foreground">{document.fileSize}</span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">Uploaded {document.uploadedDate}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Lock className="h-4 w-4 mr-2" />
              Lock for Editing
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Versions
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments
          </TabsTrigger>
          <TabsTrigger value="collaborators" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Collaborators
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <p className="text-foreground mt-1">{document.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">File Name</label>
                  <p className="text-foreground mt-1">{document.fileName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">File Size</label>
                  <p className="text-foreground mt-1">{document.fileSize}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Visibility</label>
                  <p className="text-foreground mt-1">{document.visibility}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Uploaded Date</label>
                  <p className="text-foreground mt-1">{document.uploadedDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Uploaded By</label>
                  <p className="text-foreground mt-1">{document.uploadedBy}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-foreground mt-1">{document.description}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Versions Tab */}
        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>All versions of this document</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockVersions.map((version) => (
                  <div key={version.version} className="border rounded-lg p-4 flex items-start justify-between">
                    <div>
                      <p className="font-medium">Version {version.version}</p>
                      <p className="text-sm text-muted-foreground mt-1">{version.date}</p>
                      <p className="text-sm text-muted-foreground">{version.size} • Changed by {version.changedBy}</p>
                      <p className="text-sm text-foreground mt-2">{version.changes}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Download</Button>
                      {version.version !== 1 && <Button variant="outline" size="sm">Restore</Button>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comments & Feedback</CardTitle>
              <CardDescription>Collaborate with your team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 mb-6">
                {mockComments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{comment.author}</p>
                        <p className="text-sm text-muted-foreground">{comment.date}</p>
                      </div>
                    </div>
                    <p className="text-foreground mt-2">{comment.text}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Add a comment</label>
                <Textarea placeholder="Write your comment..." />
                <Button>Post Comment</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collaborators Tab */}
        <TabsContent value="collaborators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage who can access this document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {mockCollaborators.map((collaborator) => (
                  <div key={collaborator.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{collaborator.name}</p>
                      <p className="text-sm text-muted-foreground">{collaborator.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{collaborator.permission}</Badge>
                      <Button variant="outline" size="sm">Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Complete audit trail of all actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockActivity.map((activity, index) => (
                  <div key={index} className="border-l-2 border-muted pl-4 py-2">
                    <p className="text-sm font-medium">{activity.date} • {activity.user}</p>
                    <p className="text-sm text-foreground mt-1">{activity.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
