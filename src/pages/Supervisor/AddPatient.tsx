import React, { useState, useEffect, useRef } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useAddPatient from "@/hooks/patient/useAddPatient";
import { useAuth } from "@/hooks/useAuth";
import { convertToUTCISOString, getDateTimeNowInUTC } from "@/utils/formatDate";
import useGetPreferredLanguageList from "@/hooks/dropDownList/useGetPreferredLanguageList";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useModal } from "@/hooks/useModal";
import RetrieveAddressModal from "@/components/Modal/Get/RetrieveAddressModal";
import ProfilePhotoSet from "@/components/ProfilePhotoSet";
import useUploadPatientPhoto from "@/hooks/patient/useUploadPatientPhoto";
import { AddPatientSection } from "@/api/patients/patients";
import useAddPatientPrivacyLevel from "@/hooks/patient/useAddPatientPrivacyLevel";
import { AddPatientPrivacyLevel } from "@/api/patients/privacyLevel";
import { addPatientGuardian, IGuardianFormData } from "@/api/patients/guardian";

const patientInfoSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Name is required" }),
    preferredName: z
      .string()
      .trim()
      .min(1, { message: "Preferred name is required" }),
    nric: z
      .string()
      .min(1, { message: "NRIC is required" })
      .regex(/^[STFGM]\d{7}[A-Z]$/, {
        message:
          "NRIC must be 9 characters in length and starts with character S,T,F,G,M",
      }),
    dateOfBirth: z
      .string()
      .min(1, { message: "Date of birth is required" })
      .refine(
        (date) => {
          const today = dayjs(); // Get the current date using Day.js
          const dob = dayjs(date); // Parse the provided date using Day.js
          const age = today.diff(dob, "year"); // Get the difference in years

          // Check if age is between 15 and 150 years
          return age >= 15 && age <= 150;
        },
        {
          message:
            "Date of Birth should be at least 15 years ago and no more than 150 years ago",
        }
      ),
    gender: z.enum(["M", "F"], {
      message: "Gender is required",
    }),
    homeNo: z
      .string()
      .regex(/^[6]\d{7}$/, {
        message: "Home Number must start with 6, and be 8 digits long.",
      })
      .optional()
      .or(z.literal("")),
    handphoneNo: z
      .string()
      .regex(/^[8,9]\d{7}$/, {
        message: "Mobile Number must start with 8 or 9, and be 8 digits long.",
      })
      .optional()
      .or(z.literal("")),
    address: z.string().trim().min(1, { message: "Address is required" }),
    tempAddress: z.string().trim().optional(),
    preferredLanguageId: z
      .number()
      .min(1, { message: "Preferred Language is required" }),
    isRespiteCare: z.enum(["0", "1"], {
      message: "Is Under Respite Care is Required",
    }),
    startDate: z
      .string()
      .min(1, { message: "Joining date is required" })
      .refine(
        (date) => {
          const today = dayjs(); // Current date using Day.js
          const startDate = dayjs(date); // Convert the provided start date to a Day.js object

          // Get the difference in days between today and the start date
          const diffInDays = today.diff(startDate, "day");

          // Check if the start date is within +/-30 days of today's date
          return Math.abs(diffInDays) <= 30;
        },
        {
          message: "Joining date must be +/-30 days from today date",
        }
      ),
    endDate: z.string().optional().or(z.literal("")),
  })
  //superrefine on entire object to compare 2 fields
  .superRefine((data, ctx) => {
    if (data.endDate && data.endDate !== "") {
      // Parse the dates using Day.js
      const startDate = dayjs(data.startDate).startOf("day"); // Get start of the day
      const endDate = dayjs(data.endDate).startOf("day"); // Get start of the day

      // Compare the two dates (endDate must be after startDate)
      if (endDate.isBefore(startDate, "day")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End Date must be after start date",
          path: ["endDate"],
        });
      }
    }
  });

const guardianSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .refine(
      (v) => /^[a-zA-Z]+$/.test(v),
      "First name must contain only letters"
    ),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .refine(
      (v) => /^[a-zA-Z]+$/.test(v),
      "Last name must contain only letters"
    ),
  preferredName: z.string().trim().min(1, "Preferred name is required"),
  gender: z.enum(["M", "F"], { message: "Gender is required" }),
  contactNo: z
    .string()
    .trim()
    .min(1, "Contact No. is required")
    .regex(/^[689]\d{7}$/, "Contact must start with 6/8/9 and be 8 digits"),
  nric: z
    .string()
    .trim()
    .min(1, "NRIC is required")
    .refine(
      (v) => /^[STFGM]\d{7}[A-Z]$/.test(v),
      "NRIC must be 9 chars: S/T/F/G/M + 7 digits + letter"
    ),
  email: z.string().trim().email("Invalid email"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().trim().min(1, "Address is required"),
  tempAddress: z.string().trim().optional().or(z.literal("")),
  relationshipName: z
    .string()
    .refine(
      (v): v is (typeof RELATIONSHIP_OPTIONS)[number] =>
        RELATIONSHIP_OPTIONS.includes(v as any),
      "Relationship is required"
    ),
});

const formSchema = z.object({
  patientInfoSchema: patientInfoSchema,
  guardians: z
    .array(guardianSchema)
    .min(1, "Patient guardian is required")
    .max(2, "Only up to 2 guardians"),
});

type FormInputs = z.infer<typeof formSchema>;

type AddressPath =
  | `patientInfoSchema.${"address" | "tempAddress"}`
  | `guardians.${number}.${"address" | "tempAddress"}`;

const RELATIONSHIP_OPTIONS = [
  "Husband",
  "Wife",
  "Child",
  "Parent",
  "Sibling",
  "Grandchild",
  "Friend",
  "Nephew",
  "Niece",
  "Aunt",
  "Uncle",
  "Grandparent",
];

const AddPatient: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("personal-info");
  const sections = useRef<{ [key: string]: HTMLElement | null }>({
    "personal-info": null,
    "guardian-info": null,
  });
  const isClickRef = useRef<boolean>(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientInfoSchema: {
        name: "",
        preferredName: "",
        nric: "",
        dateOfBirth: "",
        gender: undefined,
        homeNo: "",
        handphoneNo: "",
        address: "",
        tempAddress: "",
        preferredLanguageId: -1,
        isRespiteCare: undefined,
        startDate: "",
        endDate: "",
      },
      guardians: [],
    },
  });
  const {
    fields: guardianFields,
    append,
    remove,
  } = useFieldArray({ control, name: "guardians" });
  const preferredLanguageListObj = useGetPreferredLanguageList();
  const { mutateAsync: addPatient } = useAddPatient();
  const { mutateAsync: addPatientPrivacyLevel } = useAddPatientPrivacyLevel();
  const { mutateAsync: updatePatientProfilePhoto } = useUploadPatientPhoto();
  const { currentUser } = useAuth();
  const { activeModal, openModal } = useModal();

  const handleClick = (sectionId: string) => {
    isClickRef.current = true;
    setActiveSection(sectionId);

    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" });
    }

    setTimeout(() => {
      isClickRef.current = false;
    }, 2000);
  };

  const handleUpdateAddressField = (
    fieldName: AddressPath,
    searchedAddress: string
  ) => {
    console.log(`FIELD NAME: ${fieldName}`);
    console.log(`SEARCHED ADDRESS: ${searchedAddress}`);
    setValue(fieldName, searchedAddress, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleAddPatient: SubmitHandler<FormInputs> = async (data, event) => {
    event?.preventDefault();
    console.log("handleSubmit add patient", data);

    if (!currentUser || !currentUser.userId) {
      return;
    }

    const patientFormData: AddPatientSection = {
      name: data.patientInfoSchema.name,
      nric: data.patientInfoSchema.nric,
      address: data.patientInfoSchema.address,
      tempAddress: data.patientInfoSchema.tempAddress,
      homeNo: data.patientInfoSchema.homeNo,
      handphoneNo: data.patientInfoSchema.handphoneNo,
      gender: data.patientInfoSchema.gender,
      dateOfBirth: convertToUTCISOString(data.patientInfoSchema.dateOfBirth),
      isApproved: "1",
      preferredName: data.patientInfoSchema.preferredName,
      preferredLanguageId: undefined,
      updateBit: "1",
      autoGame: "1",
      startDate: convertToUTCISOString(data.patientInfoSchema.startDate),
      endDate: data.patientInfoSchema.endDate
        ? convertToUTCISOString(data.patientInfoSchema.endDate)
        : undefined,
      isActive: "1",
      isRespiteCare: data.patientInfoSchema.isRespiteCare,
      privacyLevel: 2,
      terminationReason: "",
      inActiveReason: "",
      inActiveDate: undefined,
      profilePicture: "",
      isDeleted: 0,
      createdDate: getDateTimeNowInUTC(),
      modifiedDate: getDateTimeNowInUTC(),
      CreatedById: currentUser?.userId,
      ModifiedById: currentUser?.userId,
    };

    console.log("addPatient formData", patientFormData);
    const response = await addPatient(patientFormData);
    const patientId = response.data.id;

    if (patientId && data.guardians.length > 0 && currentUser?.userId) {
      const creator = String(currentUser.userId);
      const now = getDateTimeNowInUTC();

      const guardians: IGuardianFormData[] = data.guardians.map((g) => ({
        active: "Y",
        firstName: g.firstName,
        lastName: g.lastName,
        preferredName: g.preferredName || "",
        gender: g.gender,
        contactNo: g.contactNo,
        nric: g.nric,
        email: g.email,
        dateOfBirth: convertToUTCISOString(g.dateOfBirth),
        address: g.address,
        tempAddress: g.tempAddress || "",
        status: "Y",
        isDeleted: "0",
        guardianApplicationUserId: null,
        createdDate: now,
        modifiedDate: now,
        CreatedById: creator,
        ModifiedById: creator,
        patientId,
        relationshipName: g.relationshipName,
      }));

      await Promise.all(
        guardians.map((guardian) => addPatientGuardian(guardian))
      );
    }

    if (patientId) {
      const addPatientPrivacyLevelForm: AddPatientPrivacyLevel = {
        accessLevelSensitive: 2,
        active: true,
        createdById: currentUser?.userId,
        modifiedById: currentUser?.userId,
        createdDate: getDateTimeNowInUTC(),
        modifiedDate: getDateTimeNowInUTC(),
      };
      console.log("patientId", patientId);
      console.log("addPatientPrivacyLevelForm", addPatientPrivacyLevelForm);
      await addPatientPrivacyLevel({
        patientId,
        formData: addPatientPrivacyLevelForm,
      });
    }

    if (patientId && profilePhotoFile) {
      const photoFileFormData = new FormData();
      photoFileFormData.append("file", profilePhotoFile);

      console.log("patientId", patientId);
      console.log("photoFileFormData", photoFileFormData);
      await updatePatientProfilePhoto({
        patientId,
        formData: photoFileFormData,
      });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!isClickRef.current) {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
            }
          });
        }
      },
      {
        threshold: [0.75, 1],
      }
    );

    Object.keys(sections.current).forEach((key) => {
      const sectionElement = document.getElementById(key);
      if (sectionElement) {
        observer.observe(sectionElement);
        sections.current[key] = sectionElement;
      }
    });

    return () => {
      Object.keys(sections.current).forEach((key) => {
        if (sections.current[key]) {
          observer.unobserve(sections.current[key]!);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (preferredLanguageListObj.error) {
      toast.error("Failed to fetch preferred language list");
    }
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row container mx-auto px-4">
      {/* Left Sidebar Navigation */}
      <nav className="w-full lg:w-1/4 px-6 text-xl text-gray-800 leading-normal">
        <div className="sticky top-0 z-10">
          <p className="text-2xl font-bold py-4 text-primary">Add Patient</p>
        </div>
        <ul className="list-reset py-2 md:py-0 lg:sticky lg:top-16">
          <li
            className={`py-1 md:my-2 hover:bg-yellow-100 lg:hover:bg-transparent border-l-4 ${
              activeSection === "personal-info"
                ? "border-lime-500 font-bold"
                : "border-transparent"
            }`}
          >
            <a
              href="#personal-info"
              onClick={() => handleClick("personal-info")}
              className="block pl-4 align-middle no-underline hover:text-yellow-600 text-primary"
            >
              <span className="pb-1 md:pb-0 text-sm">Patient Information</span>
            </a>
          </li>
          <li
            className={`py-1 md:my-2 hover:bg-yellow-100 lg:hover:bg-transparent border-l-4 ${
              activeSection === "guardian-info"
                ? "border-lime-500 font-bold"
                : "border-transparent"
            }`}
          >
            <a
              href="#guardian-info"
              onClick={() => handleClick("guardian-info")}
              className="block pl-4 align-middle no-underline hover:text-yellow-600 text-primary"
            >
              <span className="pb-1 md:pb-0 text-sm">Guardian Information</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* Right Form Content */}
      <div className="w-full lg:w-3/4 p-6">
        <form onSubmit={handleSubmit(handleAddPatient)}>
          {/* Patient Information */}
          <div id="personal-info" className="pb-12">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold leading-7 text-foreground">
                      Patient Information
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Add in patient's personal information
                    </p>
                    <Separator className="my-4" />

                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                      <div className="sm:col-span-2">
                        <Label htmlFor="patient-name">
                          Name <span className="text-destructive ml-1">*</span>
                        </Label>
                        <input
                          id="patient-name"
                          type="text"
                          className=" block w-full p-2 border rounded-md text-gray-900"
                          {...register("patientInfoSchema.name")}
                        />
                        {errors.patientInfoSchema?.name && (
                          <div className="text-red-600 text-sm">
                            {errors.patientInfoSchema?.name.message}
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="patient-preferred-name">
                          Preferred Name{" "}
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <input
                          id="patient-preferred-name"
                          type="text"
                          className=" block w-full p-2 border rounded-md text-gray-900"
                          {...register("patientInfoSchema.preferredName")}
                        />

                        {errors.patientInfoSchema?.preferredName && (
                          <div className="text-red-600 text-sm">
                            {errors.patientInfoSchema?.preferredName.message}
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-1"></div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="patient-nric">
                          NRIC <span className="text-destructive ml-1">*</span>
                        </Label>
                        <input
                          id="patient-nric"
                          type="text"
                          maxLength={9}
                          className=" block w-full p-2 border rounded-md text-gray-900"
                          {...register("patientInfoSchema.nric")}
                        />
                        {errors.patientInfoSchema?.nric && (
                          <div className="text-red-600 text-sm">
                            {errors.patientInfoSchema?.nric.message}
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="patient-dob">
                          Date of Birth{" "}
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <input
                          id="patient-dob"
                          type="date"
                          className=" block w-full p-2 border rounded-md text-gray-900"
                          {...register("patientInfoSchema.dateOfBirth")}
                        />
                        {errors.patientInfoSchema?.dateOfBirth && (
                          <div className="text-red-600 text-sm">
                            {errors.patientInfoSchema?.dateOfBirth.message}
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="patient-gender">
                          Gender{" "}
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <div className="flex gap-4 mt-2">
                          <div className="border border-input rounded-md px-4 py-2">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="patient-gender-male"
                                value="M"
                                {...register("patientInfoSchema.gender")}
                                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                              />
                              <Label
                                htmlFor="patient-gender-male"
                                className="ml-2 cursor-pointer"
                              >
                                Male
                              </Label>
                            </div>
                          </div>
                          <div className="border border-input rounded-md px-4 py-2">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="patient-gender-female"
                                value="F"
                                {...register("patientInfoSchema.gender")}
                                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                              />
                              <Label
                                htmlFor="patient-gender-female"
                                className="ml-2 cursor-pointer"
                              >
                                Female
                              </Label>
                            </div>
                          </div>
                        </div>
                        {errors.patientInfoSchema?.gender && (
                          <div className="text-red-600 text-sm">
                            {errors.patientInfoSchema?.gender.message}
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="patient-home-number">Home Number</Label>
                        <input
                          id="patient-home-number"
                          maxLength={8}
                          className="block w-full p-2 border rounded-md text-gray-900"
                          {...register("patientInfoSchema.homeNo")}
                        />
                        {errors.patientInfoSchema?.homeNo && (
                          <div className="text-red-600 text-sm">
                            {errors.patientInfoSchema?.homeNo.message}
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="patient-handphone-number">
                          Mobile Number
                        </Label>
                        <input
                          id="patient-handphone-number"
                          maxLength={8}
                          className="block w-full p-2 border rounded-md text-gray-900"
                          {...register("patientInfoSchema.handphoneNo")}
                        />
                        {errors.patientInfoSchema?.handphoneNo && (
                          <div className="text-red-600 text-sm">
                            {errors.patientInfoSchema?.handphoneNo.message}
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-4">
                        <Label htmlFor="patient-address">
                          Address{" "}
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <div className="flex gap-2 mt-2">
                          <input
                            id="patient-address"
                            className="block w-full p-2 border rounded-md text-gray-900"
                            {...register("patientInfoSchema.address")}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              openModal("retrieveAddress", {
                                fieldName: "patientInfoSchema.address",
                                handleUpdateAddressField,
                              })
                            }
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                        {errors.patientInfoSchema?.address && (
                          <div className="text-red-600 text-sm">
                            {errors.patientInfoSchema?.address.message}
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-4">
                        <Label htmlFor="patient-temporary-address">
                          Temporary Address
                        </Label>
                        <div className="flex gap-2 mt-2">
                          <input
                            id="patient-temporary-address"
                            className="block w-full p-2 border rounded-md text-gray-900"
                            {...register("patientInfoSchema.tempAddress")}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              openModal("retrieveAddress", {
                                fieldName: "patientInfoSchema.tempAddress",
                                handleUpdateAddressField,
                              })
                            }
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                        {errors.patientInfoSchema?.tempAddress && (
                          <div className="text-red-600 text-sm">
                            {errors.patientInfoSchema?.tempAddress.message}
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-1" />

                      <div className="sm:col-span-6">
                        <Label>Patient Profile Photo </Label>
                        <Card>
                          <CardContent className="pt-6">
                            <ProfilePhotoSet
                              profilePhotoFile={profilePhotoFile}
                              setProfilePhotoFile={setProfilePhotoFile}
                            />
                          </CardContent>
                        </Card>
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="patient-preferred-language">
                          Patient Preferred Language{" "}
                          <span className="text-red-600">*</span>
                        </Label>
                        <select
                          id="patient-preferred-language"
                          className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                          {...register(
                            "patientInfoSchema.preferredLanguageId",
                            {
                              setValueAs: (value) => Number(value),
                            }
                          )}
                        >
                          <option value="-1">Please select an option</option>
                          {preferredLanguageListObj.data?.map((pl) => (
                            <option key={pl.id} value={pl.id}>
                              {pl.value}
                            </option>
                          ))}
                        </select>

                        {errors.patientInfoSchema?.preferredLanguageId && (
                          <div className="text-red-600 text-sm">
                            {
                              errors.patientInfoSchema?.preferredLanguageId
                                .message
                            }
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="patient-respite-care">
                          Under Respite Care{" "}
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <div className="flex gap-4 mt-2">
                          <div className="border border-input rounded-md px-4 py-2">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="patient-respite-care-yes"
                                value="1"
                                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                {...register("patientInfoSchema.isRespiteCare")}
                              />
                              <Label
                                htmlFor="patient-respite-care-yes"
                                className="ml-2 cursor-pointer"
                              >
                                Yes
                              </Label>
                            </div>
                          </div>
                          <div className="border border-input rounded-md px-4 py-2">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="patient-respite-care-no"
                                value="0"
                                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                {...register("patientInfoSchema.isRespiteCare")}
                              />
                              <Label
                                htmlFor="patient-respite-care-no"
                                className="ml-2 cursor-pointer"
                              >
                                No
                              </Label>
                            </div>
                          </div>
                        </div>
                        {errors.patientInfoSchema?.isRespiteCare && (
                          <div className="text-red-600 text-sm">
                            {errors.patientInfoSchema?.isRespiteCare.message}
                          </div>
                        )}
                      </div>
                      <div className="sm:col-span-2" />

                      <div className="sm:col-span-2">
                        <Label htmlFor="patient-joining-date">
                          Joining Date{" "}
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <input
                          id="patient-joining-date"
                          type="date"
                          className=" block w-full p-2 border rounded-md text-gray-900"
                          {...register("patientInfoSchema.startDate")}
                        />
                        {errors.patientInfoSchema?.startDate && (
                          <div className="text-red-600 text-sm">
                            {errors.patientInfoSchema?.startDate.message}
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="patient-leaving-date">
                          Leaving Date (if any)
                        </Label>
                        <input
                          id="patient-leaving-date"
                          type="date"
                          className=" block w-full p-2 border rounded-md text-gray-900"
                          {...register("patientInfoSchema.endDate")}
                        />
                        {errors.patientInfoSchema?.endDate && (
                          <div className="text-red-600 text-sm">
                            {errors.patientInfoSchema?.endDate.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Guardian Information */}
          <div id="guardian-info" className="pb-12">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold leading-7 text-foreground">
                      Guardian Information
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Add up to two guardians linked to this patient. <br /> The
                      first guardian will be marked as the primary guardian, and
                      the second as the secondary guardian.
                    </p>
                    <Separator className="my-4" />

                    {guardianFields.length === 0 && (
                      <div className="text-sm text-muted-foreground">
                        No guardians added yet.
                      </div>
                    )}

                    {/* Guardians list */}
                    {guardianFields.map((g, index) => (
                      <div
                        key={g.id}
                        className="border rounded-lg p-4 mb-6 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6"
                      >
                        <div className="sm:col-span-6 flex items-center justify-between mb-2">
                          <p className="font-semibold">
                            {index === 0
                              ? "Primary guardian"
                              : "Secondary guardian"}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {index === 0
                              ? "Main point of contact"
                              : "Additional / backup contact"}
                          </span>
                        </div>
                        <div className="sm:col-span-2">
                          <Label>
                            First Name{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <input
                            className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                            {...register(`guardians.${index}.firstName`)}
                          />
                          {errors.guardians?.[index]?.firstName && (
                            <div className="text-red-600 text-sm">
                              {
                                errors.guardians[index]!.firstName!
                                  .message as string
                              }
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <Label>
                            Last Name{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <input
                            className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                            {...register(`guardians.${index}.lastName`)}
                          />
                          {errors.guardians?.[index]?.lastName && (
                            <div className="text-red-600 text-sm">
                              {
                                errors.guardians[index]!.lastName!
                                  .message as string
                              }
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-2 flex items-start justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            className="text-red-600 border-red-200"
                            onClick={() => remove(index)}
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="sm:col-span-3">
                          <Label>
                            Preferred Name
                            <span className="text-destructive">*</span>
                          </Label>
                          <input
                            className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                            {...register(`guardians.${index}.preferredName`)}
                          />
                          {errors.guardians?.[index]?.preferredName && (
                            <div className="text-red-600 text-sm">
                              {
                                errors.guardians[index]!.preferredName!
                                  .message as string
                              }
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-3">
                          <Label>
                            Relationship{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <select
                            className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                            {...register(`guardians.${index}.relationshipName`)}
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Please select a relationship
                            </option>
                            {RELATIONSHIP_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                          {errors.guardians?.[index]?.relationshipName && (
                            <div className="text-red-600 text-sm">
                              {
                                errors.guardians[index]!.relationshipName!
                                  .message as string
                              }
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <Label>
                            NRIC
                            <span className="text-destructive">*</span>
                          </Label>
                          <input
                            maxLength={9}
                            className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                            {...register(`guardians.${index}.nric`)}
                          />
                          {errors.guardians?.[index]?.nric && (
                            <div className="text-red-600 text-sm">
                              {errors.guardians[index]!.nric!.message as string}
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <Label>
                            Date of Birth{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <input
                            type="date"
                            className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                            {...register(`guardians.${index}.dateOfBirth`)}
                          />
                          {errors.guardians?.[index]?.dateOfBirth && (
                            <div className="text-red-600 text-sm">
                              {
                                errors.guardians[index]!.dateOfBirth!
                                  .message as string
                              }
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <Label>
                            Gender <span className="text-destructive">*</span>
                          </Label>
                          <div className="flex gap-4 mt-2">
                            <label className="border border-input rounded-md px-4 py-2 cursor-pointer">
                              <input
                                type="radio"
                                value="M"
                                {...register(`guardians.${index}.gender`)}
                                className="mr-2"
                              />
                              Male
                            </label>
                            <label className="border border-input rounded-md px-4 py-2 cursor-pointer">
                              <input
                                type="radio"
                                value="F"
                                {...register(`guardians.${index}.gender`)}
                                className="mr-2"
                              />
                              Female
                            </label>
                          </div>
                          {errors.guardians?.[index]?.gender && (
                            <div className="text-red-600 text-sm">
                              {
                                errors.guardians[index]!.gender!
                                  .message as string
                              }
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <Label>
                            Contact No.{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <input
                            maxLength={8}
                            className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                            {...register(`guardians.${index}.contactNo`)}
                          />
                          {errors.guardians?.[index]?.contactNo && (
                            <div className="text-red-600 text-sm">
                              {
                                errors.guardians[index]!.contactNo!
                                  .message as string
                              }
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <Label>
                            Email
                            <span className="text-destructive">*</span>
                          </Label>
                          <input
                            type="email"
                            className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                            {...register(`guardians.${index}.email`)}
                          />
                          {errors.guardians?.[index]?.email && (
                            <div className="text-red-600 text-sm">
                              {
                                errors.guardians[index]!.email!
                                  .message as string
                              }
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-4">
                          <Label>
                            Address{" "}
                            <span className="text-destructive ml-1">*</span>
                          </Label>
                          <div className="flex gap-2 mt-2">
                            <input
                              className="block w-full p-2 border rounded-md text-gray-900"
                              {...register(`guardians.${index}.address`)}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                openModal("retrieveAddress", {
                                  fieldName: `guardians.${index}.address`,
                                  handleUpdateAddressField,
                                })
                              }
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>
                          {errors.guardians?.[index]?.address && (
                            <div className="text-red-600 text-sm">
                              {
                                errors.guardians[index]!.address!
                                  .message as string
                              }
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-4">
                          <Label>Temporary Address</Label>
                          <div className="flex gap-2 mt-2">
                            <input
                              className="block w-full p-2 border rounded-md text-gray-900"
                              {...register(`guardians.${index}.tempAddress`)}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                openModal("retrieveAddress", {
                                  fieldName: `guardians.${index}.tempAddress`,
                                  handleUpdateAddressField,
                                })
                              }
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>
                          {errors.guardians?.[index]?.tempAddress && (
                            <div className="text-red-600 text-sm">
                              {
                                errors.guardians[index]!.tempAddress!
                                  .message as string
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add / Remove buttons */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          guardianFields.length < 2 &&
                          append({
                            firstName: "",
                            lastName: "",
                            preferredName: "",
                            gender: undefined as unknown as "M" | "F",
                            contactNo: "",
                            nric: "",
                            email: "",
                            dateOfBirth: "",
                            address: "",
                            tempAddress: "",
                            relationshipName: "",
                          })
                        }
                        disabled={guardianFields.length >= 2}
                      >
                        Add Guardian
                      </Button>
                      {guardianFields.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {guardianFields.length}/2 added
                        </span>
                      )}
                    </div>
                    {errors.guardians?.message && (
                      <div className="text-red-600 text-sm">
                        {errors.guardians?.message}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex items-center justify-end gap-x-6">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add Patient
            </button>
          </div>
        </form>
      </div>
      {activeModal.name === "retrieveAddress" && <RetrieveAddressModal />}
    </div>
  );
};

export default AddPatient;
