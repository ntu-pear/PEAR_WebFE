// import { fetchPatientById, PatientBase } from "@/api/patients";
import React, { useEffect, useState } from "react";
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
                      <Button size="sm" className="h-8 w-24 gap-1">
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
                      <Button size="sm" className="h-8 w-24 gap-1">
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
                      <Button size="sm" className="h-8 w-24 gap-1">
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
    </div>
  );
};

export default ViewPatient;
