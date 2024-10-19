import { Form, DatePicker, message } from "antd";
import { mockPatientNameList } from "@/mocks/mockPatientTableData";
import { Dayjs } from "dayjs";
import { RuleObject } from "antd/es/form";

const AddAdhoc: React.FC = () => {
  const activities: string[] = [
    "Lunch",
    "Breathing + Vital Check",
    "Board Games",
    "Movie Screening",
    "Brisk Walking",
    "Mahjong",
    "Musical Instrument Lesson",
    "Story Time",
    "Physiotherapy",
    "String Beads",
    "Sewing",
    "Cup Stacking Game",
    "Sort Poker Chips",
    "Origami",
    "Picture Coloring",
    "Clip Coupons",
    "Cutting Pictures",
    "Watch Television",
    "Act 1",
    "Leslie History Routine",
    "Leslie Geography Routine",
  ];

  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Success:", values);
    message.success("Adhoc activity added successfully!");
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
    message.error("Please fill out all required fields correctly.");
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
                Add in adhoc activity information for a particular patient
              </p>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-8">
                <Form.Item
                  label={
                    <label className="block text-sm font-medium leading-6 text-primary">
                      Patient Name
                    </label>
                  }
                  name="patient_name"
                  rules={[
                    { required: true, message: "Please select a patient!" },
                  ]}
                  className="sm:col-span-8"
                >
                  <select className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6">
                    <option value="" disabled selected>
                      Select Patient
                    </option>
                    {mockPatientNameList.map((patient, index) => (
                      <option key={index}>{patient}</option>
                    ))}
                  </select>
                </Form.Item>

                <Form.Item
                  label={
                    <label className="block text-sm font-medium leading-6 text-primary">
                      Old Activity
                    </label>
                  }
                  name="old_activity"
                  rules={[
                    {
                      required: true,
                      message: "Please select an old activity!",
                    },
                  ]}
                  className="sm:col-span-3"
                >
                  <select className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6">
                    <option value="" disabled selected>
                      Select Old Activity
                    </option>
                    {activities.map((activity, index) => (
                      <option key={index}>{activity}</option>
                    ))}
                  </select>
                </Form.Item>

                <Form.Item
                  label={
                    <label className="block text-sm font-medium leading-6 text-primary">
                      New Activity
                    </label>
                  }
                  name="new_activity"
                  rules={[
                    {
                      required: true,
                      message: "Please select a new activity!",
                    },
                  ]}
                  className="sm:col-span-4"
                >
                  <select className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6">
                    <option value="" disabled selected>
                      Select New Activity
                    </option>
                    {activities.map((activity, index) => (
                      <option key={index}>{activity}</option>
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
                  rules={[
                    { required: true, message: "Please select a start date!" },
                  ]}
                  className="sm:col-span-3"
                >
                  <DatePicker className="col-span-" />
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
                  <DatePicker className="col-span-3" />
                </Form.Item>
              </div>
            </div>
          </div>

          <Form.Item>
            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="button"
                className="text-sm font-semibold leading-6 text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Add Patient
              </button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddAdhoc;
