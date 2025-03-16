import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

const ActivityRecCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Recommendation</CardTitle>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
};

export default ActivityRecCard;
