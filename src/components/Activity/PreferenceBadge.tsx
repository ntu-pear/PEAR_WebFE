import { Heart, HeartCrack } from "lucide-react";
import { Badge } from "../ui/badge";

const PreferenceBadge = ({ preference }: { preference: any }) => {
  if (preference === "LIKE") {
    return (
      <Badge className="bg-green-500 text-white inline-flex items-center gap-1 px-2 py-1">
        <Heart className="h-3 w-3 fill-current" />
        Like
      </Badge>
    );
  }
  if (preference === "DISLIKE") {
    return (
      <Badge
        variant="destructive"
        className="inline-flex items-center gap-1 px-2 py-1"
      >
        <HeartCrack className="h-3 w-3" />
        Dislike
      </Badge>
    );
  }
  if (preference === "NEUTRAL") {
    return (
      <Badge variant="secondary" className="px-2 py-1">
        Neutral
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="px-2 py-1">
      Not Set
    </Badge>
  );
};

export default PreferenceBadge;
