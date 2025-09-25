import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EvidenceFile } from "@/data/owaspTests";
import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface EvidenceUploadProps {
  testId: string;
  evidence: EvidenceFile[];
  onEvidenceChange: (evidence: EvidenceFile[]) => void;
}

export function EvidenceUpload({ testId, evidence, onEvidenceChange }: EvidenceUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);

    try {
      const newEvidence: EvidenceFile[] = [];

      for (const file of Array.from(files)) {
        // Validate file type (images only for now)
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file. Only images are supported for evidence.`,
            variant: "destructive"
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB. Please choose a smaller file.`,
            variant: "destructive"
          });
          continue;
        }

        // Create a data URL for the image (in a real app, you'd upload to a server/cloud storage)
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const evidenceFile: EvidenceFile = {
          id: `${testId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: dataUrl, // In a real app, this would be the server URL
          uploadedAt: new Date()
        };

        newEvidence.push(evidenceFile);
      }

      if (newEvidence.length > 0) {
        onEvidenceChange([...evidence, ...newEvidence]);
        toast({
          title: "Evidence uploaded",
          description: `${newEvidence.length} file(s) uploaded successfully.`
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload evidence files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeEvidence = (evidenceId: string) => {
    onEvidenceChange(evidence.filter(e => e.id !== evidenceId));
    toast({
      title: "Evidence removed",
      description: "Evidence file has been removed."
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Screenshots'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Upload screenshots and other image evidence. Max 5MB per file.
      </p>

      {evidence.length > 0 && (
        <div className="space-y-2">
          {evidence.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 border rounded-lg bg-muted/20"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {file.type.startsWith('image/') && (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="h-8 w-8 object-cover rounded border"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeEvidence(file.id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}