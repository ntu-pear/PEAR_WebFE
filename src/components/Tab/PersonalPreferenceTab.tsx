import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { DataTableClient } from "../Table/DataTable";
import {
  mockDislike,
  mockHabit,
  mockHobby,
  mockLike,
} from "@/mocks/mockPatientDetails";
import TabProps from "./types";
import { useModal } from "@/hooks/useModal";
import AddLikeModal from "../Modal/AddLikeModal";
import AddDislikeModal from "../Modal/AddDislikeModal";
import AddHobbyModal from "../Modal/AddHobbyModal";
import AddHabitModal from "../Modal/AddHabitModal";

const PersonalPreferenceTab: React.FC<TabProps> = () => {
  const { activeModal, openModal } = useModal();

  const personalPreferenceColumns = [
    { key: "dateCreated", header: "Date Created", width: "15%" },
    { key: "authorName", header: "Author Name", width: "15%" },
    { key: "description", header: "Description", width: "50%" },
  ];

  return (
    <>
      <TabsContent value="personal-preference">
        <Card className="my-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Likes</span>
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal("addLike")}
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add
                </span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTableClient
              data={mockLike}
              columns={personalPreferenceColumns}
              viewMore={false}
            />
          </CardContent>
        </Card>
        <Card className="my-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Dislikes</span>
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal("addDislike")}
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add
                </span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTableClient
              data={mockDislike}
              columns={personalPreferenceColumns}
              viewMore={false}
            />
          </CardContent>
        </Card>
        <Card className="my-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Hobbies</span>
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal("addHobby")}
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add
                </span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTableClient
              data={mockHobby}
              columns={personalPreferenceColumns}
              viewMore={false}
            />
          </CardContent>
        </Card>
        <Card className="my-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Habits</span>
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal("addHabit")}
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add
                </span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTableClient
              data={mockHabit}
              columns={personalPreferenceColumns}
              viewMore={false}
            />
          </CardContent>
        </Card>
      </TabsContent>
      {activeModal.name === "addLike" && <AddLikeModal />}

      {activeModal.name === "addDislike" && <AddDislikeModal />}

      {activeModal.name === "addHobby" && <AddHobbyModal />}

      {activeModal.name === "addHabit" && <AddHabitModal />}
    </>
  );
};

export default PersonalPreferenceTab;
