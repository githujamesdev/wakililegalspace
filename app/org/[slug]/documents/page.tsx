'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Upload,
  Download,
  Share2,
  Trash2,
  Lock,
  Users,
} from 'lucide-react'

const mockDocuments = [
  {
    id: '1',
    title: 'Case Motion Brief',
    fileName: 'motion_brief_2024.pdf',
    fileSize: '2.4 MB',
    caseTitle: 'Smith v. Johnson',
    visibility: 'Private',
    uploadedDate: '2024-05-15',
    uploadedBy: 'You',
  },
  {
    id: '2',
    title: 'Contract Agreement',
    fileName: 'contract_final.docx',
    fileSize: '1.8 MB',
    caseTitle: 'Corporate Merger',
    visibility: 'Team',
    uploadedDate: '2024-05-10',
    uploadedBy: 'Sarah Johnson',
  },
  {
    id: '3',
    title: 'Evidence Documentation',
    fileName: 'evidence_photos.zip',
    fileSize: '15.3 MB',
    caseTitle: 'Property Dispute',
    visibility: 'Private',
    uploadedDate: '2024-05-08',
    uploadedBy: 'You',
  },
]

export default function DocumentsPage() {
  const params = useParams()
  const slug = params.slug as string
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-2">
            Store and manage all case documents
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload a new document to your workspace
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="docTitle">Document Title</Label>
                <Input id="docTitle" placeholder="e.g., Case Motion Brief" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="case">Related Case</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a case" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Smith v. Johnson</SelectItem>
                    <SelectItem value="2">Corporate Merger</SelectItem>
                    <SelectItem value="3">Property Dispute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
              </div>
              <Button className="w-full">Upload Document</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {mockDocuments.map((doc) => (
          <Link
            key={doc.id}
            href={`/org/${slug}/documents/${doc.id}`}
            className="block"
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer hover:bg-accent/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <FileText className="h-10 w-10 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {doc.title}
                      </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {doc.fileName}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{doc.fileSize}</span>
                      <span>{doc.caseTitle}</span>
                      <span>Uploaded {doc.uploadedDate}</span>
                      <span>by {doc.uploadedBy}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      doc.visibility === 'Private'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {doc.visibility === 'Private' ? (
                      <>
                        <Lock className="h-3 w-3" /> Private
                      </>
                    ) : (
                      <>
                        <Users className="h-3 w-3" /> {doc.visibility}
                      </>
                    )}
                  </span>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
