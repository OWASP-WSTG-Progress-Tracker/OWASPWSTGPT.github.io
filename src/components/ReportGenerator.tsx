import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TestResult, OwaspTest } from "@/data/owaspTests";
import { Download, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { report } from "process";

interface ReportGeneratorProps {
  testResults: Record<string, TestResult>;
  allTests: OwaspTest[];
}

export function ReportGenerator({ testResults, allTests }: ReportGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Report configuration state
  const [reportConfig, setReportConfig] = useState({
    applicationName: '',
    applicationUrl: '',
    generatedBy: '',
    assessmentDepartment: '',
    businessUnit: '',
    applicationOwner: '',
    executiveSummary: '',
    includeStatusFilters: {
      done: true,
      blocked: true,
      'not-applicable': true,
      'in-progress': true,
      'not-started': true
    }
  });

  const getStats = () => {
    const total = allTests.length;
    const completed = Object.values(testResults).filter(r => r.status === 'done').length;
    const inProgress = Object.values(testResults).filter(r => r.status === 'in-progress').length;
    const blocked = Object.values(testResults).filter(r => r.status === 'blocked').length;
    const notStarted = total - completed - inProgress - blocked;
    
    return { total, completed, inProgress, blocked, notStarted };
  };

  const generatePDFReport = async () => {
    setGenerating(true);
    
    try {
      const stats = getStats();
      
      // Filter test results based on selected status filters
      const filteredTestResults = Object.entries(testResults).filter(([_, result]) => {
        return reportConfig.includeStatusFilters[result.status as keyof typeof reportConfig.includeStatusFilters];
      });
      
      const reportData = {
        metadata: {
          title: "OWASP WSTG Security Testing Compliance Report",
          generatedAt: new Date().toISOString(),
          generatedBy: reportConfig.generatedBy,
          assessmentDepartment: reportConfig.assessmentDepartment,
          applicationName: reportConfig.applicationName,
          applicationUrl: reportConfig.applicationUrl,
          businessUnit: reportConfig.businessUnit,
          applicationOwner: reportConfig.applicationOwner,
          executiveSummary: reportConfig.executiveSummary
        },
        summary: stats,
        testResults: filteredTestResults.map(([testId, result]) => {
          const test = allTests.find(t => t.id === testId);
          return {
            test,
            result
          };
        }),
        findings: filteredTestResults
          .filter(([_, result]) => result.notes && result.notes.trim())
          .map(([testId, result]) => {
            const test = allTests.find(t => t.id === testId);
            return {
              testId,
              testName: test?.name || 'Unknown Test',
              status: result.status,
              notes: result.notes,
              evidence: result.evidence || []
            };
          })
      };

      // Create a simple HTML report that can be printed to PDF
      const htmlReport = generateHTMLReport(reportData);
      
      // Open in new window for printing
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlReport);
        newWindow.document.close();
        
        // Auto-trigger print dialog
        setTimeout(() => {
          newWindow.print();
        }, 1000);
      }

      toast({
        title: "Report generated",
        description: "Your PDF report has been opened in a new window. Use your browser's print function to save as PDF."
      });

    } catch (error) {
      toast({
        title: "Report generation failed",
        description: "Failed to generate the report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
      setIsOpen(false);
    }
  };

  const generateHTMLReport = (data: any) => {
    const { metadata, summary, findings } = data;
    const completionPercentage = summary.total > 0 ? ((summary.completed / summary.total) * 100).toFixed(1) : '0';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${metadata.title}</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              margin: 0; 
              padding: 20px; 
              color: #333; 
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #4f46e5; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .header h1 { 
              color: #4f46e5; 
              margin: 0; 
              font-size: 28px; 
            }
            .metadata { 
              color: #666; 
              font-size: 14px; 
              margin-top: 10px; 
            }
            .summary { 
              background: #f8fafc; 
              padding: 20px; 
              border-radius: 8px; 
              margin-bottom: 30px; 
            }
            .summary h2 { 
              margin-top: 0; 
              color: #1e293b; 
            }
            .stats-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 15px; 
              margin-top: 15px; 
            }
            .stat-item { 
              background: white; 
              padding: 15px; 
              border-radius: 6px; 
              border-left: 4px solid #4f46e5; 
            }
            .stat-value { 
              font-size: 24px; 
              font-weight: bold; 
              color: #4f46e5; 
            }
            .stat-label { 
              color: #666; 
              font-size: 14px; 
            }
            .findings { 
              margin-top: 30px; 
            }
            .finding { 
              border: 1px solid #e2e8f0; 
              border-radius: 8px; 
              margin-bottom: 20px; 
              overflow: hidden; 
            }
            .finding-header { 
              background: #f1f5f9; 
              padding: 15px; 
              font-weight: bold; 
            }
            .finding-content { 
              padding: 15px; 
            }
            .status-badge { 
              display: inline-block; 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-size: 12px; 
              font-weight: bold; 
              text-transform: uppercase; 
            }
            .status-done { 
              background: #dcfce7; 
              color: #166534; 
            }
            .status-in-progress { 
              background: #fef3c7; 
              color: #92400e; 
            }
            .status-blocked { 
              background: #fee2e2; 
              color: #991b1b; 
            }
            .status-not-started { 
              background: #f1f5f9; 
              color: #475569; 
            }
            .evidence-count { 
              color: #666; 
              font-size: 14px; 
              margin-top: 10px; 
            }
            @media print {
              body { margin: 0; }
              .header { page-break-after: avoid; }
              .finding { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${metadata.title}</h1>
            <div class="metadata">
              <p>Generated on: ${new Date(metadata.generatedAt).toLocaleString()}</p>
              ${metadata.applicationName ? `<p><strong>Application:</strong> ${metadata.applicationName}</p>` : ''}
              ${metadata.applicationUrl ? `<p><strong>URL:</strong> ${metadata.applicationUrl}</p>` : ''}
              ${metadata.generatedBy ? `<p><strong>Generated By:</strong> ${metadata.generatedBy}</p>` : ''}
              ${metadata.assessmentDepartment ? `<p><strong>Assessor Department:</strong> ${metadata.assessmentDepartment}</p>` : ''}
              ${metadata.businessUnit ? `<p><strong>Business Unit:</strong> ${metadata.businessUnit}</p>` : ''}
              ${metadata.applicationOwner ? `<p><strong>Application Owner:</strong> ${metadata.applicationOwner}</p>` : ''}

            </div>
          </div>

          <div class="summary">
            <h2>Executive Summary</h2>
            <p>${metadata.executiveSummary || 'This report provides a comprehensive overview of the OWASP Web Security Testing Guide (WSTG) assessment progress and findings.'}</p>
            
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">${completionPercentage}%</div>
                <div class="stat-label">Overall Completion</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${summary.completed}</div>
                <div class="stat-label">Tests Completed</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${summary.inProgress}</div>
                <div class="stat-label">In Progress</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${summary.blocked}</div>
                <div class="stat-label">Not Applicable</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${summary.inProgress}</div>
                <div class="stat-label">In Progress</div>
              </div>          
            </div>  
          <div class="findings">
            <h2>Detailed Findings</h2>
            ${findings.length === 0 ? 
              '<p>No detailed findings or notes have been recorded yet.</p>' : 
              findings.map((finding: any) => `
                <div class="finding">
                  <div class="finding-header">
                    ${finding.testId}: ${finding.testName}
                    <span class="status-badge status-${finding.status}">${finding.status.replace('-', ' ')}</span>
                  </div>
                  <div class="finding-content">
                    <strong>Notes:</strong>
                    <p>${finding.notes}</p>
                    ${finding.evidence.length > 0 ? 
                      `<div class="evidence-count">Evidence files attached: ${finding.evidence.length}</div>` : 
                      ''
                    }
                  </div>
                </div>
              `).join('')
            }
          </div>
        </body>
      </html>
    `;
  };

  const stats = getStats();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-primary text-primary-foreground">
          <Download className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Security Testing Report
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appName">Application Name</Label>
                  <Input
                    id="appName"
                    value={reportConfig.applicationName}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, applicationName: e.target.value }))}
                    placeholder="My Web Application"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appUrl">Application URL</Label>
                  <Input
                    id="appUrl"
                    value={reportConfig.applicationUrl}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, applicationUrl: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Assessor Name</Label>
                  <Input
                    id="ownerName"
                    value={reportConfig.generatedBy}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, generatedBy: e.target.value }))}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerDep">Assessor Unit</Label>
                  <Input
                    id="ownerDep"
                    value={reportConfig.assessmentDepartment}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, assessmentDepartment: e.target.value }))}
                    placeholder="Application Security Team"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessUnit">Business Unit</Label>
                  <Input
                    id="businessUnit"
                    value={reportConfig.businessUnit}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, businessUnit: e.target.value }))}
                    placeholder="E-Commerce"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appOwner">Application Owner</Label>
                  <Input
                    id="appOwner"
                    value={reportConfig.applicationOwner}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, applicationOwner: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="execSummary">Executive Summary</Label>
                <Textarea
                  id="execSummary"
                  value={reportConfig.executiveSummary}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, executiveSummary: e.target.value }))}
                  placeholder="Provide a brief executive summary of the security assessment..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Include Test Status</Label>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(reportConfig.includeStatusFilters).map(([status, included]) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={status}
                        checked={included}
                        onCheckedChange={(checked) => 
                          setReportConfig(prev => ({
                            ...prev,
                            includeStatusFilters: {
                              ...prev.includeStatusFilters,
                              [status]: checked === true
                            }
                          }))
                        }
                      />
                      <Label htmlFor={status} className="capitalize">
                        {status.replace('-', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Total Tests</div>
                  <div className="text-2xl font-bold text-primary">{stats.total}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Completed</div>
                  <div className="text-2xl font-bold text-success">{stats.completed}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">In Progress</div>
                  <div className="text-2xl font-bold text-warning">{stats.inProgress}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Blocked</div>
                  <div className="text-2xl font-bold text-destructive">{stats.blocked}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Report will include detailed findings, evidence attachments count, and testing notes for selected statuses.
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={generatePDFReport}
              disabled={generating}
              className="bg-primary text-primary-foreground"
            >
              {generating ? 'Generating...' : 'Generate PDF Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}