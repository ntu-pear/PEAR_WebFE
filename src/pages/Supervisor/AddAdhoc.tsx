import { DatePicker, Form, message } from "antd";
import { RuleObject } from "antd/es/form";
import dayjs, { type Dayjs } from "dayjs";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllPatientTD } from "@/api/patients/patients";
import { createAdhocActivity } from "@/api/activities/adhoc";
import { listCentreActivities, CentreActivity, getActivities } from "@/api/activities/centreActivities";
import { getCentreActivityPreferences } from "@/api/activity/activityPreference";
import { getCentreActivityRecommendations } from "@/api/activity/activityRecommendation";
import { getSchedule, parseScheduleString } from "@/api/scheduler/scheduler";
import { getEndOfCurrentWeekSG } from "@/utils/formatDate";

type AdhocMode = "patient" | "activity-wide";

const AddAdhoc: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<CentreActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  const [patients, setPatients] = useState<{ id: number; name: string }[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const [activityMap, setActivityMap] = useState<Record<number, string>>({});

  const [mode, setMode] = useState<AdhocMode>("patient");

  const [form] = Form.useForm();
  const oldActivityId = Form.useWatch("old_centre_activity_id", form);
  const newActivityId = Form.useWatch("new_centre_activity_id", form);
  const watchedStartDate = Form.useWatch("start_date", form);
  const watchedEndDate = Form.useWatch("end_date", form);
  const watchedPatientId = Form.useWatch("patient_id", form);

  const [unscheduleableActivityIds, setUnscheduleableActivityIds] = useState<Set<number>>(new Set());
  const [loadingPatientActivityRules, setLoadingPatientActivityRules] = useState(false);

  const [scheduledActivityTitles, setScheduledActivityTitles] = useState<Set<string> | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const handleStartDateChange = (date: Dayjs | null) => {
    form.setFieldsValue({
      start_date: date ?? undefined,
      end_date: date ? date.add(1, "day") : undefined,
    });
  };

  const handleEndDateChange = (date: Dayjs | null) => {
    form.setFieldsValue({ end_date: date ?? undefined });
  };

  const onFinish = async (values: any) => {
    const startISO = dayjs
      .tz(`${(values.start_date as Dayjs).format("YYYY-MM-DD")}T00:00:00`, "Asia/Singapore")
      .format();
    const endISO = dayjs
      .tz(`${(values.end_date as Dayjs).format("YYYY-MM-DD")}T00:00:00`, "Asia/Singapore")
      .format();

    if (mode === "activity-wide") {
      message.info("Activity-wide adhoc isn't available yet");
      return;
    }

    try {
      // call the service instead of using fetch
      await createAdhocActivity({
        patientId: Number(values.patient_id),
        oldActivityId: Number(values.old_centre_activity_id),
        newActivityId: Number(values.new_centre_activity_id),
        startDate: startISO,
        endDate: endISO,
      });

      message.success("Adhoc activity added successfully!");
      form.resetFields();
      navigate("/supervisor/manage-adhoc");
    } catch (error) {
      console.error("Failed to add adhoc:", error);
      message.error("Failed to add adhoc activity");
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    
    console.log("Failed:", errorInfo);
    message.error("Please fill out all required fields correctly.");
  };

  const validateDifferentActivity = (_: RuleObject, value: number) => {
    const oldActivity = form.getFieldValue("old_centre_activity_id");

    if (!value || !oldActivity) {
      return Promise.resolve();
    }

    if (Number(value) === Number(oldActivity)) {
      return Promise.reject(
        new Error("Adhoc activity must be different from old activity")
      );
    }

    return Promise.resolve();
  };

  const validateEndDate = (
    _: RuleObject,
    value: Dayjs | undefined
  ): Promise<void> => {
    const startDate: Dayjs | undefined = form.getFieldValue("start_date");
    if (!value || !startDate) {
      return Promise.resolve(); // Don't validate if no value
    }
    if (!value.isAfter(startDate, "day")) {
      return Promise.reject(
        new Error("End date must be after start date!")
      );
    }
    return Promise.resolve();
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetchAllPatientTD(
          "",        // name
          null,      // isActive
          0,         // pageNo
          100        // pageSize
        );

        // res.patients is already transformed table data
        const mappedPatients = res.patients.map((p) => ({
          id: Number(p.id), // ✅ force number
          name: p.name,
        }));


        setPatients(mappedPatients);

        // set default patient in the form
        if (mappedPatients.length > 0) {
          form.setFieldsValue({
            patient_id: mappedPatients[0].id,
          });
        }
      } catch (error) {
        console.error("Failed to fetch patients", error);
        message.error("Failed to load patients");
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        //Get centre activities
        const centreRes = await listCentreActivities({
          include_deleted: false,
          limit: 1000,
        });

        setActivities(centreRes);

        //Get base activities (titles)
        const activityRes = await getActivities();

        const map: Record<number, string> = {};

        activityRes.forEach(a => {
          map[a.id] = a.title;
        });

        setActivityMap(map);

      } catch (error) {
        console.error("Failed to fetch activities", error);
        message.error("Failed to load activities");
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, []);

  useEffect(() => {
    if (mode !== "patient" || !watchedPatientId) {
      setUnscheduleableActivityIds(new Set());
      return;
    }

    const fetchPatientActivityRules = async () => {
      setLoadingPatientActivityRules(true);
      try {
        const patientIdStr = String(watchedPatientId);
        const [preferences, recommendations] = await Promise.all([
          getCentreActivityPreferences(patientIdStr),
          getCentreActivityRecommendations(patientIdStr),
        ]);

        const unscheduleable = new Set<number>();
        preferences
          .filter((p) => !p.is_deleted && p.is_like === -1)
          .forEach((p) => unscheduleable.add(p.centre_activity_id));
        recommendations
          .filter((r) => !r.is_deleted && r.doctor_recommendation === -1)
          .forEach((r) => unscheduleable.add(r.centre_activity_id));

        setUnscheduleableActivityIds(unscheduleable);
      } catch (error) {
        console.error("Failed to load patient activity preferences/recommendations", error);
        setUnscheduleableActivityIds(new Set());
      } finally {
        setLoadingPatientActivityRules(false);
      }
    };

    fetchPatientActivityRules();
  }, [mode, watchedPatientId]);

  useEffect(() => {
    if (mode !== "patient" || !watchedPatientId) {
      setScheduledActivityTitles(null);
      return;
    }

    const fetchPatientSchedule = async () => {
      setLoadingSchedule(true);
      try {
        const res = await getSchedule();
        const patientSchedule = res.Data?.find((s) => s.PatientID === watchedPatientId);

        const titles = new Set<string>();
        if (patientSchedule) {
          (["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const).forEach((day) => {
            parseScheduleString(patientSchedule[day]).forEach((title) => titles.add(title.toUpperCase()));
          });
        }
        setScheduledActivityTitles(titles);
      } catch (error) {
        console.error("Failed to load patient schedule", error);
        setScheduledActivityTitles(new Set());
      } finally {
        setLoadingSchedule(false);
      }
    };

    fetchPatientSchedule();
  }, [mode, watchedPatientId]);

  const getOldActivityOptions = () => {
    const sorted = [...activities].sort((a, b) => {
      const titleA = (activityMap[a.activity_id] || "ZZZZ_UNKNOWN").toUpperCase();
      const titleB = (activityMap[b.activity_id] || "ZZZZ_UNKNOWN").toUpperCase();
      return titleA.localeCompare(titleB);
    });

    if (mode !== "patient" || !scheduledActivityTitles) return sorted;

    return sorted.filter((activity) =>
      scheduledActivityTitles.has((activityMap[activity.activity_id] ?? "").toUpperCase())
    );
  };

  const getNewActivityOptions = () => {
    const sorted = [...activities].sort((a, b) => {
      const titleA = (activityMap[a.activity_id] || "ZZZZ_UNKNOWN").toUpperCase();
      const titleB = (activityMap[b.activity_id] || "ZZZZ_UNKNOWN").toUpperCase();
      return titleA.localeCompare(titleB);
    });

    if (mode !== "patient") return sorted;

    return sorted.filter((activity) => !unscheduleableActivityIds.has(activity.id));
  };
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row container mx-auto px-4">
      {/* Left Sidebar Navigation */}
      <nav className="w-full lg:w-1/4 px-6 text-xl text-gray-800 leading-normal">
        <p className="text-2xl font-bold py-4 text-primary">Add Adhoc</p>
        <ul className="list-reset py-2 md:py-0 lg:sticky lg:top-16">
          <li
            className={`py-1 md:my-2 hover:bg-yellow-100 lg:hover:bg-transparent border-l-4 
            border-lime-500 font-bold`}
          >
            <a
              href="#adhoc-info"
              className="block pl-4 align-middle no-underline hover:text-yellow-600 text-primary"
            >
              <span className="pb-1 md:pb-0 text-sm">Adhoc Information</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* Right Form Content */}
      <div className="w-full lg:w-3/4 p-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <div className="space-y-12">
            <div id="adhoc-info" className="border-b-2 border-border pb-12">
              <h2 className="text-base font-semibold leading-7 text-primary">
                Adhoc Information
              </h2>
              <p className="mt-1 text-sm leading-6 text-primary">
                Add an adhoc activity to temporarily replace an activity for a specific patient, or for everyone currently scheduled for it
              </p>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-8">
                <div className="sm:col-span-8">
                  <label className="block text-sm font-medium leading-6 text-primary">
                    Apply To
                  </label>
                  <div className="mt-2 flex gap-6">
                    <label className="flex items-center gap-2 text-sm text-gray-900">
                      <input
                        type="radio"
                        name="adhoc_mode"
                        checked={mode === "patient"}
                        onChange={() => setMode("patient")}
                      />
                      Specific Patient
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-900">
                      <input
                        type="radio"
                        name="adhoc_mode"
                        checked={mode === "activity-wide"}
                        onChange={() => setMode("activity-wide")}
                      />
                      All Patients on this Activity
                    </label>
                  </div>
                </div>

                {mode === "patient" ? (
                  <Form.Item
                    label={
                      <label className="block text-sm font-medium leading-6 text-primary">
                        Patient Name
                      </label>
                    }
                    //name="patient_name"
                    name="patient_id"
                    initialValue={patients[0]?.id}
                    rules={[
                      { required: true, message: "Please select a patient!" },
                    ]}
                    className="sm:col-span-8"
                  >
                    <select
                      className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                      disabled={loadingPatients}
                    >
                      <option value="" disabled>
                        Select Patient
                      </option>

                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name}
                        </option>
                      ))}
                    </select>

                  </Form.Item>
                ) : (
                  <div className="sm:col-span-8 rounded-md border border-gray-200 bg-gray-50 p-4">
                    {!oldActivityId || !watchedStartDate || !watchedEndDate ? (
                      <p className="text-sm text-gray-600">
                        Select an Activity to be replaced and date range below to see affected patients.
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Patients currently scheduled for this activity in the selected range will be listed here.
                      </p>
                    )}
                  </div>
                )}

                <Form.Item
                  label={
                    <label className="block text-sm font-medium leading-6 text-primary">
                      Activity to be replaced
                    </label>
                  }
                  name="old_centre_activity_id"
                  rules={[
                    {
                      required: true,
                      message: "Please select an old activity!",
                    },
                  ]}
                  className="sm:col-span-3"
                >
                  <select
                    className="
                      block w-full rounded-md border-0 py-2 px-3
                      text-gray-900 shadow-sm
                      ring-1 ring-inset ring-gray-300
                      focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600
                    "
                    disabled={loadingActivities || loadingSchedule}
                    onChange={(e) => {
                    const selectedOld = Number(e.target.value);
                    const currentNew = form.getFieldValue("new_centre_activity_id");

                    // If conflict detected
                    if (selectedOld === currentNew) {
                      const alternative = activities.find(a => a.id !== selectedOld);

                      if (alternative) {
                        form.setFieldsValue({
                          old_centre_activity_id: alternative.id,
                        });

                        //User-facing explanation
                        message.error(
                          "Original and Adhoc activities must be different. " +
                          "The original activity was automatically adjusted to avoid a conflict."
                        );

                        //clear stale Adhoc validation error
                        form.validateFields(["new_centre_activity_id"])

                        return;
                      }
                    }

                    // Normal case
                    form.setFieldsValue({
                      old_centre_activity_id: selectedOld,
                    });
                  }}
                    value={oldActivityId ?? ""}
                  >
                    <option value="">
                      {loadingSchedule
                        ? "Loading patient's schedule..."
                        : mode === "patient" && getOldActivityOptions().length === 0
                        ? "No activities currently scheduled for this patient"
                        : "Select Activity"}
                    </option>

                    {getOldActivityOptions().map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        {(activityMap[activity.activity_id] ?? "Unknown Activity").toUpperCase()}
                      </option>
                    ))}

                  </select>

                </Form.Item>

                <Form.Item
                  label={
                    <label className="block text-sm font-medium leading-6 text-primary">
                      Ad hoc activity
                    </label>
                  }
                  name="new_centre_activity_id"
                  rules={[
                    {
                      required: true,
                      message: "Please select a adhoc!",
                    },
                    { validator: validateDifferentActivity },
                  ]}
                  className="sm:col-span-4"
                >
                  <select
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                    value={newActivityId ?? ""}
                    disabled={loadingActivities || loadingPatientActivityRules}

                    onChange={(e) => {
                    const selectedNew = Number(e.target.value);
                    const oldActivity = form.getFieldValue("old_centre_activity_id");

                    if (selectedNew === oldActivity) {
                      message.error(
                        "Adhoc activity must be different from the original activity. " +
                        "Please select a different adhoc activity."
                      );
                      return;
                    }

                    form.setFieldsValue({
                      new_centre_activity_id: selectedNew,
                    });
                  }}


                  >
                    <option value="">
                      {loadingPatientActivityRules
                        ? "Loading activities available to this patient..."
                        : "Select New Activity to be Ad hoc"}
                    </option>


                    {getNewActivityOptions().map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        {(activityMap[activity.activity_id] ?? "Unknown Activity").toUpperCase()}
                      </option>
                    ))}


                  </select>

                </Form.Item>

                <Form.Item
                  label={
                    <label className="block text-sm font-medium leading-6 text-primary">
                      Start Date
                    </label>
                  }
                  name="start_date"
                  rules={[{ required: true, message: "Please select a start date!" }]}
                  className="sm:col-span-3"
                >
                  <DatePicker
                    format="DD-MMM-YYYY"
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    onChange={handleStartDateChange}
                    disabledDate={(current) =>
                      !!current &&
                      (current.isBefore(dayjs().tz("Asia/Singapore"), "day") ||
                        current.isAfter(getEndOfCurrentWeekSG(), "day"))
                    }
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <label className="block text-sm font-medium leading-6 text-primary">
                      End Date
                    </label>
                  }
                  name="end_date"
                  rules={[
                    { required: true, message: "Please select an end date!" },
                    { validator: validateEndDate },
                  ]}
                  className="sm:col-span-3"
                >
                  <DatePicker
                    format="DD-MMM-YYYY"
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    onChange={handleEndDateChange}
                    disabledDate={(current) => {
                      if (!current) return false;
                      if (current.isBefore(dayjs().tz("Asia/Singapore"), "day")) return true;
                      if (current.isAfter(getEndOfCurrentWeekSG(), "day")) return true;
                      const startDate: Dayjs | undefined = form.getFieldValue("start_date");
                      return !!startDate && !current.isAfter(startDate, "day");
                    }}
                  />
                </Form.Item>

              </div>
            </div>
          </div>

          <Form.Item>
            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="button"
                className="text-sm font-semibold leading-6 text-primary"
                onClick={() => navigate("/supervisor/manage-adhoc")}
              >
                Cancel
              </button>
              <button
                type="submit"
                
                className="
                    rounded-md bg-black px-3 py-2
                    text-sm font-semibold text-white
                    shadow-sm
                    hover:bg-gray-800
                    focus-visible:outline focus-visible:outline-2
                    focus-visible:outline-offset-2 focus-visible:outline-black
                  "

              >
                Add Adhoc
              </button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddAdhoc;
