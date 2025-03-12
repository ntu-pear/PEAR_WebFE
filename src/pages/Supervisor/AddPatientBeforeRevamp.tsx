import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import dayjs, { Dayjs } from "dayjs";
import { DatePickerField } from "@/components/ui/date-picker";

const AddPatient: React.FC = () => {
  {
    /* Sidebar Navigation */
  }
  const [activeSection, setActiveSection] = useState<string>("personal-info");
  const [error, setError] = useState<string | null>(null);
  const sections = useRef<{ [key: string]: HTMLElement | null }>({
    "personal-info": null,
    "guardian-info": null,
  });
  const isClickRef = useRef<boolean>(false);

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

  {
    /* Patient Info Section */
  }
  const [selectedPatientGender, setSelectedPatientGender] = useState<string>(
    "patient-gender-male"
  );

  const [patientPreferredLanguage, setPatientPreferredLanguage] = useState("");
  const handlePatientLanguageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedLanguage = e.target.value;
    setPatientPreferredLanguage(selectedLanguage);
    if (selectedLanguage) {
      setError(null);
    }
  };

  const handleGenderPatientChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedPatientGender(event.target.id);
  };

  const [profilePictureFile, setProfilePictureFile] = useState<string | null>(
    null
  );
  const [profilePictureError, setProfilePictureError] = useState<string | null>(
    null
  );
  const [profilePictureButtonText, setProfilePictureButtonText] =
    useState<string>("Upload Picture");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setProfilePictureError("Please select a valid image file.");
        setProfilePictureFile(null);
        setProfilePictureButtonText("Upload Picture");
        return;
      }
      setProfilePictureError(null);
      setProfilePictureFile(URL.createObjectURL(selectedFile));
      setProfilePictureButtonText("Change Pciture");
    }
  };

  const [selectedRespiteCare, setSelectedRespiteCare] = useState<string>(
    "patient-respite-care-yes"
  );

  const handleRespiteCareChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedRespiteCare(event.target.id);
  };

  const [patientJoiningDate, setPatientJoiningDate] =
    useState<dayjs.Dayjs | null>(null);
  const [patientLeavingDate, setPatientLeavingDate] =
    useState<dayjs.Dayjs | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const handlePatientJoiningDateChange = (date: Dayjs | null) => {
    setPatientJoiningDate(date);
    validateDates(date, patientLeavingDate);
  };

  const handlePatientLeavingDateChange = (date: Dayjs | null) => {
    setPatientLeavingDate(date);
    validateDates(patientJoiningDate, date);
  };

  const validateDates = (start: Dayjs | null, end: Dayjs | null) => {
    if (start && end && end.isBefore(start)) {
      setDateError(
        "Leaving date must be the same or later than the joining date."
      );
    } else {
      setDateError(null);
    }
  };

  {
    /* Guardian Info Section */
  }
  const [selectedGuardianGender, setSelectedGuardiandGender] = useState<string>(
    "guardian-gender-male"
  );

  const handleGuardianGenderChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedGuardiandGender(event.target.id);
  };

  const [selectedSecondaryGuardianGender, setSelectedSecondaryGuardiandGender] =
    useState<string>("guardian-gender-male");

  const handleSecondaryGuardianGenderChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedSecondaryGuardiandGender(event.target.id);
  };

  const [showSecondaryGuardian, setShowSecondaryGuardian] = useState(false);

  const handleToggleSecondaryGuardian = () => {
    setShowSecondaryGuardian(!showSecondaryGuardian);
  };

  const [guardianRelationship, setGuardianRelationship] = useState("");
  const handleGuardianRelationship = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const guardianRelationship = e.target.value;
    setGuardianRelationship(guardianRelationship);
    if (guardianRelationship) {
      setError(null);
    }
  };

  const [secondaryGuardianRelationship, setSecondaryGuardianRelationship] =
    useState("");
  const handleSecondaryGuardianRelationship = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const secondaryGuardianRelationship = e.target.value;
    setSecondaryGuardianRelationship(secondaryGuardianRelationship);
    if (secondaryGuardianRelationship) {
      setError(null);
    }
  };

  {
    /* Validation*/
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientPreferredLanguage) {
      setError("Please select a language.");
    } else {
      console.log("Language selected:", patientPreferredLanguage);
      // Proceed with form submission logic
    }
  };

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
        <form onSubmit={handleSubmit}>
          <div className="space-y-12">
            {/* Patient Information */}
            <div id="personal-info" className="border-b-2 border-border pb-12">
              <h2 className="text-base font-semibold leading-7 text-gray-900 text-primary">
                Patient Information
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600 text-primary">
                Add in patient's personal information
              </p>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-gray-900 text-primary">
                    Name <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="mt-2">
                    <Input
                      id="patient-name"
                      name="patient-name"
                      type="text"
                      required
                      validationRegex={/^[A-Za-z]*$/} // Only allow letters
                      requiredMessage="Please enter the Name."
                      validationMessage="Only letters are allowed in the Name."
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="patient-preferred-name"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Preferred Name <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="mt-2">
                    <Input
                      id="patient-preferred-name"
                      name="patient-preferred-name"
                      type="text"
                      required
                      validationRegex={/^[A-Za-z]*$/} // Only allow letters
                      requiredMessage="Please enter the Preferred Name."
                      validationMessage="Only letters are allowed in the Preferred Name."
                    />
                  </div>
                </div>

                <div className="sm:col-span-1"></div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="patient-nric"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    NRIC <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="mt-2">
                    <Input
                      id="patient-nric"
                      name="patient-nric"
                      type="text"
                      required
                      validationRegex={/^[STFG]\d{7}[A-Z]$/i} // NRIC Regex
                      requiredMessage="Please enter the NRIC."
                      validationMessage="Please enter a valid NRIC."
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 block">
                  <div className="flex space-x-4 mt-2">
                    <DatePickerField
                      label="Date of Birth"
                      required={true}
                      errorMessage="Please select a valid Date of Birth."
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="patient-gender"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Gender <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex space-x-4 mt-2">
                    <div className="flex items-center border border-gray-200 rounded dark:border-gray-700 px-4 py-2">
                      <input
                        id="patient-gender-male"
                        type="radio"
                        value="patient-gender-male"
                        name="patient-gender-male"
                        checked={
                          selectedPatientGender === "patient-gender-male"
                        }
                        onChange={handleGenderPatientChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="patient-gender-male"
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Male
                      </label>
                    </div>

                    <div className="flex items-center border border-gray-200 rounded dark:border-gray-700 px-4 py-2">
                      <input
                        id="patient-gender-female"
                        type="radio"
                        value="patient-gender-female"
                        name="patient-gender-female"
                        checked={
                          selectedPatientGender === "patient-gender-female"
                        }
                        onChange={handleGenderPatientChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="patient-gender-female"
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Female
                      </label>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="patient-home-number"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Home Number
                  </label>
                  <div className="mt-2">
                    <Input
                      id="patient-home-number"
                      name="patient-home-number"
                      type="text"
                      validationRegex={/^6\d{7}$/} // Allow home number to start with 6 followed by 7 more digits
                      validationMessage="Home number must be 8 digits and start with '6'."
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="patient-mobile-number"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Mobile Number
                  </label>
                  <div className="mt-2">
                    <Input
                      id="patient-mobile-number"
                      name="patient-mobile-number"
                      autoComplete="patient-mobile-number"
                      type="text"
                      validationRegex={/^[89]\d{7}$/} // Allow home number to start with 6 followed by 7 more digits
                      validationMessage="Mobile number must be 8 digits and start with 8 or 9."
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="patient-address"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Address <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="mt-2">
                    <Input
                      id="patient-address"
                      name="patient-address"
                      type="text"
                      autoComplete="patient-address"
                      required
                      requiredMessage="Please enter an Address."
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="patient-temporary-address"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Temporary Address
                  </label>
                  <div className="mt-2">
                    <Input
                      id="patient-temporary-address"
                      name="patient-temporary-address"
                      type="text"
                      autoComplete="patient-temporary-address"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="patient-profile-picture"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Profile Picture
                  </label>
                  <div className="image-uploader p-4 border-2 rounded-md">
                    <div className="flex items-center">
                      {profilePictureFile && (
                        <img
                          src={profilePictureFile}
                          alt="Uploaded Preview"
                          className="w-24 h-24 rounded-full object-cover mr-4"
                        />
                      )}
                      <label
                        htmlFor="file-upload"
                        className={`cursor-pointer inline-block px-4 py-2 text-sm font-semibold text-white rounded-md hover:bg-indigo-500 ${
                          profilePictureFile ? "bg-indigo-600" : "bg-indigo-600"
                        }`}
                      >
                        {profilePictureButtonText}
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        onChange={handleChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    {profilePictureError && (
                      <p className="text-red-500 text-sm mt-2">
                        {profilePictureError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="patient-language"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Preferred Language{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="mt-2">
                    <select
                      id="patient-language"
                      name="patient-language"
                      value={patientPreferredLanguage}
                      onChange={handlePatientLanguageChange}
                      className={`block w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:max-w-xs sm:text-sm sm:leading-6 ${
                        error
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-indigo-600"
                      }`}
                      required
                    >
                      <option value="">Please select a language</option>
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
                    {error && (
                      <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                  </div>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="patient-respite-care"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Under Respite Care{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex space-x-4 mt-2">
                    <div className="flex items-center border border-gray-200 rounded dark:border-gray-700 px-4 py-2">
                      <input
                        id="patient-respite-care-yes"
                        type="radio"
                        value="patient-respite-care-yes"
                        name="patient-respite-care-yes"
                        checked={
                          selectedRespiteCare === "patient-respite-care-yes"
                        }
                        onChange={handleRespiteCareChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="patient-respite-care-yes"
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Yes
                      </label>
                    </div>

                    <div className="flex items-center border border-gray-200 rounded dark:border-gray-700 px-4 py-2">
                      <input
                        id="patient-respite-care-no"
                        type="radio"
                        value="patient-respite-care-no"
                        name="patient-respite-care-no"
                        checked={
                          selectedRespiteCare === "patient-respite-care-no"
                        }
                        onChange={handleRespiteCareChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="patient-respite-care-no"
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        No
                      </label>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <DatePickerField
                    label="Joining Date"
                    required={true}
                    value={patientJoiningDate}
                    onChange={handlePatientJoiningDateChange}
                    errorMessage="Please select a valid joining date."
                  />
                </div>
                <div className="sm:col-span-2">
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                  <DatePickerField
                    label="Leaving Date (if any)"
                    value={patientLeavingDate}
                    onChange={handlePatientLeavingDateChange}
                    isError={!!dateError}
                  />
                  {dateError && (
                    <p className="text-red-500 text-sm mt-1">{dateError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div id="guardian-info" className="border-b-2 border-border pb-12">
              <h2 className="text-base font-semibold leading-7 text-primary">
                Guardian Information
              </h2>
              <p className="mt-1 text-sm leading-6 text-primary">
                Add in guardian's personal information
              </p>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="guardian-name"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Guardian Name <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="mt-2">
                    <Input
                      id="guardian-name"
                      name="guardian-name"
                      type="text"
                      required
                      validationRegex={/^[A-Za-z]*$/} // Only allow letters
                      requiredMessage="Please enter the Name."
                      validationMessage="Only letters are allowed in the Name."
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="guardian-preferred-name"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Guardian Preferred Name{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="mt-2">
                    <Input
                      id="guardian-preferred-name"
                      name="guardian-preferred-name"
                      type="text"
                      required
                      validationRegex={/^[A-Za-z]*$/} // Only allow letters
                      requiredMessage="Please enter the Preferred Name."
                      validationMessage="Only letters are allowed in the Preferred Name."
                    />
                  </div>
                </div>

                <div className="sm:col-span-1"></div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="guardian-nric"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Guardian NRIC <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="mt-2">
                    <Input
                      id="guardian-nric"
                      name="guardian-nric"
                      type="text"
                      required
                      validationRegex={/^[STFG]\d{7}[A-Z]$/i} // NRIC Regex
                      requiredMessage="Please enter the NRIC."
                      validationMessage="Please enter a valid NRIC."
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <DatePickerField
                    label="Date of Birth"
                    required={true}
                    errorMessage="Please select a valid Date of Birth."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="guardian-gender"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Guardian Gender <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex space-x-4 mt-2">
                    <div className="flex items-center border border-gray-200 rounded dark:border-gray-700 px-4 py-2">
                      <input
                        id="guardian-gender-male"
                        type="radio"
                        value="guardian-gender-male"
                        name="guardian-gender-male"
                        checked={
                          selectedGuardianGender === "guardian-gender-male"
                        }
                        onChange={handleGuardianGenderChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="guardian-gender-male"
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Male
                      </label>
                    </div>

                    <div className="flex items-center border border-gray-200 rounded dark:border-gray-700 px-4 py-2">
                      <input
                        id="guardian-gender-female"
                        type="radio"
                        value="guardian-gender-female"
                        name="guardian-gender-female"
                        checked={
                          selectedGuardianGender === "guardian-gender-female"
                        }
                        onChange={handleGuardianGenderChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="guardian-gender-female"
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Female
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="guardian-address"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Address <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="mt-2">
                    <Input
                      id="guardian-address"
                      name="guardian-address"
                      type="text"
                      required
                      requiredMessage="Please enter an Address."
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="guardian-temporary-address"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Temporary Address
                  </label>
                  <div className="mt-2">
                    <Input
                      id="guardian-temporary-address"
                      name="guardian-temporary-address"
                      type="text"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="relation-with-patient"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Relationship With Patient{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="mt-2">
                    <select
                      id="relation-with-patient"
                      name="relation-with-patient"
                      value={guardianRelationship}
                      onChange={handleGuardianRelationship}
                      className={`block w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:max-w-xs sm:text-sm sm:leading-6 ${
                        error
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-indigo-600"
                      }`}
                      required
                    >
                      <option value="">Please select a relationship</option>
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
                    {error && (
                      <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="guardian-contact"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Guardian Contact{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="mt-2">
                    <Input
                      id="guardian-contact"
                      name="guardian-contact"
                      type="text"
                      validationRegex={/^[89]\d{7}$/} // Allow home number to start with 6 followed by 7 more digits
                      validationMessage="Mobile number must be 8 digits and start with 8 or 9."
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="guardian-email"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Guardian Email
                  </label>
                  <div className="mt-2">
                    <Input
                      id="guardian-email"
                      name="guardian-email"
                      type="text"
                      validationRegex={/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/} // Email Address Regex
                      validationMessage="Please enter a valid email address."
                    />
                  </div>
                </div>
              </div>

              {/* Button to Add Secondary Guardian */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleToggleSecondaryGuardian}
                  className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ${
                    showSecondaryGuardian
                      ? "bg-red-600 hover:bg-red-500"
                      : "bg-indigo-600 hover:bg-indigo-500"
                  }`}
                >
                  {showSecondaryGuardian
                    ? "Remove Secondary Guardian"
                    : "Add Secondary Guardian"}
                </button>
              </div>

              {/* Secondary Guardian Information */}
              {showSecondaryGuardian && (
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <h2 className="text-base font-semibold leading-7 text-gray-900 sm:col-span-6 text-primary">
                    Secondary Guardian Information
                  </h2>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="secondary-guardian-name"
                      className="block text-sm font-medium leading-6 text-primary"
                    >
                      Secondary Guardian name{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="mt-2">
                      <Input
                        id="secondary-guardian-name"
                        name="secondary-guardian-name"
                        type="text"
                        required
                        validationRegex={/^[A-Za-z]*$/} // Only allow letters
                        requiredMessage="Please enter the Name."
                        validationMessage="Only letters are allowed in the Name."
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="secondary-guardian-preferred-name"
                      className="block text-sm font-medium leading-6 text-primary"
                    >
                      Secondary Guardian Preferred Name{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="mt-2">
                      <Input
                        id="secondary-guardian-preferred-name"
                        name="secondary-guardian-preferred-name"
                        type="text"
                        required
                        validationRegex={/^[A-Za-z]*$/} // Only allow letters
                        requiredMessage="Please enter the Preferred Name."
                        validationMessage="Only letters are allowed in the Preferred Name."
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-1"></div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="secondary-guardian-nric"
                      className="block text-sm font-medium leading-6 text-primary"
                    >
                      Secondary Guardian NRIC{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="mt-2">
                      <Input
                        id="secondary-uardian-nric"
                        name="secondary-guardian-nric"
                        type="text"
                        required
                        validationRegex={/^[STFG]\d{7}[A-Z]$/i} // NRIC Regex
                        requiredMessage="Please enter the NRIC."
                        validationMessage="Please enter a valid NRIC."
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <DatePickerField
                      label="Date of Birth"
                      required={true}
                      errorMessage="Please select a valid Date of Birth."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="secondary-guardian-gender"
                      className="block text-sm font-medium leading-6 text-primary"
                    >
                      Secondary Guardian Gender{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex space-x-4 mt-2">
                      <div className="flex items-center border border-gray-200 rounded dark:border-gray-700 px-4 py-2">
                        <input
                          id="secondary-guardian-gender-male"
                          type="radio"
                          value="secondary-guardian-gender-male"
                          name="secondary-guardian-gender-male"
                          checked={
                            selectedSecondaryGuardianGender ===
                            "secondary-guardian-gender-male"
                          }
                          onChange={handleSecondaryGuardianGenderChange}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor="secondary-guardian-gender-male"
                          className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                          Male
                        </label>
                      </div>

                      <div className="flex items-center border border-gray-200 rounded dark:border-gray-700 px-4 py-2">
                        <input
                          id="secondary-guardian-gender-female"
                          type="radio"
                          value="secondary-guardian-gender-female"
                          name="secondary-guardian-gender-female"
                          checked={
                            selectedSecondaryGuardianGender ===
                            "secondary-guardian-gender-female"
                          }
                          onChange={handleSecondaryGuardianGenderChange}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor="secondary-guardian-gender-female"
                          className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                          Female
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label
                      htmlFor="secondary-guardian-address"
                      className="block text-sm font-medium leading-6 text-primary"
                    >
                      Address <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="mt-2">
                      <Input
                        id="secondary-guardian-address"
                        name="secondary-guardian-address"
                        type="text"
                        required
                        requiredMessage="Please enter an Address."
                      />
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label
                      htmlFor="secondary-guardian-temporary-address"
                      className="block text-sm font-medium leading-6 text-primary"
                    >
                      Temporary Address
                    </label>
                    <div className="mt-2">
                      <Input
                        id="secondary-guardian-temporary-address"
                        name="secondary-guardian-temporary-address"
                        type="text"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="secondary-relation-with-patient"
                      className="block text-sm font-medium leading-6 text-primary"
                    >
                      Relationship With Patient{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="mt-2">
                      <select
                        id="secondary-relation-with-patient"
                        name="secondary-relation-with-patient"
                        value={secondaryGuardianRelationship}
                        onChange={handleSecondaryGuardianRelationship}
                        className={`block w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:max-w-xs sm:text-sm sm:leading-6 ${
                          error
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-indigo-600"
                        }`}
                        required
                      >
                        <option value="">Please select a relationship</option>
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
                      {error && (
                        <p className="text-red-500 text-sm mt-1">{error}</p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="secondary-guardian-contact"
                      className="block text-sm font-medium leading-6 text-primary"
                    >
                      Secondary Guardian Contact{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="mt-2">
                      <Input
                        id="secondary-guardian-contact"
                        name="secondary-guardian-contact"
                        type="text"
                        validationRegex={/^[89]\d{7}$/} // Allow home number to start with 6 followed by 7 more digits
                        validationMessage="Mobile number must be 8 digits and start with 8 or 9."
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="secondary-guardian-email"
                      className="block text-sm font-medium leading-6 text-primary"
                    >
                      Secondary Guardian Email
                    </label>
                    <div className="mt-2">
                      <Input
                        id="secondary-guardian-email"
                        name="secondary-guardian-email"
                        type="text"
                        validationRegex={/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/} // Email Address Regex
                        validationMessage="Please enter a valid email address."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatient;
