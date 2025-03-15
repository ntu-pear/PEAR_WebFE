import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

const IndivGameRecCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Game Type Recommendation For Individual
        </CardTitle>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
};

export default IndivGameRecCard;
