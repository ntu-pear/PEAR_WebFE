import { Form, DatePicker, message } from "antd";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { RuleObject } from "antd/es/form";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllPatientTD } from "@/api/patients/patients";
import { createAdhocActivity } from "@/api/activities/adhoc";
import { listCentreActivities, CentreActivity, getActivities } from "@/api/activities/centreActivities";
import {
  listCentreActivityAvailabilities,
  availabilityCoversTime,
  CentreActivityAvailability,
} from "@/api/activities/centreActivityAvailabilities";
import { userPrefersHour12 } from "@/utils/formatDate";

const AddAdhoc: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<CentreActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  const [patients, setPatients] = useState<{ id: number; name: string }[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const [activityMap, setActivityMap] = useState<Record<number, string>>({});
  const [availabilities, setAvailabilities] = useState<CentreActivityAvailability[]>([]);

  const [form] = Form.useForm();
  const startDate: Dayjs | null = Form.useWatch("start_date", form);
  const endDate: Dayjs | null = Form.useWatch("end_date", form);
  const hour12 = userPrefersHour12();
  const dateTimeFormat = hour12 ? "DD-MMM-YYYY hh:mm A" : "DD-MMM-YYYY HH:mm";
  const [durationMinutes, setDurationMinutes] = useState(30);
  const pickerPopupClassName = "adhoc-datetime-picker-popup";
  const timePickerProps = {
    format: hour12 ? "hh:mm A" : "HH:mm",
    use12Hours: hour12,
    showSecond: false,
  };

  const handleStartDateChange = (value: Dayjs | null) => {
    if (!value) {
      form.setFieldsValue({ start_date: null, end_date: null });
      return;
    }

    form.setFieldsValue({
      start_date: value,
      end_date: value.add(durationMinutes, "minute"),
    });
  };

  const handleEndDateChange = (value: Dayjs | null) => {
    form.setFieldsValue({ end_date: value });

    if (value && startDate && value.isAfter(startDate)) {
      setDurationMinutes(value.diff(startDate, "minute"));
    }
  };

  const onFinish = async (values: any) => {
    const startISO = values.start_date
      .second(0)
      .format("YYYY-MM-DDTHH:mm:ss");

    const endISO = values.end_date
      .second(0)
      .format("YYYY-MM-DDTHH:mm:ss");
    
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

  const validReplacementActivityIds = React.useMemo(() => {
    if (!startDate || !endDate) return [];

        
    if (!startDate.isBefore(endDate)) {
        return [];
      }

    const selectedDate = startDate.format("YYYY-MM-DD");

    return availabilities
      .filter((a) => {
        // Date range check (inclusive)
        if (selectedDate < a.start_date || selectedDate > a.end_date) {
          return false;
        }

        // Time window check
        return availabilityCoversTime(a, startDate, endDate);
      })
      .map((a) => a.centre_activity_id);
  }, [availabilities, startDate, endDate]);

  const validateAvailabilityMatch: RuleObject["validator"] = async () => {
    const newId = form.getFieldValue("new_centre_activity_id");
    if (!newId) return Promise.resolve();

    if (!getValidReplacementActivityIds().includes(newId)) {
      return Promise.reject(
        new Error("Selected activity does not match the chosen date and time window.")
      );
    }

    return Promise.resolve();
  };

  const validateEndDate = (
    _: RuleObject,
    value: Dayjs | null
  ): Promise<void> => {
    const startDate = form.getFieldValue("start_date");
    if (!value || !startDate) {
      return Promise.resolve(); // Don't validate if no value
    }
    if (value.isBefore(startDate)) {
      return Promise.reject(
        new Error("End date must be after or equal to start date!")
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
    listCentreActivityAvailabilities({ include_deleted: false, limit: 1000 })
      .then(setAvailabilities)
      .catch(err => console.error("Failed to load availabilities", err));
  }, []);

  const getValidReplacementActivityIds = () => {
    const start: Dayjs | null = form.getFieldValue("start_date");
    const end: Dayjs | null = form.getFieldValue("end_date");

    if (!start || !end) return [];

    const selectedDate = start.startOf("day");

    console.log("Adhoc start:", start.format());
    console.log("Adhoc end:", end.format());

    availabilities.forEach(a => {
      console.log(
        "Checking availability",
        a.centre_activity_id,
        a.start_date,
        a.end_date,
        a.start_time,
        a.end_time,
        availabilityCoversTime(a, start, end)
      );
    });


    return availabilities
      .filter((a) => {
        // Date range must cover selected date
        const dateMatches =
          selectedDate.isSameOrAfter(dayjs(a.start_date)) &&
          selectedDate.isSameOrBefore(dayjs(a.end_date));

        if (!dateMatches) return false;

        // Time window must fully cover adhoc interval
        return availabilityCoversTime(a, start, end);
      })
      .map((a) => a.centre_activity_id);
  };


  const getSortedActivities = () => {
    return [...activities].sort((a, b) => {
      const titleA = (activityMap[a.activity_id] || "ZZZZ_UNKNOWN").toUpperCase();
      const titleB = (activityMap[b.activity_id] || "ZZZZ_UNKNOWN").toUpperCase();
      return titleA.localeCompare(titleB);
    });
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
                Add an adhoc activity to replace an original activity for a particular patient
              </p>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-8">
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

                <Form.Item
                  label={
                    <label className="block text-sm font-medium leading-6 text-primary">
                      Old Activity
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
                    disabled={loadingActivities}
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
                  >
                    <option value="" disabled>
                      Select Old Activity
                    </option>
                    

                    {getSortedActivities().map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        {(activityMap[activity.activity_id] ?? "Unknown Activity").toUpperCase()}
                      </option>
                    ))}

                  </select>

                </Form.Item>

                <Form.Item
                  label={
                    <label className="block text-sm font-medium leading-6 text-primary">
                      Ad hoc
                    </label>
                  }
                  name="new_centre_activity_id"
                  rules={[
                    {
                      required: true,
                      message: "Please select a adhoc!",
                    },
                    { validator: validateDifferentActivity },
                    { validator: validateAvailabilityMatch },
                  ]}
                  className="sm:col-span-4"
                >
                  <select
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                    disabled={loadingActivities}
                    
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
                      Select New Activity to be Ad hoc
                    </option>

                    
                    {getSortedActivities()
                      .filter((activity) =>
                        validReplacementActivityIds.includes(activity.id)
                      )
                      .map((activity) => (
                        <option key={activity.id} value={activity.id}>
                          {(activityMap[activity.activity_id] ?? "Unknown Activity").toUpperCase()}
                        </option>
                    ))}


                  </select>

                </Form.Item>

                <Form.Item
                  label={
                    <label className="block text-sm font-medium leading-6 text-primary">
                      Start Date & Time
                    </label>
                  }
                  name="start_date"
                  rules={[{ required: true, message: "Please select a start date & time!" }]}
                  className="sm:col-span-3"
                >
                  <DatePicker
                    showTime={timePickerProps}
                    format={dateTimeFormat}
                    className="w-full"
                    use12Hours={hour12}
                    onChange={handleStartDateChange}
                    allowClear={false}
                    popupClassName={pickerPopupClassName}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <label className="block text-sm font-medium leading-6 text-primary">
                      End Date & Time
                    </label>
                  }
                  name="end_date"
                  rules={[
                    { required: true, message: "Please select an end date & time!" },
                    { validator: validateEndDate },
                  ]}
                  className="sm:col-span-3"
                >
                  <DatePicker
                    showTime={timePickerProps}
                    format={dateTimeFormat}
                    className="w-full"
                    use12Hours={hour12}
                    onChange={handleEndDateChange}
                    allowClear={false}
                    popupClassName={pickerPopupClassName}
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
