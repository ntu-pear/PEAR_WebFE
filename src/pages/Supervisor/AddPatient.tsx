import React, { useState, useEffect, useRef } from "react";
import { DatePicker } from 'antd';

const AddPatient: React.FC = () => {
    {/* Sidebar Navigation */ }
    const [activeSection, setActiveSection] = useState<string>('personal-info');
    const sections = useRef<{ [key: string]: HTMLElement | null }>({
        'personal-info': null,
        'guardian-info': null,
        'allergies': null,
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
            sectionElement.scrollIntoView({ behavior: 'smooth' });
        }

        setTimeout(() => {
            isClickRef.current = false;
        }, 2000);
    };

    {/* Patient Info Section */ }
    const [selectedPatientGender, setSelectedPatientGender] = useState<string>("patient-gender-male");

    const handleGenderPatientChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedPatientGender(event.target.id);
    };

    const [selectedRespiteCare, setSelectedRespiteCare] = useState<string>("patient-respite-care-yes");

    const handleRespiteCareChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedRespiteCare(event.target.id);
    };

    const [profilePictureFile, setProfilePictureFile] = useState<string | null>(null);
    const [profilePictureError, setProfilePictureError] = useState<string | null>(null);
    const [profilePictureButtonText, setProfilePictureButtonText] = useState<string>("Upload Picture");

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

    {/* Guardian Info Section */ }
    const [selectedGuardianGender, setSelectedGuardiandGender] = useState<string>("guardian-gender-male");

    const handleGuardianGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedGuardiandGender(event.target.id);
    };

    const [selectedSecondaryGuardianGender, setSelectedSecondaryGuardiandGender] = useState<string>("guardian-gender-male");

    const handleSecondaryGuardianGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedSecondaryGuardiandGender(event.target.id);
    };

    const [showSecondaryGuardian, setShowSecondaryGuardian] = useState(false);

    const handleToggleSecondaryGuardian = () => {
        setShowSecondaryGuardian(!showSecondaryGuardian);
    };

    {/* Allergy Section */ }
    const [allergies, setAllergies] = useState<{ name: string, reaction: string, remarks: string }[]>([]);

    const handleAddAllergy = () => {
        if (allergies.length < 5) {
            setAllergies([...allergies, { name: "", reaction: "", remarks: "" }]);
        }
    };

    const handleAllergyChange = (index: number, field: string, value: string) => {
        const updatedAllergies = [...allergies];
        updatedAllergies[index] = { ...updatedAllergies[index], [field]: value };
        setAllergies(updatedAllergies);
    };

    const handleRemoveAllergy = (index: number) => {
        const updatedAllergies = allergies.filter((_, i) => i !== index);
        setAllergies(updatedAllergies);
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
                        className={`py-1 md:my-2 hover:bg-yellow-100 lg:hover:bg-transparent border-l-4 ${activeSection === 'personal-info' ? 'border-lime-500 font-bold' : 'border-transparent'
                            }`}
                    >
                        <a
                            href="#personal-info"
                            onClick={() => handleClick('personal-info')}
                            className="block pl-4 align-middle no-underline hover:text-yellow-600 text-primary"
                        >
                            <span className="pb-1 md:pb-0 text-sm">Patient Information</span>
                        </a>
                    </li>
                    <li
                        className={`py-1 md:my-2 hover:bg-yellow-100 lg:hover:bg-transparent border-l-4 ${activeSection === 'guardian-info' ? 'border-lime-500 font-bold' : 'border-transparent'
                            }`}
                    >
                        <a
                            href="#guardian-info"
                            onClick={() => handleClick('guardian-info')}
                            className="block pl-4 align-middle no-underline hover:text-yellow-600 text-primary"
                        >
                            <span className="pb-1 md:pb-0 text-sm">Guardian Information</span>
                        </a>
                    </li>
                    <li
                        className={`py-1 md:my-2 hover:bg-yellow-100 lg:hover:bg-transparent border-l-4 ${activeSection === 'allergies' ? 'border-lime-500 font-bold' : 'border-transparent'
                            }`}
                    >
                        <a
                            href="#allergies"
                            onClick={() => handleClick('allergies')}
                            className="block pl-4 align-middle no-underline hover:text-yellow-600 text-primary"
                        >
                            <span className="pb-1 md:pb-0 text-sm">Allergies</span>
                        </a>
                    </li>
                </ul>
            </nav>


            {/* Right Form Content */}
            <div className="w-full lg:w-3/4 p-6">
                <form>
                    <div className="space-y-12">
                        {/* Patient Information */}
                        <div id="personal-info" className="border-b-2 border-border pb-12">
                            <h2 className="text-base font-semibold leading-7 text-gray-900 text-primary">Patient Information</h2>
                            <p className="mt-1 text-sm leading-6 text-gray-600 text-primary">Add in patient's personal information</p>

                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium leading-6 text-gray-900 text-primary">
                                        First name <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="patient-first-name"
                                            name="patient-first-name"
                                            type="text"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="patient-last-name" className="block text-sm font-medium leading-6 text-primary">
                                        Last name <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="patient-last-name"
                                            name="patient-last-name"
                                            type="text"
                                            autoComplete="patient-last-name"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="patient-preffered-name" className="block text-sm font-medium leading-6 text-primary">
                                        Preferred Name <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="patient-preffered-name"
                                            name="patient-preffered-name"
                                            type="patient-preffered-name"
                                            autoComplete="patient-preffered-name"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="patient-language" className="block text-sm font-medium leading-6 text-primary">
                                        Preferred Language <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <select
                                            id="patient-language"
                                            name="patient-language"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                        >
                                            <option>Cantonses</option>
                                            <option>English</option>
                                            <option>Hakka</option>
                                            <option>Hindi</option>
                                            <option>Hokkien</option>
                                            <option>Japanese</option>
                                            <option>Korean</option>
                                            <option>Malay</option>
                                            <option>Mandarin</option>
                                            <option>Spanish</option>
                                            <option>Tamil</option>
                                            <option>Teochew</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="patient-gender" className="block text-sm font-medium leading-6 text-primary">
                                        Gender <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="flex space-x-4 mt-2">
                                        <div className="flex items-center border border-gray-200 rounded dark:border-gray-700 px-4 py-2">

                                            <input
                                                id="patient-gender-male"
                                                type="radio"
                                                value="patient-gender-male"
                                                name="patient-gender-male"
                                                checked={selectedPatientGender === "patient-gender-male"}
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
                                                checked={selectedPatientGender === "patient-gender-female"}
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

                                <div className="sm:col-span-3">
                                    <label htmlFor="patient-nric" className="block text-sm font-medium leading-6 text-primary">
                                        NRIC <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="guardipatientan-nric"
                                            name="patient-nric"
                                            type="patient-nric"
                                            autoComplete="guarpatientdian-nric"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="patient-dob" className="block text-sm font-medium leading-6 text-primary">
                                        Date Of Birth <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="flex space-x-4 mt-2">
                                        <DatePicker />
                                    </div>
                                </div>

                                <div className="col-span-full">
                                    <label htmlFor="patient-address" className="block text-sm font-medium leading-6 text-primary">
                                        Address <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="patient-address"
                                            name="patient-address"
                                            type="text"
                                            autoComplete="patient-address"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-full">
                                    <label htmlFor="patient-postal-code" className="block text-sm font-medium leading-6 text-primary">
                                        Postal Code <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="patient-postal-code"
                                            name="patient-postal-code"
                                            type="text"
                                            autoComplete="patient-postal-code"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-full">
                                    <label htmlFor="patient-temporary-address" className="block text-sm font-medium leading-6 text-primary">
                                        Temporary Address
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="patient-temporary-address"
                                            name="patient-temporary-address"
                                            type="text"
                                            autoComplete="patient-temporary-address"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-full">
                                    <label htmlFor="patient-temporary-postal-code" className="block text-sm font-medium leading-6 text-primary">
                                        Temporary Postal Code
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="patient-temporary-postal-code"
                                            name="patient-temporary-postal-code"
                                            type="text"
                                            autoComplete="patient-temporary-postal-code"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="patient-home-number" className="block text-sm font-medium leading-6 text-primary">
                                        Home Number
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="patient-home-number"
                                            name="patient-home-number"
                                            type="text"
                                            autoComplete="patient-home-number"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="patient-mobile-number" className="block text-sm font-medium leading-6 text-primary">
                                        Mobile Number
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="patient-mobile-number"
                                            name="patient-mobile-number"
                                            type="patient-mobile-number"
                                            autoComplete="patient-mobile-number"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-full">
                                    <label htmlFor="patient-profile-picture" className="block text-sm font-medium leading-6 text-primary">
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
                                                className={`cursor-pointer inline-block px-4 py-2 text-sm font-semibold text-white rounded-md hover:bg-indigo-500 ${profilePictureFile ? "bg-indigo-600" : "bg-indigo-600"
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
                                        {profilePictureError && <p className="text-red-500 text-sm mt-2">{profilePictureError}</p>}
                                    </div>
                                </div>

                                <div className="col-span-full">
                                    <label htmlFor="patient-respite-care" className="block text-sm font-medium leading-6 text-primary">
                                        Under Respite Care <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="flex space-x-4 mt-2">
                                        <div className="flex items-center border border-gray-200 rounded dark:border-gray-700 px-4 py-2">
                                            <input
                                                id="patient-respite-care-yes"
                                                type="radio"
                                                value="patient-respite-care-yes"
                                                name="patient-respite-care-yes"
                                                checked={selectedRespiteCare === "patient-respite-care-yes"}
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
                                                checked={selectedRespiteCare === "patient-respite-care-no"}
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
                                    <label htmlFor="patient-join-date" className="block text-sm font-medium leading-6 text-primary">
                                        Joining Date <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="flex space-x-4 mt-2">
                                        <DatePicker />
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="patient-leaving-date" className="block text-sm font-medium leading-6 text-primary">
                                        Leaving Date (if any)
                                    </label>
                                    <DatePicker />
                                </div>
                            </div>
                        </div>


                        {/* Guardian Information */}
                        <div id="guardian-info" className="border-b-2 border-border pb-12">
                            <h2 className="text-base font-semibold leading-7 text-primary">Guardian Information</h2>
                            <p className="mt-1 text-sm leading-6 text-primary">Add in guardian's personal information</p>

                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-2">
                                    <label htmlFor="guardian-first-name" className="block text-sm font-medium leading-6 text-primary">
                                        Guardian First name <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="guardian-first-name"
                                            name="guardian-first-name"
                                            type="text"
                                            autoComplete="guardian-first-name"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="guardian-last-name" className="block text-sm font-medium leading-6 text-primary">
                                        Guardian Last name <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="guardian-last-name"
                                            name="guardian-last-name"
                                            type="text"
                                            autoComplete="guardian-last-name"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="guardian-preffered-name" className="block text-sm font-medium leading-6 text-primary">
                                        Guardian Preferred Name <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="guardian-preffered-name"
                                            name="guardian-preffered-name"
                                            type="guardian-preffered-name"
                                            autoComplete="guardian-preffered-name"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="guardian-nric" className="block text-sm font-medium leading-6 text-primary">
                                        Guardian NRIC <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="guardian-nric"
                                            name="guardian-nric"
                                            type="guardian-nric"
                                            autoComplete="guardian-nric"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="guardian-gender" className="block text-sm font-medium leading-6 text-primary">
                                        Guardian Gender <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="flex space-x-4 mt-2">
                                        <div className="flex items-center border border-gray-200 rounded dark:border-gray-700 px-4 py-2">

                                            <input
                                                id="guardian-gender-male"
                                                type="radio"
                                                value="guardian-gender-male"
                                                name="guardian-gender-male"
                                                checked={selectedGuardianGender === "guardian-gender-male"}
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
                                                checked={selectedGuardianGender === "guardian-gender-female"}
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

                                <div className="sm:col-span-2">
                                    <label htmlFor="guardian-dob" className="block text-sm font-medium leading-6 text-primary">
                                        Date of birth <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="flex space-x-4 mt-2">
                                        <DatePicker />
                                    </div>
                                </div>

                                <div className="col-span-full">
                                    <label htmlFor="guardian-address" className="block text-sm font-medium leading-6 text-primary">
                                        Address <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="guardian-address"
                                            name="guardian-address"
                                            type="text"
                                            autoComplete="guardian-address"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-full">
                                    <label htmlFor="guardian-postal-code" className="block text-sm font-medium leading-6 text-primary">
                                        Postal Code <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="guardian-postal-code"
                                            name="guardian-postal-code"
                                            type="text"
                                            autoComplete="guardian-postal-code"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-full">
                                    <label htmlFor="guardian-temporary-address" className="block text-sm font-medium leading-6 text-primary">
                                        Temporary Address
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="guardian-temporary-address"
                                            name="guardian-temporary-address"
                                            type="text"
                                            autoComplete="guardian-temporary-address"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-full">
                                    <label htmlFor="guardian-temporary-postal-code" className="block text-sm font-medium leading-6 text-primary">
                                        Temporary Postal Code
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="guardian-temporary-postal-code"
                                            name="guardian-temporary-postal-code"
                                            type="text"
                                            autoComplete="guardian-temporary-postal-code"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="relation-with-patient" className="block text-sm font-medium leading-6 text-primary">
                                        Relationship With Patient <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <select
                                            id="relation-with-patient"
                                            name="relation-with-patient"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                        >
                                            <option>Aunt</option>
                                            <option>Child</option>
                                            <option>Friend</option>
                                            <option>Grandchild</option>
                                            <option>Grandparent</option>
                                            <option>Husband</option>
                                            <option>Nephew</option>
                                            <option>Niece</option>
                                            <option>Parent</option>
                                            <option>Sibling</option>
                                            <option>Uncle</option>
                                            <option>Wife</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="guardian-contact" className="block text-sm font-medium leading-6 text-primary">
                                        Guardian Contact <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="guardian-contact"
                                            name="guardian-contact"
                                            type="text"
                                            autoComplete="guardian-contact"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="guardian-email" className="block text-sm font-medium leading-6 text-primary">
                                        Guardian Email
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="guardian-email"
                                            name="guardian-email"
                                            type="guardian-email"
                                            autoComplete="guardian-email"
                                            className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Button to Add Secondary Guardian */}
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={handleToggleSecondaryGuardian}
                                    className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ${showSecondaryGuardian ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'
                                        }`}
                                >
                                    {showSecondaryGuardian ? "Remove Secondary Guardian" : "Add Secondary Guardian"}
                                </button>
                            </div>

                            {/* Secondary Guardian Information */}
                            {showSecondaryGuardian && (
                                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <h2 className="text-base font-semibold leading-7 text-gray-900 sm:col-span-6 text-primary">Secondary Guardian Information</h2>
                                    <div className="sm:col-span-2">
                                        <label htmlFor="secondary-guardian-first-name" className="block text-sm font-medium leading-6 text-primary">
                                            Secondary Guardian First name <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="secondary-guardian-first-name"
                                                name="secondary-guardian-first-name"
                                                type="text"
                                                autoComplete="secondary-guardian-first-name"
                                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="secondary-guardian-last-name" className="block text-sm font-medium leading-6 text-primary">
                                            Secondary Guardian Last name <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="secondary-guardian-last-name"
                                                name="secondary-guardian-last-name"
                                                type="text"
                                                autoComplete="secondary-guardian-last-name"
                                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="secondary-guardian-preffered-name" className="block text-sm font-medium leading-6 text-primary">
                                            Secondary Guardian Preferred Name <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="secondary-guardian-preffered-name"
                                                name="secondary-guardian-preffered-name"
                                                type="secondary-guardian-preffered-name"
                                                autoComplete="secondary-guardian-preffered-name"
                                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="secondary-guardian-nric" className="block text-sm font-medium leading-6 text-primary">
                                            Secondary Guardian NRIC <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="secondary-uardian-nric"
                                                name="secondary-guardian-nric"
                                                type="secondary-guardian-nric"
                                                autoComplete="secondary-guardian-nric"
                                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="secondary-guardian-gender" className="block text-sm font-medium leading-6 text-primary">
                                            Secondary Guardian Gender <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="flex space-x-4 mt-2">
                                            <div className="flex items-center border border-gray-200 rounded dark:border-gray-700 px-4 py-2">

                                                <input
                                                    id="secondary-guardian-gender-male"
                                                    type="radio"
                                                    value="secondary-guardian-gender-male"
                                                    name="secondary-guardian-gender-male"
                                                    checked={selectedSecondaryGuardianGender === "secondary-guardian-gender-male"}
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
                                                    checked={selectedSecondaryGuardianGender === "secondary-guardian-gender-female"}
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

                                    <div className="sm:col-span-2">
                                        <label htmlFor="secondary-guardian-dob" className="block text-sm font-medium leading-6 text-primary">
                                            Date of birth <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="flex space-x-4 mt-2">
                                            <DatePicker />
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="secondary-guardian-address" className="block text-sm font-medium leading-6 text-primary">
                                            Address <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="secondary-guardian-address"
                                                name="secondary-guardian-address"
                                                type="text"
                                                autoComplete="secondary-guardian-address"
                                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="secondary-guardian-postal-code" className="block text-sm font-medium leading-6 text-primary">
                                            Postal Code <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="secondary-guardian-postal-code"
                                                name="secondary-guardian-postal-code"
                                                type="text"
                                                autoComplete="secondary-guardian-postal-code"
                                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="secondary-guardian-temporary-address" className="block text-sm font-medium leading-6 text-primary">
                                            Temporary Address
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="secondary-guardian-temporary-address"
                                                name="secondary-guardian-temporary-address"
                                                type="text"
                                                autoComplete="secondary-guardian-temporary-address"
                                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="secondary-guardian-temporary-postal-code" className="block text-sm font-medium leading-6 text-primary">
                                            Temporary Postal Code
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="secondary-guardian-temporary-postal-code"
                                                name="secondary-guardian-temporary-postal-code"
                                                type="text"
                                                autoComplete="secondary-guardian-temporary-postal-code"
                                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="secondary-relation-with-patient" className="block text-sm font-medium leading-6 text-primary">
                                            Relationship With Patient <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="mt-2">
                                            <select
                                                id="secondary-relation-with-patient"
                                                name="secondary-relation-with-patient"
                                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                            >
                                                <option>Aunt</option>
                                                <option>Child</option>
                                                <option>Friend</option>
                                                <option>Grandchild</option>
                                                <option>Grandparent</option>
                                                <option>Husband</option>
                                                <option>Nephew</option>
                                                <option>Niece</option>
                                                <option>Parent</option>
                                                <option>Sibling</option>
                                                <option>Uncle</option>
                                                <option>Wife</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="secondary-guardian-contact" className="block text-sm font-medium leading-6 text-primary">
                                            Secondary Guardian Contact <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="secondary-guardian-contact"
                                                name="secondary-guardian-contact"
                                                type="text"
                                                autoComplete="secondary-guardian-contact"
                                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="secondary-guardian-email" className="block text-sm font-medium leading-6 text-primary">
                                            Secondary Guardian Email
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="secondary-guardian-email"
                                                name="secondary-guardian-email"
                                                type="secondary-guardian-email"
                                                autoComplete="secondary-guardian-email"
                                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Allergies */}
                        <div id="allergies" className="border-b-2 border-border pb-12">
                            <h2 className="text-base font-semibold leading-7 text-primary">Allergies</h2>
                            <p className="mt-1 text-sm leading-6 text-primary">Add Patient's allergies (if any)</p>

                            <div className="mt-10 space-y-10">
                                {allergies.map((allergy, index) => (
                                    <div key={index} className="mt-2 grid grid-cols-2 gap-4">
                                        <div className="sm:col-span-1">
                                            <label htmlFor={`allergy-${index}`} className="block text-sm font-medium leading-6 text-primary">
                                                Allergy <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="mt-2">
                                                <select
                                                    id={`allergy-${index}`}
                                                    name={`allergy-${index}`}
                                                    value={allergy.name}
                                                    onChange={(e) => handleAllergyChange(index, 'name', e.target.value)}
                                                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                                >
                                                    <option value="">Select an Allergy</option>
                                                    <option value="Corn">Corn</option>
                                                    <option value="Eggs">Eggs</option>
                                                    <option value="Fish">Fish</option>
                                                    <option value="Meat">Meat</option>
                                                    <option value="Milk">Milk</option>
                                                    <option value="Peanuts">Peanuts</option>
                                                    <option value="Seafood">Seafood</option>
                                                    <option value="Shellfish">Shellfish</option>
                                                    <option value="Soy">Soy</option>
                                                    <option value="Tree Nuts">Tree Nuts</option>
                                                    <option value="Others">Others</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <label htmlFor={`allergy-reaction-${index}`} className="block text-sm font-medium leading-6 text-primary">
                                                Allergy Reaction <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="mt-2">
                                                <select
                                                    id={`allergy-reaction-${index}`}
                                                    name={`allergy-reaction-${index}`}
                                                    value={allergy.reaction}
                                                    onChange={(e) => handleAllergyChange(index, 'reaction', e.target.value)}
                                                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                                >
                                                    <option value="">Select a Reaction</option>
                                                    <option value="Abdominal cramp or pain">Abdominal cramp or pain</option>
                                                    <option value="Diarrhea">Diarrhea</option>
                                                    <option value="Difficulty breathing">Difficulty breathing</option>
                                                    <option value="Hives">Hives</option>
                                                    <option value="Itching">Itching</option>
                                                    <option value="Nasal Congestion">Nasal Congestion</option>
                                                    <option value="Nausea">Nausea</option>
                                                    <option value="Rashes">Rashes</option>
                                                    <option value="Sneezing">Sneezing</option>
                                                    <option value="Swelling">Swelling</option>
                                                    <option value="Vomiting">Vomiting</option>
                                                    <option value="Others">Others</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-span-full">
                                            <label htmlFor={`allergy-remarks-${index}`} className="block text-sm font-medium leading-6 text-primary">
                                                Allergy Remarks <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="mt-2">
                                                <textarea
                                                    id={`allergy-remarks-${index}`}
                                                    name={`allergy-remarks-${index}`}
                                                    rows={3}
                                                    value={allergy.remarks}
                                                    onChange={(e) => handleAllergyChange(index, 'remarks', e.target.value)}
                                                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                    placeholder="Give more information about the allergy."
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-full flex justify-between items-center mt-2">
                                            {index === allergies.length - 1 && allergies.length < 5 && (
                                                <button
                                                    type="button"
                                                    onClick={handleAddAllergy}
                                                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                >
                                                    Add Another Allergy
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAllergy(index)}
                                                className="ml-auto rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                                            >
                                                Remove Allergy
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {allergies.length === 0 && (
                                    <div className="col-span-full">
                                        <button
                                            type="button"
                                            onClick={handleAddAllergy}
                                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        >
                                            Add Allergy
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button type="button" className="text-sm font-semibold leading-6 text-primary">
                            Cancel
                        </button>
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
    )
}

export default AddPatient;