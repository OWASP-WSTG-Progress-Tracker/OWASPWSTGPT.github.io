import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "./StatusBadge";
import { EvidenceUpload } from "./EvidenceUpload";
import { OwaspTest, TestResult } from "@/data/owaspTests";
import { ExternalLink, FileImage } from "lucide-react";
import { useState } from "react";

interface TestCardProps {
  test: OwaspTest;
  result?: TestResult;
  onUpdateResult: (testId: string, result: Partial<TestResult>) => void;
}

export function TestCard({ test, result, onUpdateResult }: TestCardProps) {
  const [notes, setNotes] = useState(result?.notes || '');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusChange = (status: TestResult['status']) => {
    onUpdateResult(test.id, { 
      status, 
      lastUpdated: new Date() 
    });
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    onUpdateResult(test.id, { 
      notes: newNotes, 
      lastUpdated: new Date() 
    });
  };

  const handleEvidenceUpload = (evidence: any[]) => {
    onUpdateResult(test.id, { 
      evidence, 
      lastUpdated: new Date() 
    });
  };

  return (
    <Card className="card-glow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="test-id text-primary">{test.id}</span>
              {test.reference && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-muted-foreground hover:text-primary"
                  onClick={() => window.open(test.reference, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
            <CardTitle className="text-base leading-tight">{test.name}</CardTitle>
          </div>
          <StatusBadge status={result?.status || 'not-started'} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{test.description}</p>
        
        <div className="flex gap-2">
          <Select
            value={result?.status || 'not-started'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Details'}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Notes & Findings</label>
              <Textarea
                placeholder="Add your testing notes, findings, and observations..."
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Evidence</label>
              <EvidenceUpload
                testId={test.id}
                evidence={result?.evidence || []}
                onEvidenceChange={handleEvidenceUpload}
              />
            </div>

            {result?.evidence && result.evidence.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Attached Evidence</label>
                <div className="evidence-grid">
                  {result.evidence.map((file) => (
                    <div
                      key={file.id}
                      className="relative group border rounded-lg p-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs truncate flex-1">{file.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {result?.lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {result.lastUpdated.toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}