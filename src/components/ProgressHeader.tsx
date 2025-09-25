import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TestResult } from "@/data/owaspTests";
import { Download, FileJson, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ProgressHeaderProps {
  totalTests: number;
  testResults: Record<string, TestResult>;
  onImportResults: (results: Record<string, TestResult>) => void;
  onClearData: () => void;
}

export function ProgressHeader({ 
  totalTests, 
  testResults, 
  onImportResults,
  onClearData 
}: ProgressHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStats = () => {
    const completed = Object.values(testResults).filter(r => r.status === 'done').length;
    const inProgress = Object.values(testResults).filter(r => r.status === 'in-progress').length;
    const blocked = Object.values(testResults).filter(r => r.status === 'blocked').length;
    const notStarted = totalTests - completed - inProgress - blocked;
    
    return { completed, inProgress, blocked, notStarted };
  };

  const stats = getStats();
  const progressPercentage = totalTests > 0 ? (stats.completed / totalTests) * 100 : 0;

  const exportResults = () => {
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      totalTests: totalTests,
      results: testResults
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `owasp-wstg-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Results exported",
      description: "Your testing results have been exported to JSON."
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.results && typeof data.results === 'object') {
          onImportResults(data.results);
          toast({
            title: "Results imported",
            description: "Your testing results have been imported successfully."
          });
        } else {
          throw new Error('Invalid file format');
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to import results. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border-b bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">OWASP WSTG Progress Tracker</h1>
          <p className="text-muted-foreground">Web Security Testing Progress</p>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportResults}
          >
            <FileJson className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onClearData}
          >
            Clear Data
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">
            {stats.completed} of {totalTests} tests completed
          </span>
        </div>

        <Progress value={progressPercentage} className="h-2">
          <div className="progress-bar h-full rounded-full" style={{ width: `${progressPercentage}%` }} />
        </Progress>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="status-done">
              Done: {stats.completed}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="status-in-progress">
              In Progress: {stats.inProgress}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="status-blocked">
              Blocked: {stats.blocked}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="status-not-started">
              Not Started: {stats.notStarted}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}