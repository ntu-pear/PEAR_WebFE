import { EyeOff } from "lucide-react";

// Shown to ADMIN on the patient and activity log pages. The logging service
// blanks the description, old/new values and patient name for ADMIN, so the
// page explains what is hidden instead of showing empty cells.
const AdminRedactionNotice: React.FC = () => (
  <div className="mb-4 flex items-start gap-2 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
    <EyeOff className="mt-0.5 h-4 w-4 flex-shrink-0" />
    <span>
      Admin view: you can see who made each change, when, and to what type of record.
      Patient names, descriptions and changed values are hidden.
    </span>
  </div>
);

export default AdminRedactionNotice;
