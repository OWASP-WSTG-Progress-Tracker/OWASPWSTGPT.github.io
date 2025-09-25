import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategorySidebar } from "@/components/CategorySidebar";
import { ProgressHeader } from "@/components/ProgressHeader";
import { TestSearch } from "@/components/TestSearch";
import { TestCard } from "@/components/TestCard";
import { ReportGenerator } from "@/components/ReportGenerator";
import { owaspCategories, TestResult } from "@/data/owaspTests";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

const Index = () => {
  const [testResults, setTestResults] = useLocalStorage<Record<string, TestResult>>("owasp-test-results", {});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const allTests = useMemo(() => {
    return owaspCategories.flatMap(category => category.tests);
  }, []);

  const filteredTests = useMemo(() => {
    let tests = selectedCategory 
      ? owaspCategories.find(cat => cat.id === selectedCategory)?.tests || []
      : allTests;

    if (searchTerm) {
      tests = tests.filter(test => 
        test.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      tests = tests.filter(test => {
        const result = testResults[test.id];
        return result?.status === statusFilter || (!result && statusFilter === "not-started");
      });
    }

    return tests;
  }, [selectedCategory, searchTerm, statusFilter, allTests, testResults]);

  const updateTestResult = (testId: string, updates: Partial<TestResult>) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: {
        testId,
        status: 'not-started',
        notes: '',
        evidence: [],
        lastUpdated: new Date(),
        ...prev[testId],
        ...updates
      }
    }));
  };

  const handleImportResults = (results: Record<string, TestResult>) => {
    setTestResults(results);
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all test data? This action cannot be undone.")) {
      setTestResults({});
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarContent>
            <CategorySidebar
              categories={owaspCategories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              testResults={testResults}
            />
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="flex-1">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 p-4">
              <SidebarTrigger />
              <div className="h-6 w-px bg-sidebar-border" />
              <div className="flex-1">
                <ProgressHeader
                  totalTests={allTests.length}
                  testResults={testResults}
                  onImportResults={handleImportResults}
                  onClearData={handleClearData}
                />
              </div>
            </div>
            
            <TestSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-4">
                {filteredTests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all" 
                        ? "No tests match your current filters." 
                        : "No tests available in this category."
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">
                        {selectedCategory 
                          ? owaspCategories.find(cat => cat.id === selectedCategory)?.name || "Unknown Category"
                          : "All Tests"
                        } ({filteredTests.length} tests)
                      </h2>
                      
                      <ReportGenerator 
                        testResults={testResults}
                        allTests={allTests}
                      />
                    </div>

                    <div className="grid gap-4">
                      {filteredTests.map((test) => (
                        <TestCard
                          key={test.id}
                          test={test}
                          result={testResults[test.id]}
                          onUpdateResult={updateTestResult}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
