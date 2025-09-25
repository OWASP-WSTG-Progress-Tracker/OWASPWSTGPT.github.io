import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OwaspCategory, TestResult } from "@/data/owaspTests";
import { cn } from "@/lib/utils";

interface CategorySidebarProps {
  categories: OwaspCategory[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  testResults: Record<string, TestResult>;
}

export function CategorySidebar({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  testResults 
}: CategorySidebarProps) {
  
  const getCategoryStats = (category: OwaspCategory) => {
    const total = category.tests.length;
    const completed = category.tests.filter(test => 
      testResults[test.id]?.status === 'done'
    ).length;
    const inProgress = category.tests.filter(test => 
      testResults[test.id]?.status === 'in-progress'
    ).length;
    
    return { total, completed, inProgress };
  };

  const getAllStats = () => {
    const allTests = categories.flatMap(cat => cat.tests);
    const total = allTests.length;
    const completed = allTests.filter(test => 
      testResults[test.id]?.status === 'done'
    ).length;
    const inProgress = allTests.filter(test => 
      testResults[test.id]?.status === 'in-progress'
    ).length;
    
    return { total, completed, inProgress };
  };

  const allStats = getAllStats();

  return (
    <div className="w-full">
      <div className="p-4 border-b">
        <img src="public/logo1.png" alt="Logo" className="h-50 mb-2" />
        <h2 className="font-semibold text-sidebar-foreground">OWASP WSTG Progress Tracker</h2>
        <p className="text-sm text-sidebar-foreground/70 mt-1">
          Web Security Testing Progress Tracker by <b><a href="https://linkedin.com/in/KamranSaifullah">Kamran Saifullah</a></b> inspired by the work of <b><a href="https://www.linkedin.com/in/adan-%C3%A1lvarez-vilchez-539a92115/">Adan Álvarez</a></b>
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="p-4 space-y-2">
          {/* All Tests Button */}
          <Button
            variant={selectedCategory === null ? "default" : "ghost"}
            className={cn(
              "w-full justify-between text-left h-auto p-3",
              selectedCategory === null && "bg-sidebar-primary text-sidebar-primary-foreground"
            )}
            onClick={() => onCategorySelect(null)}
          >
            <div>
              <div className="font-medium">All Tests</div>
              <div className="text-xs opacity-70">
                {allStats.completed}/{allStats.total} completed
              </div>
            </div>
            <div className="flex gap-1">
              {allStats.inProgress > 0 && (
                <Badge variant="secondary" className="h-5 text-xs bg-warning/20 text-warning">
                  {allStats.inProgress}
                </Badge>
              )}
              <Badge variant="secondary" className="h-5 text-xs bg-success/20 text-success">
                {allStats.completed}
              </Badge>
            </div>
          </Button>

          {/* Category Buttons */}
          {categories.map((category) => {
            const stats = getCategoryStats(category);
            const isSelected = selectedCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "ghost"}
                className={cn(
                  "w-full justify-between text-left h-auto p-3",
                  isSelected && "bg-sidebar-primary text-sidebar-primary-foreground"
                )}
                onClick={() => onCategorySelect(category.id)}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{category.name}</div>
                  <div className="text-xs opacity-70">
                    {stats.completed}/{stats.total} tests completed
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0 ml-2">
                  {stats.inProgress > 0 && (
                    <Badge variant="secondary" className="h-5 text-xs bg-warning/20 text-warning">
                      {stats.inProgress}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="h-5 text-xs bg-success/20 text-success">
                    {stats.completed}
                  </Badge>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}