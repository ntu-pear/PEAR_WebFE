import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "../ui/badge";

const RecommendationBadge = ({ recommendation }: { recommendation: any }) => {
  if (recommendation === "RECOMMENDED") {
    return (
      <Badge className="bg-green-500 text-white inline-flex items-center gap-1 px-2 py-1">
        <ThumbsUp className="h-3 w-3 fill-current" />
        Recommended
      </Badge>
    );
  }
  if (recommendation === "NOT_RECOMMENDED") {
    return (
      <Badge
        variant="destructive"
        className="inline-flex items-center gap-1 px-2 py-1"
      >
        <ThumbsDown className="h-3 w-3" />
        Not Recommended
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="px-2 py-1">
      Not Set
    </Badge>
  );
};

export default RecommendationBadge;
