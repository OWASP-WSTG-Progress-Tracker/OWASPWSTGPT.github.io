import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface TestSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export function TestSearch({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusFilterChange 
}: TestSearchProps) {
  return (
    <div className="flex gap-4 p-4 border-b bg-card">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tests by ID, name, or description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="not-started">Not Started</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
          <SelectItem value="blocked">Blocked</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}