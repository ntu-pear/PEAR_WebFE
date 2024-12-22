// import { fetchPatientById, PatientBase } from "@/api/patients";
import React, { useEffect, useRef, useState } from "react";
import {/* useParams,*/ useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {PlusCircle, FilePenLine, EyeIcon, EyeOffIcon} from "lucide-react";
import DataTable from "@/components/Table/DataTable";
import { mockActivityExclusion, mockActivityPreferences, mockAllergy, mockDiagnosedDementiaList, mockDislike, mockDoctorNotes, mockGuardian, mockHabit, mockHobby, mockLike, mockMaskedNRIC, mockMediclaDetails, mockMobilityAids, mockPatientInformation, mockPatientProfilePic, mockPrescription, mockProblemLog, mockRoutine, mockSocialHistory, mockStaffAllocation, mockUnmaskedNRIC, mockVitalCheck, PatientInformation, SocialHistory } from "@/mocks/mockPatientDetails";


const ViewPatient: React.FC = () => {
  // const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = new URLSearchParams(location.search).get("tab") || "information";
  // const [patient, setPatient] = useState<PatientBase | null>(null);
  const [isNRICMasked, setisNRICMasked] = useState(true);
  const [ nric, setNric] = useState("")


  const [activeModal, setActiveModal] = useState<string | null>(null);
  // Modal ref to detect outside clicks
  const modalRef = useRef<HTMLDivElement | null>(null);
  const openModal = (modalName: string) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null)


  const handleFetchPatient = async () => {
    // if (!id || isNaN(Number(id))) return;
    // try {
    //   const fetchedPatient: PatientBase = await fetchPatientById(Number(id));
    //   console.log(fetchedPatient);
    //   setPatient(fetchedPatient);
    // } catch (error) {
    //   console.error("Error fetching patient:", error);
    // }
  };

  const handleTabChange = (value: string) => {
    // Update the URL with the new tab
    navigate({
      pathname: location.pathname,
      search: `?tab=${value}`, // Set the selected tab in the URL query
    });
  };

  const handleNRICToggle = () => {
    const updatedNric = isNRICMasked ? mockUnmaskedNRIC: mockMaskedNRIC
    setNric(updatedNric)
    setisNRICMasked(!isNRICMasked)
  }


  const handleEditInformation = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Information updated!");
    closeModal(); 
  };

  const handleAddMedicalHistory = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Medical History added!");
    closeModal(); 
  };

  const handleAddMobilityAids = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Mobility Aids added!");
    closeModal(); 
  };

  const handleEditStaffAllocation = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Staff Allocation Updated!");
    closeModal(); 
  };

  const handleEditSocialHistory = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Social History Updated!");
    closeModal(); 
  };


  const handleAddAllergy = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Allergy Added!");
    closeModal(); 
  };

  const handleAddVital = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Vital Added!");
    closeModal(); 
  };

  const handleAddLike = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Like Added!");
    closeModal(); 
  };

  const handleAddDislike = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Dislike Added!");
    closeModal(); 
  };

  const handleAddHobby = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Hobby Added!");
    closeModal(); 
  };

  const handleAddHabit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Habit Added!");
    closeModal(); 
  };


  const handleAddProblem = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Problem Added!");
    closeModal(); 
  };

  const handleAddPrescription = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Medical Prescription Added!");
    closeModal(); 
  };

  const handleAddGuardian = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Guardian Added!");
    closeModal(); 
  };


  // Close the modal if clicking outside the modal content
  useEffect(() => {
    handleFetchPatient();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    if (activeModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeModal]);


  useEffect(() => {
    handleFetchPatient();
  }, []);

  const patientInformationColumns = [
    { key: "name", header: "Name" },
    { key: "nric", header: "NRIC"},
    { key: "dateOfBirth", header: "Date Of Birth"},
    { key: "gender", header: "Gender"},
    { key: "address", header: "Address"},
    { key: "inactiveDate", header: "Inactive Date"},
    { key: "temporaryAddress", header: "Temporary Address" },
    { key: "homeNo", header: "Home No" },
    { key: "handphoneNo", header: "Handphone No"},
    { key: "perferredName", header: "Preferred Name"},
    { key: "perferredLanguage", header: "Preferred Language"},
    { key: "underRespiteCare", header: "Under Respite Care"},
    { key: "startDate", header: "Start Date"},
    { key: "endDate", header: "End Date"},
  ]

  const dementiaColumns = [
    { key: "dementiaType", header: "Dementia Type" },
    { key: "dementiaDate", header: "Dementia Date" },
  ];

  const mediclaDetailsColumns = [
    { key: "medicalDetails", header: "Medical Details"},
    { key: "informationSource", header: "Information Source"},
    { key: "medicalEstimatedDate", header: "Medical Estimated Date"},
    { key: "notes", header: "Notes"},
  ]

  const mobilityAidsColumns = [
    { key: "mobilityAids", header: "Mobility Aids"},
    { key: "remark", header: "Remark"},
    { key: "condition", header: "Condition"},
    { key: "date", header: "Date"},
  ]

  const doctorNotesColumns = [
    { key: "date", header: "Date"},
    { key: "doctorName", header: "Doctor's Name"},
    { key: "notes", header: "Notes"},
  ]

  const staffAllocationColumns = [
    { key: "staffRole", header: "Staff Role"},
    { key: "staffName", header: "Staff Name"},
    
  ]

  const socialHistoryColumns = [
    { key: "caffeineUse" , header: "Caffeine Use"},
    { key: "diet" , header: "Diet"},
    { key: "drugUse" , header: "Drug Use"},
    { key: "education" , header: "Education"},
    { key: "exercise" , header: "Exercise"},
    { key: "liveWith" , header: "Live With"},
    { key: "occupation" , header: "Occupation"},
    { key: "pet" , header: "Pet"},
    { key: "religion" , header: "Religion"},
    { key: "secondhandSmoker" , header: "Secondhand Smoker"},
    { key: "sexuallyActive" , header: "Sexually Active"},
    { key: "tobaccoUse" , header: "Tobacco Use"},
  ]

  const allergyColumns = [
    { key: "allergicTo", header: "Allergic To"},
    { key: "reaction", header: "Reaction"},
    { key: "notes", header: "Notes"}
  ]

  const vitalCheckColumns = [
    { key: "date", header: "Date"},
    { key: "time", header: "Time"},
    { key: "temperature", header: "Temperature (°C)"},
    { key: "weight", header: "Weight (kg)"},
    { key: "height", header: "Height (m)"},
    { key: "systolicBP", header: "Systolic BP (mmHg)"},
    { key: "diastolicBP", header: "Diastolic BP (mmHg)"},
    { key: "heartRate", header: "Heart Rate (bpm)"},
    { key: "spO2", header: "SpO2 (%)"},
    { key: "bloodSugarLevel", header: "Blood Sugar Level (mmol/L)"},
    { key: "afterMeal", header: "After Meal"},
    { key: "remark", header: "Remark"},    
  ]

  const personalPreferenceColumns = [
    { key: "dateCreated", header: "Date Created", width: "15%"},
    { key: "authorName", header: "Author Name", width: "15%"},
    { key: "description", header: "Description", width: "50%"},
  ]

  const problemLogColumns = [
    { key: "author", header: "Author"},
    { key: "description", header: "Description"},
    { key: "remark", header: "Remark"},
  ]

  const activityPreferencesColumns = [
    { key: "activityName", header: "Activity Name"},
    { key: "activityDescription", header: "Activity Description"},
    { key: "likeOrDislike", header: "Like/Dislike"},
  ]

  const routineColumns = [
    { key: "activityName", header: "Activity Name"},
    { key: "routineIssue", header: "Routine Issue"},
    { key: "routineTimeSlots", header: "Routine Time Slots"},
    { key: "includeInSchedule", header: "Include in Schedule"},
  ]

  const prescriptionColumns = [
    { key: "drugName", header: "Drug Name"},
    { key: "dosage", header: "Dosage"},
    { key: "frequencyPerDay", header: "Frequency Per Day"},
    { key: "instruction", header: "Instruction"},
    { key: "startDate", header: "Start Date"},
    { key: "endDate", header: "End Date"},
    { key: "afterMeal", header: "After Meal"},
    { key: "remark", header: "Remark"},
    { key: "chronic", header: "Chronic"},
  ]

  const guardianColumns = [
    { key: "guardianType", header: "Guardian Type"},
    { key: "guardianName", header: "Guardian Name"},
    { key: "preferredName", header: "Preferred Name"},
    { key: "nric", header: "NRIC"},
    { key: "relationshipWithPatient", header: "Patient's"},
    { key: "contractNo", header: "Contact Number"},
    { key: "address", header: "Address"},
    { key: "email", header: "Email"},
  ]


  const activityExclusionColumns = [
    { key: "title", header: "Title"},
    { key: "description", header: "Description"},
    { key: "startDate", header: "Start Date"},
    { key: "endDate", header: "End Date"},
    { key: "remark", header: "Remark"},
  ]


  return (
    <div className="flex min-h-screen w-full flex-col max-w-[1400px] container mx-auto px-4">
      <div className="container mx-auto p-4">
      <div className="flex items-center space-x-6 mb-8 sm:pl-14">
        <Avatar className="h-36 w-36">
          <AvatarImage src={mockPatientProfilePic} alt="Bob Smith" />
          <AvatarFallback>BS</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Bob Smith</h1>
          <p className="text-gray-600">Bob</p>
        </div>
      </div>

        <Tabs defaultValue="information" value={activeTab} onValueChange={handleTabChange} className="flex flex-col sm:pl-14">
          <TabsList className="flex justify-between">
            <TabsTrigger value="information">Information</TabsTrigger>
            <TabsTrigger value="allergy">Allergy</TabsTrigger>
            <TabsTrigger value="vital">Vital</TabsTrigger>
            <TabsTrigger value="personal-preference">Personal Preference</TabsTrigger>
            <TabsTrigger value="problem-log">Problem Log</TabsTrigger>
            <TabsTrigger value="activity-preference">Activity Preference</TabsTrigger>
            <TabsTrigger value="routine">Routine</TabsTrigger>
            <TabsTrigger value="prescription">Prescription</TabsTrigger>
            <TabsTrigger value="photo-album">Photo Album</TabsTrigger>
            <TabsTrigger value="guardian">Guardian</TabsTrigger>
            <TabsTrigger value="activity-exclusion">Activity Exclusion</TabsTrigger>
          </TabsList>

            <TabsContent value="information">
              <div className="grid gap-2 md:grid-cols-2">
                <Card className="my-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Information</span> 
                      <Button size="sm" className="h-8 w-24 gap-1" onClick={() => openModal("editPatientInfo")}>
                        <FilePenLine className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Edit
                        </span>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2 md:grid-cols-2">
                    {/* First Half */}
                    <div className="space-y-2">
                      {patientInformationColumns.slice(0, Math.ceil(patientInformationColumns.length / 2)).map((column) => (
                        <div key={column.key} className="space-y-1">
                          <p className="text-sm font-medium">{column.header}</p>
                          <div className="text-sm text-muted-foreground flex items-center space-x-2">
                            {column.key === "nric" 
                              ? !isNRICMasked
                                ? nric || "-"
                                : nric || (mockPatientInformation[column.key as keyof PatientInformation] || "-")
                              : (mockPatientInformation[column.key as keyof PatientInformation] || "-")
                            }
                          {column.key === "nric" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={handleNRICToggle}
                              className="h-6 w-6 flex items-center justify-center ml-1"
                            >
                              {isNRICMasked ? (
                                <EyeIcon className="h-5 w-5" /> // Masked
                              ) : (
                                <EyeOffIcon className="h-5 w-5" /> // Unmasked
                              )}
                            </Button>
                          )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Second Half */}
                    <div className="space-y-2">
                      {patientInformationColumns.slice(Math.ceil(patientInformationColumns.length / 2)).map((column) => (
                        <div key={column.key} className="space-y-1">
                        <p className="text-sm font-medium">{column.header}</p>
                        <div className="text-sm text-muted-foreground flex items-center space-x-2">
                          {column.key === "nric" 
                            ? !isNRICMasked
                              ? nric || "-"
                              : nric || (mockPatientInformation[column.key as keyof PatientInformation] || "-")
                            : (mockPatientInformation[column.key as keyof PatientInformation] || "-")
                          }
                        {column.key === "nric" && (
                          <Button
                            size="icon"
                            variant="link"
                            onClick={handleNRICToggle}
                            className="h-6 w-6 flex items-center justify-center ml-1"
                          >
                            {isNRICMasked ? (
                              <EyeIcon className="h-5 w-5" /> // Masked
                            ) : (
                              <EyeOffIcon className="h-5 w-5" /> // Unmasked
                            )}
                          </Button>
                        )}
                        </div>
                      </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="my-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Diagonosed Dementia</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <DataTable
                    data={mockDiagnosedDementiaList}
                    columns={dementiaColumns}
                    viewMore={false}
                    hideActionsHeader={true}
                  />
                </CardContent>
              </Card>
              </div>


              <Card className="my-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Medical History</span>
                    <Button size="sm" className="h-8 w-24 gap-1" onClick={() => openModal("addMedicalHistory")}>
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add
                      </span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <DataTable
                    data={mockMediclaDetails}
                    columns={mediclaDetailsColumns}
                    viewMore={false}
                  />
                </CardContent>
              </Card>

              <Card className="my-4">
                <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                    <span>Mobility Aids</span>
                    <Button size="sm" className="h-8 w-24 gap-1" onClick={() => openModal("addMobilityAids")}>
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add
                      </span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <DataTable
                    data={mockMobilityAids}
                    columns={mobilityAidsColumns}
                    viewMore={false}
                  />
                </CardContent>
              </Card>

              <Card className="my-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Doctor's Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <DataTable
                    data={mockDoctorNotes}
                    columns={doctorNotesColumns}
                    viewMore={false}
                    hideActionsHeader={true}
                  />
                </CardContent>
              </Card>

              <div className="grid gap-2 md:grid-cols-2">
                <Card className="my-4">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Staff Allocation</span>
                      <Button size="sm" className="h-8 w-24 gap-1" onClick={() => openModal("editStaffAllocation")}>
                        <FilePenLine className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Edit
                        </span>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                  <DataTable
                      data={mockStaffAllocation}
                      columns={staffAllocationColumns}
                      viewMore={false}
                      hideActionsHeader={true}
                    />
                  </CardContent>
                </Card>
                
                {/* <Card className="my-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Social History</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2 md:grid-cols-2">
                      {socialHistoryColumns.map((column) => (
                        <div key={column.key} className="space-y-1">
                          <p className="text-sm font-medium">{column.header}</p>
                          <p className="text-sm text-muted-foreground">
                            {mockSocialHistory[column.key as keyof SocialHistory] || "-"}
                          </p>
                        </div>
                      ))}

                  </CardContent>
                </Card> */}

                <Card className="my-4">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Social History</span>
                      <Button size="sm" className="h-8 w-24 gap-1" onClick={()=>setActiveModal("editSocialHistory")}>
                        <FilePenLine className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Edit
                        </span>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {/* First Half */}
                    <div className="space-y-2">
                      {socialHistoryColumns.slice(0, Math.ceil(socialHistoryColumns.length / 2)).map((column) => (
                        <div key={column.key} className="space-y-1">
                          <p className="text-sm font-medium">{column.header}</p>
                          <p className="text-sm text-muted-foreground">
                            {mockSocialHistory[column.key as keyof SocialHistory] || "-"}
                          </p>
                        </div>
                      ))}
                    </div>
                    {/* Second Half */}
                    <div className="space-y-2">
                      {socialHistoryColumns.slice(Math.ceil(socialHistoryColumns.length / 2)).map((column) => (
                        <div key={column.key} className="space-y-1">
                          <p className="text-sm font-medium">{column.header}</p>
                          <p className="text-sm text-muted-foreground">
                            {mockSocialHistory[column.key as keyof SocialHistory] || "-"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </div>

            </TabsContent>


            <TabsContent value="allergy">
              <Card className="my-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Allergy</span>
                    <Button size="sm" className="h-8 w-24 gap-1" onClick={()=>setActiveModal("addAllergy")}>
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add
                      </span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable 
                    data={mockAllergy}
                    columns={allergyColumns}
                    viewMore={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vital">
              <Card className="my-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Vital Checks</span>
                    <Button size="sm" className="h-8 w-24 gap-1" onClick={()=>setActiveModal("addVital")}>
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add
                      </span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <DataTable 
                    data={mockVitalCheck}
                    columns={vitalCheckColumns}
                    viewMore={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personal-preference">
              <Card className="my-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Likes</span>
                    <Button size="sm" className="h-8 w-24 gap-1" onClick={()=>setActiveModal("addLike")}>
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add
                      </span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <DataTable 
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
                    <Button size="sm" className="h-8 w-24 gap-1" onClick={()=>setActiveModal("addDislike")}>
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add
                      </span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <DataTable 
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
                    <Button size="sm" className="h-8 w-24 gap-1" onClick={()=>setActiveModal("addHobby")}>
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add
                      </span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <DataTable 
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
                    <Button size="sm" className="h-8 w-24 gap-1" onClick={()=>setActiveModal("addHabit")}>
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add
                      </span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <DataTable 
                    data={mockHabit}
                    columns={personalPreferenceColumns}
                    viewMore={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>


            <TabsContent value="problem-log">
              <Card className="my-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Problem Log</span>
                    <Button size="sm" className="h-8 w-24 gap-1" onClick={()=>setActiveModal("addProblem")}>
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add
                      </span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <DataTable 
                    data={mockProblemLog}
                    columns={problemLogColumns}
                    viewMore={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>



            <TabsContent value="activity-preference">
              <Card className="my-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Activity Preferences</span>
                    <Button size="sm" className="h-8 w-24 gap-1">
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add
                      </span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <DataTable 
                    data={mockActivityPreferences}
                    columns={activityPreferencesColumns}
                    viewMore={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>



            <TabsContent value="routine">
              <Card className="my-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Routine</span>
                    <Button size="sm" className="h-8 w-24 gap-1">
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add
                      </span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <DataTable 
                    data={mockRoutine}
                    columns={routineColumns}
                    viewMore={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>



            <TabsContent value="prescription">
              <Card className="my-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Prescriptions</span>
                    <Button size="sm" className="h-8 w-24 gap-1" onClick={()=>setActiveModal("addPrescription")}>
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add
                      </span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <DataTable 
                    data={mockPrescription}
                    columns={prescriptionColumns}
                    viewMore={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>



            <TabsContent value="photo-album">
              <Card className="my-2">
                <CardHeader>
                  <CardTitle className="text-lg">Photo Album</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* List of Photo Albums - List of Photos - Photo */}
                </CardContent>
              </Card>
            </TabsContent>


            <TabsContent value="guardian">
              <Card className="my-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Guardian</span>
                    <Button size="sm" className="h-8 w-24 gap-1" onClick={()=>setActiveModal("addGuardian")}>
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add
                      </span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <DataTable 
                    data={mockGuardian}
                    columns={guardianColumns}
                    viewMore={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>


            <TabsContent value="activity-exclusion">
              <Card className="my-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Activity Exclusion</span>
                    <Button size="sm" className="h-8 w-24 gap-1">
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add
                      </span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <DataTable 
                    data={mockActivityExclusion}
                    columns={activityExclusionColumns}
                    viewMore={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
      </div>

      {activeModal === "editPatientInfo" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
            <h3 className="text-lg font-medium mb-5">Edit Patient Information</h3>
            <form onSubmit={handleEditInformation} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                 Preferred Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                 Hand Phone Number
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                />
              </div>
            

              <div>
                <label className="block text-sm font-medium">
                 Home Number
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                />
              </div>


              <div className="col-span-2"> 
                <label className="block text-sm font-medium">
                Patient Address<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium">
                Patient Temporary Address
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                />
              </div>
              
              <div className="col-span-2 flex space-x-4">
                <div className="w-full">
                  <label className="block text-sm font-medium">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                    required
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                    required
                  />
                </div>
              </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium">Upload Photo</label>
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                required
              />
            </div>

              <div>
                <label className="block text-sm font-medium">
                 Privacy Level<span className="text-red-600">*</span>
                </label>
                <select
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  required
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
              </select>
              </div>

              <div>
                <label className="block text-sm font-medium">
                 Patient Preferred Language<span className="text-red-600">*</span>
                </label>
                <select
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  required
                >
                  <option value="Cantonese">Cantonese</option>
                  <option value="English">English</option>
                  <option value="Hakka">Hakka</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Hokkien">Hokkien</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                  <option value="Malay">Malay</option>
                  <option value="Mandarin">Mandarin</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Teochew">Teochew</option>
              </select>
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Under Respite Care<span className="text-red-600">*</span>
                </label>
                <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">
                   Patient Still Active<span className="text-red-600">*</span>
                </label>
                <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="col-span-2 mt-6 flex justify-end space-x-2">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === "addMedicalHistory" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
                  <h3 className="text-lg font-medium mb-5">Add Medical History</h3>
                  <form onSubmit={handleAddMedicalHistory} className="grid grid-cols-2 gap-4">

                    <div className="col-span-2"> 
                      <label className="block text-sm font-medium">
                      Medical Details<span className="text-red-600">*</span>
                      </label>
                      <textarea
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        required
                      />
                    </div>

                    <div className="col-span-2"> 
                      <label className="block text-sm font-medium">
                      Information Source<span className="text-red-600">*</span>
                      </label>
                      <textarea
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium">
                        Medical Remark<span className="text-red-600">*</span>
                      </label>
                      <textarea
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                      />
                    </div>

                    <div className="col-span-2">
                      <div>
                        <label className="block text-sm font-medium">
                          Medical Estimated Date <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="date"
                          className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-span-2 mt-6 flex justify-end space-x-2">
                      <Button variant="outline" onClick={closeModal}>
                        Cancel
                      </Button>
                      <Button type="submit">Add</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

      {activeModal === "addMobilityAids" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
                  <h3 className="text-lg font-medium mb-5">Add Mobility Aids</h3>
                  <form onSubmit={handleAddMobilityAids} className="grid grid-cols-2 gap-4">

                    <div className="col-span-2"> 
                      <label className="block text-sm font-medium">
                      Mobility Aids<span className="text-red-600">*</span>
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="">Please select an option</option>
                        <option value="Cane">Cane</option>
                        <option value="Crutches">Crutches</option>
                        <option value="Gait_trainers">Gait trainers</option>
                        <option value="Scooter">Scooter</option>
                        <option value="Walkers">Walkers</option>
                        <option value="Wheelchairs">Wheelchairs</option>
                      </select>
                    </div>

                    <div className="col-span-2"> 
                      <label className="block text-sm font-medium">
                      Remark<span className="text-red-600">*</span>
                      </label>
                      <textarea
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium">
                        Condition<span className="text-red-600">*</span>
                      </label>
                      <select
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        required
                      >
                        <option value="">Please select an option</option>
                        <option value="Fully_Recovered">Fully Recovered</option>
                        <option value="Not_Recovered">Not Recovered</option>
                    </select>
                    </div>

                    <div className="col-span-2">
                      <div>
                        <label className="block text-sm font-medium">
                          Medical Estimated Date <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="date"
                          className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-span-2 mt-6 flex justify-end space-x-2">
                      <Button variant="outline" onClick={closeModal}>
                        Cancel
                      </Button>
                      <Button type="submit">Add</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}


      {activeModal === "editStaffAllocation" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
              <h3 className="text-lg font-medium mb-5">Edit Staff Allocation</h3>
              <form onSubmit={handleEditStaffAllocation} className="grid grid-cols-2 gap-4">

                <div className="col-span-2"> 
                  <label className="block text-sm font-medium">
                  Doctor<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                    required
                  />
                </div>

                <div className="col-span-2"> 
                  <label className="block text-sm font-medium">
                  Game Therapist<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium">
                  Supervisor<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <div>
                    <label className="block text-sm font-medium">
                    Caregiver<span className="text-red-600">*</span>
                    </label>
                    <input
                    type="text"
                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                    required
                  />
                  </div>
                </div>

                <div className="col-span-2 mt-6 flex justify-end space-x-2">
                  <Button variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit">Update</Button>
                </div>
              </form>
            </div>
          </div>
        )}

      
      {activeModal === "editSocialHistory" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
                  <h3 className="text-lg font-medium mb-5">Edit Social History</h3>
                  <form onSubmit={handleEditSocialHistory} className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">
                        Caffeine Use<span className="text-red-600">*</span>
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="-">Not to Tell</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                      Occupation <span className="text-red-600">*</span>
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="-">Not to tell</option>
                        <option value="Accountant">Accountant</option>
                        <option value="Actor">Actor</option>
                        <option value="Artist">Artist</option>
                        <option value="Business_owner">Business owner</option>
                        <option value="Chef/Cook">Chef/Cook</option>
                        <option value="Cleaner">Cleaner</option>
                        <option value="Clerk">Clerk</option>
                        <option value="Dentist">Dentist</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Driver">Driver</option>
                        <option value="Engineer">Engineer</option>
                        <option value="Fireman">Fireman</option>
                        <option value="Florist">Florist</option>
                        <option value="Gardener">Gardener</option>
                        <option value="Hawker">Hawker</option>
                        <option value="Homemaker">Homemaker</option>
                        <option value="Housekeeper">Housekeeper</option>
                        <option value="Labourer">Labourer</option>
                        <option value="Lawyer">Lawyer</option>
                        <option value="Manager">Manager</option>
                        <option value="Mechanic">Mechanic</option>
                        <option value="Nurse">Nurse</option>
                        <option value="Policeman">Policeman</option>
                        <option value="Professional_sportsperson">Professional sportsperson</option>
                        <option value="Professor">Professor</option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Sales_person">Sales person</option>
                        <option value="Scientist">Scientist</option>
                        <option value="Secretary">Secretary</option>
                        <option value="Security_guard">Security guard</option>
                        <option value="Singer">Singer</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Trader">Trader</option>
                        <option value="Unemployed">Unemployed</option>
                        <option value="Vet">Vet</option>
                        <option value="Waiter">Waiter</option>
                        <option value="Zoo_keeper">Zoo keeper</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                      Diet
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="-" >Not to tell</option>
                        <option value="Diabetic">Diabetic</option>
                        <option value="Gluten_free">Gluten-free</option>
                        <option value="Halal">Halal</option>
                        <option value="No_Cheese">No Cheese</option>
                        <option value="No_Dairy">No Dairy</option>
                        <option value="No_Meat">No Meat</option>
                        <option value="No_Peanuts">No Peanuts</option>
                        <option value="No_Seafood">No Seafood</option>
                        <option value="No_Vegetables">No Vegetables</option>
                        <option value="Soft_food">Soft food</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Vegetarian">Vegetarian</option>
                      </select>
                    </div>
                  

                    <div>
                      <label className="block text-sm font-medium">
                        Pet
                        <span className="text-red-600">*</span>
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="-">Not to Tell</option>
                        <option value="Bird">Bird</option>
                        <option value="Cat">Cat</option>
                        <option value="Dog">Dog</option>
                        <option value="Fish">Fish</option>
                        <option value="Guinea_Pig">Guinea Pig</option>
                        <option value="Hamster">Hamster</option>
                        <option value="Hedgehog">Hedgehog</option>
                        <option value="Rabbit">Rabbit</option>
                        <option value="Spider">Spider</option>
                        <option value="Tortoise">Tortoise</option>
                      </select>
                    </div>


                    <div>
                      <label className="block text-sm font-medium">
                        Drug Use
                        <span className="text-red-600">*</span>
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="-">Not to Tell</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        Religion
                        <span className="text-red-600">*</span>
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="-">Not to Tell</option>
                        <option value="Atheist">Atheist</option>
                        <option value="Buddhist">Buddhist</option>
                        <option value="Catholic">Catholic</option>
                        <option value="Christian">Christian</option>
                        <option value="Confucianism">Confucianism</option>
                        <option value="Free_Thinker">Free Thinker</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Islam">Islam</option>
                        <option value="Judaism">Judaism</option>
                        <option value="Protestantism">Protestantism</option>
                        <option value="Shinto">Shinto</option>
                        <option value="Shintoist">Shintoist</option>
                        <option value="Sikhism">Sikhism</option>
                        <option value="Spiritism">Spiritism</option>
                        <option value="Taoist">Taoist</option>
                      </select>
                    </div>
                    

                    <div>
                      <label className="block text-sm font-medium">
                      Education<span className="text-red-600">*</span>
                      </label>
                      <select
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        required
                      >
                        <option value="-">Not to Tell</option>
                        <option value="Primary_or_lower">Primary or lower</option>
                        <option value="Secondary">Secondary</option>
                        <option value="ITE">ITE</option>
                        <option value="Junior_College">Junior College</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Degree">Degree</option>
                        <option value="Master">Master</option>
                        <option value="Doctorate">Doctorate</option>
                        <option value="Vocational">Vocational</option>
                    </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        Secondhand Smoker<span className="text-red-600">*</span>
                      </label>
                      <select
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        required
                      >
                        <option value="-">Not to Tell</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                      Exercise<span className="text-red-600">*</span>
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="-">Not to Tell</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                          Sexually Active
                        <span className="text-red-600">*</span>
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="-">Not to Tell</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        Live With
                        <span className="text-red-600">*</span>
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="-">Not to Tell</option>
                        <option value="Alone">Alone</option>
                        <option value="Children">Children</option>
                        <option value="Family">Family</option>
                        <option value="Friend">Friend</option>
                        <option value="Parents">Parents</option>
                        <option value="Relative">Relative</option>
                        <option value="Spouse">Spouse</option>
                      </select>
                    </div>


                    <div>
                      <label className="block text-sm font-medium">
                        Tobacoo Use
                        <span className="text-red-600">*</span>
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="-">Not to Tell</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>


                    <div className="col-span-2 mt-6 flex justify-end space-x-2">
                      <Button variant="outline" onClick={closeModal}>
                        Cancel
                      </Button>
                      <Button type="submit">Update</Button>
                    </div>
                  </form>
                </div>
                
              </div>
            )}


      {activeModal === "addAllergy" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
                  <h3 className="text-lg font-medium mb-5">Add Allergy</h3>
                  <form onSubmit={handleAddAllergy} className="grid grid-cols-2 gap-4">

                    <div className="col-span-2"> 
                      <label className="block text-sm font-medium">
                        Allergy<span className="text-red-600">*</span>
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="">Please select an option</option>
                        <option value="Corn">Corn</option>
                        <option value="Fish">Fish</option>
                        <option value="Eggs">Eggs</option>
                        <option value="Meat">Meat</option>
                        <option value="Milk">Milk</option>
                        <option value="Peanuts">Peanuts</option>
                        <option value="Seafood">Seafood</option>
                        <option value="Shellfish">Shellfish</option>
                        <option value="Soy">Soy</option>
                        <option value="Tree_nuts">Tree nuts</option>
                        <option value="Wheat">Wheat</option>
                      </select>
                    </div>

                    <div className="col-span-2"> 
                      <label className="block text-sm font-medium">
                       Allergy Reaction<span className="text-red-600">*</span>
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="">Please select an option</option>
                        <option value="Abdominal_cramp_or_pain">Abdominal cramp or pain</option>
                        <option value="Diarrhea">Diarrhea</option>
                        <option value="Difficulty_Breathing">Difficulty Breathing</option>
                        <option value="Hives">Hives</option>
                        <option value="Itching">Itching</option>
                        <option value="Nasal_Congestion">Nasal Congestion</option>
                        <option value="Nausea">Nausea</option>
                        <option value="Rashes">Rashes</option>
                        <option value="Sneezing">Sneezing</option>
                        <option value="Swelling">Swelling</option>
                        <option value="Vomiting">Vomiting</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium">
                        Notes<span className="text-red-600">*</span>
                      </label>
                      <textarea
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                      />
                    </div>

                    <div className="col-span-2 mt-6 flex justify-end space-x-2">
                      <Button variant="outline" onClick={closeModal}>
                        Cancel
                      </Button>
                      <Button type="submit">Add</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

      {activeModal === "addVital" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
                  <h3 className="text-lg font-medium mb-5">Add Vital</h3>
                  <form onSubmit={handleAddVital} className="grid grid-cols-2 gap-4">

                    <div>
                      <label className="block text-sm font-medium">
                      Temperature (°C)<span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        min={35}
                        max={43}
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                      Weight (kg)<span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                      Height (m)<span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={2.5}
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                      Systolic BP (mmHg)<span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        min={70}
                        max={160}
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                      Diastolic BP (mmHg)<span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        min={40}
                        max={120}
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                      Heart Rate (bpm)<span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={300}
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        required
                      />
                    </div>


                    <div>
                      <label className="block text-sm font-medium">
                      SpO2 (%)<span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        min={60}
                        max={120}
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                      Blood Sugar Level (mmol/L)<span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        min={50}
                        max={250}
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        required
                      />
                    </div>

                  <div className="col-span-2 ">
                    <label className="block text-sm font-medium">
                    Vital Remark<span className="text-red-600">*</span>
                    </label>
                    <textarea
                      className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                      required
                    />
                  </div>

                    <div className="col-span-1">
                      <label className="block text-sm font-medium">
                      After Meal<span className="text-red-600">*</span>
                      </label>
                      <select
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        required
                      >
                        <option value="">Please select a option</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                  </div>


                    <div className="col-span-2 mt-6 flex justify-end space-x-2">
                      <Button variant="outline" onClick={closeModal}>
                        Cancel
                      </Button>
                      <Button type="submit">Add</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

      {activeModal === "addLike" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
                  <h3 className="text-lg font-medium mb-5">Add Like</h3>
                  <form onSubmit={handleAddLike} className="grid grid-cols-2 gap-4">

                    <div className="col-span-2"> 
                      <label className="block text-sm font-medium">
                      Mobility Aids<span className="text-red-600">*</span>
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="">Please select an option</option>
                        <option value="Animals_Pets_Wildlife">Animals/Pets/Wildlife</option>
                        <option value="Consume_alcohol">Consume alcohol</option>
                        <option value="Cooking_Food">Cooking/Food</option>
                        <option value="Dance">Dance</option>
                        <option value="Dirty_environment">Dirty environment</option>
                        <option value="Drama_Theatre">Drama/Theatre</option>
                        <option value="Exercise_Sports">Exercise/Sports</option>
                        <option value="Friends_Social_activities">Friends/Social activities</option>
                        <option value="Gambling">Gambling</option>
                        <option value="Gardening_plants">Gardening/plants</option>
                        <option value="Mannequin_Dolls">Mannequin/Dolls</option>
                        <option value="Movie_TV">Movie/TV</option>
                        <option value="Music_Singing">Music/Singing</option>
                        <option value="Natural_Scenery">Natural Scenery</option>
                        <option value="Noisy_environment">Noisy environment</option>
                        <option value="Reading">Reading</option>
                        <option value="Religious_activities">Religious activities</option>
                        <option value="Science_Technology">Science/Technology</option>
                        <option value="Smoking">Smoking</option>
                        <option value="Travelling_Sightseeing">Travelling/Sightseeing</option>
                      </select>
                    </div>

                    <div className="col-span-2 mt-6 flex justify-end space-x-2">
                      <Button variant="outline" onClick={closeModal}>
                        Cancel
                      </Button>
                      <Button type="submit">Add</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}


{activeModal === "addDislike" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
                  <h3 className="text-lg font-medium mb-5">Add Dislike</h3>
                  <form onSubmit={handleAddDislike} className="grid grid-cols-2 gap-4">

                    <div className="col-span-2"> 
                      <label className="block text-sm font-medium">
                      Mobility Aids<span className="text-red-600">*</span>
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="">Please select an option</option>
                        <option value="Animals_Pets_Wildlife">Animals/Pets/Wildlife</option>
                        <option value="Consume_alcohol">Consume alcohol</option>
                        <option value="Cooking_Food">Cooking/Food</option>
                        <option value="Dance">Dance</option>
                        <option value="Dirty_environment">Dirty environment</option>
                        <option value="Drama_Theatre">Drama/Theatre</option>
                        <option value="Exercise_Sports">Exercise/Sports</option>
                        <option value="Friends_Social_activities">Friends/Social activities</option>
                        <option value="Gambling">Gambling</option>
                        <option value="Gardening_plants">Gardening/plants</option>
                        <option value="Mannequin_Dolls">Mannequin/Dolls</option>
                        <option value="Movie_TV">Movie/TV</option>
                        <option value="Music_Singing">Music/Singing</option>
                        <option value="Natural_Scenery">Natural Scenery</option>
                        <option value="Noisy_environment">Noisy environment</option>
                        <option value="Reading">Reading</option>
                        <option value="Religious_activities">Religious activities</option>
                        <option value="Science_Technology">Science/Technology</option>
                        <option value="Smoking">Smoking</option>
                        <option value="Travelling_Sightseeing">Travelling/Sightseeing</option>
                      </select>
                    </div>

                    <div className="col-span-2 mt-6 flex justify-end space-x-2">
                      <Button variant="outline" onClick={closeModal}>
                        Cancel
                      </Button>
                      <Button type="submit">Add</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}




        {activeModal === "addHobby" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
                  <h3 className="text-lg font-medium mb-5">Add Hobby</h3>
                  <form onSubmit={handleAddHobby} className="grid grid-cols-2 gap-4">

                    <div className="col-span-2"> 
                      <label className="block text-sm font-medium">
                      Mobility Aids<span className="text-red-600">*</span>
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="">Please select an option</option>
                        <option value="Bird_Watching">Bird Watching</option>
                        <option value="Collecting">Collecting</option>
                        <option value="Crafting">Crafting</option>
                        <option value="Fishing">Fishing</option>
                        <option value="Gardening">Gardening</option>
                        <option value="Music">Music</option>
                        <option value="Reading">Reading</option>
                        <option value="Television">Television</option>
                        <option value="Travelling">Travelling</option>
                        <option value="Video_Games">Video Games</option>
                      </select>
                    </div>

                    <div className="col-span-2 mt-6 flex justify-end space-x-2">
                      <Button variant="outline" onClick={closeModal}>
                        Cancel
                      </Button>
                      <Button type="submit">Add</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}





            
      {activeModal === "addHabit" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
                  <h3 className="text-lg font-medium mb-5">Add Habit</h3>
                  <form onSubmit={handleAddHabit} className="grid grid-cols-2 gap-4">

                    <div className="col-span-2"> 
                      <label className="block text-sm font-medium">
                      Mobility Aids<span className="text-red-600">*</span>
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="">Please select an option</option>
                        <option value="Abnormal_Sleep_Cycle">Abnormal Sleep Cycle</option>
                        <option value="Biting_Objects">Biting Objects</option>
                        <option value="Crack_Knuckles">Crack Knuckles</option>
                        <option value="Daydreaming">Daydreaming</option>
                        <option value="Fidget_with_Objects">Fidget with Objects</option>
                        <option value="Frequent_Toilet_Visits">Frequent Toilet Visits</option>
                        <option value="Hair_Fiddling">Hair Fiddling</option>
                        <option value="Licking_Lips">Licking Lips</option>
                        <option value="Pick_nose">Pick nose</option>
                        <option value="Scratch_People">Scratch People</option>
                        <option value="Skip_meals">Skip meals</option>
                        <option value="Sleep_Walking">Sleep Walking</option>
                        <option value="Snacking">Snacking</option>
                        <option value="Talking_to_onese">Talking to oneself</option>
                        <option value="Thumb_Sucking">Thumb Sucking</option>
                        <option value="Worrying">Worrying</option>
                      </select>
                    </div>

                    <div className="col-span-2 mt-6 flex justify-end space-x-2">
                      <Button variant="outline" onClick={closeModal}>
                        Cancel
                      </Button>
                      <Button type="submit">Add</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}



      {activeModal === "addProblem" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
                  <h3 className="text-lg font-medium mb-5">Add Habit</h3>
                  <form onSubmit={handleAddProblem} className="grid grid-cols-2 gap-4">

                    <div className="col-span-2"> 
                      <label className="block text-sm font-medium">
                      Mobility Aids<span className="text-red-600">*</span>
                      </label>
                      <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                        <option value="">Please select an option</option>
                        <option value="Behavior">Behavior</option>
                        <option value="Communication">Communication</option>
                        <option value="Delusion">Delusion</option>
                        <option value="Emotion">Emotion</option>
                        <option value="Health">Health</option>
                        <option value="Memory">Memory</option>
                        <option value="Sleep">Sleep</option>
                      </select>
                    </div>

                    <div className="col-span-2"> 
                      <label className="block text-sm font-medium">
                      Mobility Aids<span className="text-red-600">*</span>
                      </label>
                      <textarea
                      className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                      required
                    />
                    </div>


                    <div className="col-span-2 mt-6 flex justify-end space-x-2">
                      <Button variant="outline" onClick={closeModal}>
                        Cancel
                      </Button>
                      <Button type="submit">Add</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}



        {activeModal === "addPrescription" && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
                          <h3 className="text-lg font-medium mb-5">Add Medical Prescription</h3>
                          <form onSubmit={handleAddPrescription} className="grid grid-cols-2 gap-4">

                            <div>
                              <label className="block text-sm font-medium">
                              Prescription<span className="text-red-600">*</span>
                              </label>
                              <select
                                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                required
                              >
                                <option value="">Please select a option</option>
                                <option value="Acetaminophen">Acetaminophen</option>
                                <option value="Antihistamines">Antihistamines</option>
                                <option value="Antihistamines">Antihistamines</option>
                                <option value="Dextromethorphan">Dextromethorphan</option>
                                <option value="Diphenhydramine">Diphenhydramine</option>
                                <option value="Donepezil">Donepezil</option>
                                <option value="Galantamine">Galantamine</option>
                                <option value="Guaifenesin">Guaifenesin</option>
                                <option value="Ibuprofen">Ibuprofen</option>
                                <option value="Memantine">Memantine</option>
                                <option value="Olanzapine">Olanzapine</option>
                                <option value="Paracetamol">Paracetamol</option>
                                <option value="Rivastigmine">Rivastigmine</option>
                                <option value="Salbutamol">Salbutamol</option>
                            </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium">
                              To be taken<span className="text-red-600">*</span>
                              </label>
                              <select
                                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                required
                              >
                                <option value="">Please select a option</option>
                                <option value="After_Meal">After Meal</option>
                                <option value="Before_Meal">Before Meal</option>
                                <option value="NA">Doesn't Matter</option>
                            </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium">
                              Dosage<span className="text-red-600">*</span>
                              </label>
                              <input
                                type="text"
                                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium">
                              Frequency per day<span className="text-red-600">*</span>
                              </label>
                              <input
                                type="number"
                                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                required
                              />
                            </div>

                            <div className="col-span-1">
                              <label className="block text-sm font-medium">
                                Period<span className="text-red-600">*</span>
                              </label>
                              <select
                                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                required
                              >
                                <option value="">Please select a option</option>
                                <option value="Short_Term">Short Term</option>
                                <option value="Long_Term">Long Term</option>
                            </select>
                            </div>

                            <div className="col-span-2">
                              <label className="block text-sm font-medium">
                              Instruction<span className="text-red-600">*</span>
                              </label>
                              <textarea
                                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                required
                              />
                            </div>

                            <div className="col-span-2 flex space-x-4">
                              <div className="w-full">
                                <label className="block text-sm font-medium">
                                  Start Date <span className="text-red-600">*</span>
                                </label>
                                <input
                                  type="date"
                                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                  required
                                />
                              </div>
                              <div className="w-full">
                                <label className="block text-sm font-medium">
                                  End Date <span className="text-red-600">*</span>
                                </label>
                                <input
                                  type="date"
                                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                  required
                                />
                              </div>
                            </div>

                          <div className="col-span-2 ">
                            <label className="block text-sm font-medium">
                            Remark<span className="text-red-600">*</span>
                            </label>
                            <textarea
                              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                              required
                            />
                          </div>


                            <div className="col-span-2 mt-6 flex justify-end space-x-2">
                              <Button variant="outline" onClick={closeModal}>
                                Cancel
                              </Button>
                              <Button type="submit">Add</Button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}



        {activeModal === "addGuardian" && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
                          <h3 className="text-lg font-medium mb-5">Add Guardian</h3>
                          <form onSubmit={handleAddGuardian} className="grid grid-cols-2 gap-4">

                          <div>
                        <label className="block text-sm font-medium">
                          Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">
                        Preferred Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">
                        NRIC <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">
                        Hand Phone Number <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="number"
                          className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        />
                      </div>
                      
                      <div className="col-span-1 flex space-x-4">
                        <div className="w-full">
                          <label className="block text-sm font-medium">
                            Date of Birth <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="date"
                            className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                            required
                          />
                        </div>
                      </div>

                      <div className="col-span-2"> 
                        <label className="block text-sm font-medium">
                        Address<span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium">
                        Temporary Address
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">
                        Relationship<span className="text-red-600">*</span>
                        </label>
                        <select
                          className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                          required
                        >
                          <option value="">Please select an option</option>
                          <option value="Aunt">Aunt</option>
                          <option value="Child">Child</option>
                          <option value="Friend">Friend</option>
                          <option value="Grandchild">Grandchild</option>
                          <option value="Grandparent">Grandparent</option>
                          <option value="Husband">Husband</option>
                          <option value="Nephew">Nephew</option>
                          <option value="Niece">Niece</option>
                          <option value="Parent">Parent</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Uncle">Uncle</option>
                          <option value="Wife">Wife</option>
                      </select>
                      </div>


                      <div className="col-span-2">
                        <label className="block text-sm font-medium">
                        Email
                        </label>
                        <input
                          type="email"
                          className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        />
                      </div>

                            <div className="col-span-2 mt-6 flex justify-end space-x-2">
                              <Button variant="outline" onClick={closeModal}>
                                Cancel
                              </Button>
                              <Button type="submit">Add</Button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}



    </div>
  );
};

export default ViewPatient;
