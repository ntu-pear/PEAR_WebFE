import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddHobbyModal from "../Modal/Add/AddHobbyModal";
import AddHabitModal from "../Modal/Add/AddHabitModal";
import LikeDislikeCard from "../Card/LikeDislikeCard";
import HobbyCard from "../Card/HobbyCard";
import HabitCard from "../Card/HabitCard";
import AddLikeDislikeModal from "../Modal/Add/AddLikeDislikeModal";
import DeletePersonalPreference from "../Modal/Delete/DeletePersonalPreferenceModal";
import EditLikeDislike from "../Modal/Edit/EditLikeDislikeModal";
import EditHobby from "../Modal/Edit/EditHobbyModal";
import EditHabit from "../Modal/Edit/EditHabitModal";


const PersonalPreferenceTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="personal-preference">
        <div className="my-2">
          <LikeDislikeCard />
        </div>
        <div className="my-4">
          <HobbyCard />
        </div>
        <div className="my-4">
          <HabitCard />
        </div>
      </TabsContent>
      {activeModal.name === "addLikeDislike" && <AddLikeDislikeModal />}

      {activeModal.name === "addHobby" && <AddHobbyModal />}

      {activeModal.name === "addHabit" && <AddHabitModal />}

      {activeModal.name === "deletePreference" && <DeletePersonalPreference />}

      {activeModal.name === "editLikeDislike" && <EditLikeDislike />}

      {activeModal.name === "editHobby" && <EditHobby/>}

      {activeModal.name==="editHabit" && <EditHabit/>}
    </>
  );
};

export default PersonalPreferenceTab;
