import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert } from "lucide-react";

import ManagePrivacySettingsCard from "@/components/Card/ManagePrivacySettingsCard";
import ManageAccessLevelCard from "@/components/Card/ManagePrivacyLevelCard";

const ManageSocialHistory: React.FC = () => {
  const [activeTab, setActiveTab] = useState("privacy");

  return (
    <div className="flex min-h-screen w-full font-sans">
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex items-center justify-between gap-4">
              <TabsList className="bg-muted/50 border border-border p-1 rounded-xl">
                <TabsTrigger
                  value="privacy"
                  className="px-5 py-2 rounded-lg text-sm"
                >
                  Privacy Settings
                </TabsTrigger>
                <TabsTrigger
                  value="access-levels"
                  className="px-5 py-2 rounded-lg text-sm"
                >
                  Access Levels
                </TabsTrigger>
              </TabsList>

            </div>

            <TabsContent value="privacy" className="mt-6">
              <ManagePrivacySettingsCard />
            </TabsContent>

            <TabsContent value="access-levels" className="mt-6">
              <ManageAccessLevelCard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ManageSocialHistory;