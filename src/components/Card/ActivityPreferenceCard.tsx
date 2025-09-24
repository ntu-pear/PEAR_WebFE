import React, { useState } from "react";
import { CardHeader, CardTitle, CardContent, Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Heart, HeartCrack, Edit, Search } from "lucide-react";
import { DataTableClient } from "../Table/DataTable";
import { useActivityPreferences } from "@/hooks/activity/useActivityPreferences";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";

const ActivityPreferenceCard: React.FC = () => {
  const { activityPreferences, loading, error } = useActivityPreferences();
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const [patientNameFilter, setPatientNameFilter] = useState("");

  // Debug activity preferences data
  console.log("📋 Activity Preferences Debug:", {
    count: activityPreferences.length,
    sampleData: activityPreferences.slice(0, 3)
  });

  // Filter data by patient name
  const filteredPreferences = activityPreferences.filter(pref => 
    pref.patientName.toLowerCase().includes(patientNameFilter.toLowerCase())
  );

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
    return <Badge variant="outline" className="px-2 py-1">Not Set</Badge>;
  };

  const renderRecommendationBadge = (recommendation: string | null | undefined) => {
    if (recommendation === "RECOMMENDED") {
      return <Badge className="bg-blue-500">Recommended</Badge>;
    }
    return <Badge variant="outline">Not Set</Badge>;
  };

  const columns = [
    {
      key: "patientName" as keyof typeof activityPreferences[0],
      header: "Patient Name",
      className: "min-w-[150px]",
    },
    {
      key: "activityName" as keyof typeof activityPreferences[0],
      header: "Activity Name",
      className: "min-w-[200px]",
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
      className: "min-w-[200px] max-w-[300px]",
      render: (value: string | null | undefined) => {
        const notes = value || "No notes";
        const isLongNote = notes.length > 60; // Show expand option if longer than 60 chars
        
        return (
          <div className="group relative">
            <div className={`${isLongNote ? 'line-clamp-2' : ''} text-sm leading-relaxed`}>
              {notes}
            </div>
            {isLongNote && (
              <div className="absolute invisible group-hover:visible bg-black text-white text-xs p-2 rounded shadow-lg z-10 max-w-sm -top-2 left-0 transform -translate-y-full">
                {notes}
                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "_actions",
      header: "Actions",
      render: (_: any, item: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openModal("editActivityPreference", {
            centreActivityId: item.centreActivityId,
            patientId: item.patientId,
            patientName: item.patientName,
            activityName: item.activityName,
            currentPreference: item.patientPreference,
            onUpdate: () => {
              // Refresh data after update
              window.location.reload(); // Simple refresh for now
            }
          })}
          disabled={!currentUser || (currentUser.roleName !== "SUPERVISOR" && currentUser.roleName !== "PRIMARY_GUARDIAN")}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Preferences & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Preferences & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Preferences & Recommendations</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Filter by patient name..."
              value={patientNameFilter}
              onChange={(e) => setPatientNameFilter(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTableClient
          data={filteredPreferences}
          columns={columns as any}
          viewMore={false}
        />
        {filteredPreferences.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            {patientNameFilter ? "No matching patients found." : "No activity preferences found."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityPreferenceCard;
