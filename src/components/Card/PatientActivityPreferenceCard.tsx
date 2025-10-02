import React from "react";
import { CardHeader, CardTitle, CardContent, Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Heart, HeartCrack, Edit, ThumbsUp, ThumbsDown} from "lucide-react";
import { DataTableClient } from "../Table/DataTable";
import { usePatientActivityPreferences } from "@/hooks/activity/usePatientActivityPreferences";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";

interface PatientActivityPreferenceCardProps {
  patientId: string;
}

const PatientActivityPreferenceCard: React.FC<PatientActivityPreferenceCardProps> = ({ 
  patientId
}) => {
  const { activityPreferences, loading, error, refreshPatientActivityPreferences } = usePatientActivityPreferences(patientId);
  const { currentUser } = useAuth();
  const { openModal } = useModal();

  const renderPreferenceBadge = (preference: string | null | undefined) => {
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
        <Badge variant="destructive" className="inline-flex items-center gap-1 px-2 py-1">
          <HeartCrack className="h-3 w-3" />
          Dislike
        </Badge>
      );
    }
    if (preference === "NEUTRAL") {
      return <Badge variant="secondary" className="px-2 py-1">Neutral</Badge>;
    }
    return <Badge variant="outline" className="px-2 py-1">Neutral</Badge>;
  };

  const renderRecommendationBadge = (recommendation: string | null | undefined) => {
    if (recommendation === "RECOMMENDED") {
      return (
        <Badge className="bg-blue-500 text-white inline-flex items-center gap-1 px-2 py-1">
          <ThumbsUp className="h-3 w-3 fill-current" />
          Recommended
        </Badge>
      );
    }
    if (recommendation === "NOT_RECOMMENDED") {
      return (
        <Badge variant="destructive" className="inline-flex items-center gap-1 px-2 py-1">
          <ThumbsDown className="h-3 w-3" />
          Not Recommended
        </Badge>
      );
    }
    return <Badge variant="outline" className="px-2 py-1">Not Set</Badge>;
  };

  const columns = [
    {
      key: "activityName" as keyof typeof activityPreferences[0],
      header: "Activity Name",
      className: "min-w-[200px]",
    },
    {
      key: "activityDescription" as keyof typeof activityPreferences[0],
      header: "Description",
      className: "min-w-[250px]",
      render: (value: string | null | undefined) => (
        <div className="text-sm text-muted-foreground">
          {value || "No description available"}
        </div>
      ),
    },
    {
      key: "patientPreference" as keyof typeof activityPreferences[0],
      header: "Patient Preference",
      headerClassName: "text-center",
      className: "w-[160px] text-center",
      render: (value: string | null | undefined) => (
        <div className="flex justify-center items-center w-full min-h-[40px]">
          {renderPreferenceBadge(value)}
        </div>
      ),
    },
    {
      key: "doctorRecommendation" as keyof typeof activityPreferences[0],
      header: "Doctor Recommendation", 
      headerClassName: "text-center",
      className: "w-[180px] text-center",
      render: (value: string | null | undefined) => (
        <div className="flex justify-center items-center w-full min-h-[40px]">
          {renderRecommendationBadge(value)}
        </div>
      ),
    },
    {
      key: "doctorNotes" as keyof typeof activityPreferences[0],
      header: "Doctor Notes",
      className: "min-w-[200px]",
      render: (value: string | null | undefined) => (
        <div className="text-sm text-muted-foreground">
          {value || "No notes provided"}
        </div>
      ),
    },
  ];

  // Define actions render function for supervisors
  const renderActions = currentUser?.roleName === "SUPERVISOR" ? (item: any) => (
    <div className="flex justify-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          openModal("editActivityPreference", {
            preference: item,
            refreshPreferences: refreshPatientActivityPreferences,
          })
        }
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  ) : undefined;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            Loading activity preferences...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-center">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Activity Preferences
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          View and manage activity preferences and doctor recommendations for this patient.
          This shows all available centre activities with their current preference settings.
        </p>
      </CardHeader>
      <CardContent>
        <DataTableClient
          data={activityPreferences}
          columns={columns}
          viewMore={false}
          renderActions={renderActions}
        />
      </CardContent>
    </Card>
  );
};

export default PatientActivityPreferenceCard;