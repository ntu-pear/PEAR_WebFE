import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import ManagePrivacySettingsCard from "@/components/Card/ManagePrivacySettingsCard";
import ManagePrivacyLevelCard from "@/components/Card/ManagePrivacyLevelCard";

const ManageSocialHistory: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Manage Social History</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col align-middle">
              <ManagePrivacySettingsCard />
              <ManagePrivacyLevelCard />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ManageSocialHistory;
