import React, { useState } from "react";
import { CardHeader, CardTitle, CardContent, Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Calendar, Ban, Edit, Search, Plus } from "lucide-react";
import { DataTableClient } from "../Table/DataTable";
import { useCentreActivityExclusions } from "@/hooks/activity/useActivityExclusions";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";

const CentreActivityExclusionCard: React.FC = () => {
  const { centreActivityExclusions, loading, error } = useCentreActivityExclusions();
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const [patientNameFilter, setPatientNameFilter] = useState("");

  // Filter data by patient name
  const filteredExclusions = centreActivityExclusions.filter((exclusion) => 
    exclusion.patientName.toLowerCase().includes(patientNameFilter.toLowerCase())
  );

  const renderDateBadge = (date: string | null | undefined, label: string) => {
    if (!date) return null;
    
    const dateObj = new Date(date);
    const isToday = dateObj.toDateString() === new Date().toDateString();
    const isPast = dateObj < new Date() && !isToday;
    const isFuture = dateObj > new Date();
    
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    if (isToday) variant = "default";
    else if (isPast) variant = "secondary";
    else if (isFuture) variant = "destructive";
    
    return (
      <Badge variant={variant} className="inline-flex items-center gap-1 px-2 py-1">
        <Calendar className="h-3 w-3" />
        {label}: {dateObj.toLocaleDateString()}
      </Badge>
    );
  };

  const renderExclusionStatus = (startDate: string, endDate?: string | null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    const now = new Date();
    
    if (now < start) {
      return <Badge variant="outline">Pending</Badge>;
    } else if (!end) {
      return <Badge variant="destructive">Active (Indefinite)</Badge>;
    } else if (now <= end) {
      return <Badge variant="destructive">Active</Badge>;
    } else {
      return <Badge variant="secondary">Expired</Badge>;
    }
  };

  const columns = [
    {
      key: "patientName" as keyof typeof centreActivityExclusions[0],
      header: "Patient Name",
      className: "min-w-[150px]",
    },
    {
      key: "activityName" as keyof typeof centreActivityExclusions[0],
      header: "Centre Activity Name",
      className: "min-w-[200px]",
    },
    {
      key: "startDate" as keyof typeof centreActivityExclusions[0],
      header: "Exclusion Period",
      className: "min-w-[250px]",
      render: (_: any, item: any) => (
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1">
            {renderDateBadge(item.startDate, "From")}
            {item.endDate && renderDateBadge(item.endDate, "Until")}
            {item.isIndefinite && (
              <Badge variant="outline" className="inline-flex items-center gap-1 px-2 py-1">
                <Ban className="h-3 w-3" />
                Indefinite
              </Badge>
            )}
          </div>
          <div>{renderExclusionStatus(item.startDate, item.endDate)}</div>
        </div>
      ),
    },
    {
      key: "exclusionRemarks" as keyof typeof centreActivityExclusions[0],
      header: "Remarks",
      className: "min-w-[200px] max-w-[300px]",
      render: (value: string | null | undefined) => {
        const remarks = value || "No remarks";
        const isLongRemarks = remarks.length > 60;
        
        return (
          <div className="group relative">
            <div className={`${isLongRemarks ? 'line-clamp-2' : ''} text-sm leading-relaxed`}>
              {remarks}
            </div>
            {isLongRemarks && (
              <div className="absolute invisible group-hover:visible bg-black text-white text-xs p-2 rounded shadow-lg z-10 max-w-sm -top-2 left-0 transform -translate-y-full">
                {remarks}
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openModal("editActivityExclusion", {
              exclusionId: item.id,
              centreActivityId: item.centreActivityId,
              patientId: item.patientId,
              patientName: item.patientName,
              activityName: item.activityName,
              currentStartDate: item.startDate,
              currentEndDate: item.endDate,
              currentRemarks: item.exclusionRemarks
            })}
            disabled={!currentUser || (currentUser.roleName !== "SUPERVISOR" && currentUser.roleName !== "PRIMARY_GUARDIAN")}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Exclusions</CardTitle>
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
          <CardTitle>Activity Exclusions</CardTitle>
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
          <CardTitle>Activity Exclusions</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Filter by patient name..."
                value={patientNameFilter}
                onChange={(e) => setPatientNameFilter(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button
              onClick={() => openModal("addActivityExclusion", {})}
              disabled={!currentUser || (currentUser.roleName !== "SUPERVISOR" && currentUser.roleName !== "PRIMARY_GUARDIAN")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Exclusion
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTableClient
          data={filteredExclusions}
          columns={columns as any}
          viewMore={false}
        />
        {filteredExclusions.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            {patientNameFilter ? "No matching patients found." : "No activity exclusions found."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CentreActivityExclusionCard;
