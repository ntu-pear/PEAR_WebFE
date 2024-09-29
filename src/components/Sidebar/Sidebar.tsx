import React, { useState, useRef } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Ripple } from "primereact/ripple";
import "primeicons/primeicons.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { Link } from "react-router-dom";

const SidebarMenu: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<{ [key: string]: boolean }>({
    patients: true,
    activities: true,
    attendance: true,
    adhoc: true,
    schedule: true,
    others: true,
  });
  const patientListRef = useRef<HTMLUListElement>(null);
  const activitiesListRef = useRef<HTMLUListElement>(null);
  const attendanceListRef = useRef<HTMLUListElement>(null);
  const adhocListRef = useRef<HTMLUListElement>(null);
  const scheduleListRef = useRef<HTMLUListElement>(null);
  const othersListRef = useRef<HTMLUListElement>(null);

  const toggleList = (key: string, ref: React.RefObject<HTMLUListElement>) => {
    setIsExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    if (ref.current) {
      const maxHeight = ref.current.scrollHeight;
      ref.current.style.maxHeight = !isExpanded[key] ? `${maxHeight}px` : "0";
    }
  };

  return (
    <div className="card flex justify-content-center">
      <Button icon="pi pi-bars" onClick={() => setVisible(true)} />

      <Sidebar
        visible={visible}
        onHide={() => setVisible(false)}
        content={({ hide }) => (
          <div className="flex flex-col lg:flex-row h-screen relative bg-background">
            <div
              id="app-sidebar-2"
              className="surface-section block flex-shrink-0 absolute lg:relative lg:static left-0 top-0 z-1 border-right-1 surface-border select-none transition-all"
              style={{ width: "100%", maxWidth: "280px" }}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center px-4 pt-3 flex-shrink-0 p-3 m-0">
                  <span className="inline-flex items-center gap-2">
                    <img
                      className="h-12 w-24"
                      src="/pear.png"
                      alt="Pear Logo"
                    />
                  </span>
                  <Button
                    type="button"
                    onClick={(e) => hide(e)}
                    icon="pi pi-times"
                    rounded
                    className="p-button-text p-button-sm text-primary mt-4"
                    style={{
                      fontSize: "1.2rem",
                      padding: "4px",
                      marginLeft: "auto",
                    }}
                  />
                </div>
                <div className="overflow-y-auto flex-grow">
                  <ul className="list-none p-3 m-0">
                    <li>
                      <div
                        className="p-ripple p-3 flex items-center justify-between text-600 cursor-pointer"
                        onClick={() => toggleList("patients", patientListRef)}
                      >
                        <span className="font-medium font-bold text-primary">
                          PATIENTS
                        </span>
                        <i
                          className={`pi ${
                            isExpanded["patients"]
                              ? "pi-chevron-up"
                              : "pi-chevron-down"
                          } ml-auto mr-1 text-primary`}
                        ></i>
                        <Ripple />
                      </div>
                      <ul
                        ref={patientListRef}
                        className="list-none p-0 m-0 overflow-hidden transition-all"
                        style={{
                          maxHeight: isExpanded["patients"]
                            ? `${patientListRef.current?.scrollHeight}px`
                            : "0",
                          transition: "max-height 0.3s ease-in-out",
                        }}
                      >
                        <li>
                          <Link
                            to="/ManagePatients"
                            onClick={() => setVisible(false)}
                            className="p-ripple flex items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
                          >
                            <i className="pi pi-user-plus mr-2 text-primary"></i>
                            <span className="font-small text-primary">
                              Manage Patients
                            </span>
                            <Ripple />
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/AddPatients"
                            onClick={() => setVisible(false)}
                            className="p-ripple flex items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
                          >
                            <i className="pi pi-user-plus mr-2 text-primary"></i>
                            <span className="font-small text-primary">
                              Add Patients
                            </span>
                            <Ripple />
                          </Link>
                        </li>
                        <li>
                          <a className="p-ripple flex items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                            <i className="pi pi-calendar mr-2 text-primary"></i>
                            <span className="font-small text-primary">
                              View Medication Schedule
                            </span>
                            <Ripple />
                          </a>
                        </li>
                        <li>
                          <a className="p-ripple flex items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                            <i className="pi pi-calendar-plus mr-2 text-primary"></i>
                            <span className="font-small text-primary">
                              Manage Medication
                            </span>
                            <Ripple />
                          </a>
                        </li>
                      </ul>
                    </li>
                  </ul>

                  <ul className="list-none p-3 m-0">
                    <li>
                      <div
                        className="p-ripple p-3 flex items-center justify-between text-600 cursor-pointer"
                        onClick={() =>
                          toggleList("activities", activitiesListRef)
                        }
                      >
                        <span className="font-medium font-bold text-primary">
                          ACTIVITIES
                        </span>
                        <i
                          className={`pi ${
                            isExpanded["activities"]
                              ? "pi-chevron-up"
                              : "pi-chevron-down"
                          } ml-auto mr-1 text-primary`}
                        ></i>
                        <Ripple />
                      </div>
                      <ul
                        ref={activitiesListRef}
                        className="list-none p-0 m-0 overflow-hidden transition-all"
                        style={{
                          maxHeight: isExpanded["activities"]
                            ? `${activitiesListRef.current?.scrollHeight}px`
                            : "0",
                          transition: "max-height 0.3s ease-in-out",
                        }}
                      >
                        <li>
                          <a className="p-ripple flex items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                            <i className="pi pi-list mr-2 text-primary"></i>
                            <span className="font-small text-primary">
                              Manage Activites
                            </span>
                            <Ripple />
                          </a>
                        </li>
                      </ul>
                    </li>
                  </ul>

                  <ul className="list-none p-3 m-0">
                    <li>
                      <div
                        className="p-ripple p-3 flex items-center justify-between text-600 cursor-pointer"
                        onClick={() =>
                          toggleList("attendance", attendanceListRef)
                        }
                      >
                        <span className="font-medium font-bold text-primary">
                          ATTENDANCE
                        </span>
                        <i
                          className={`pi ${
                            isExpanded["attendance"]
                              ? "pi-chevron-up"
                              : "pi-chevron-down"
                          } ml-auto mr-1 text-primary`}
                        ></i>
                        <Ripple />
                      </div>
                      <ul
                        ref={attendanceListRef}
                        className="list-none p-0 m-0 overflow-hidden transition-all"
                        style={{
                          maxHeight: isExpanded["attendance"]
                            ? `${attendanceListRef.current?.scrollHeight}px`
                            : "0",
                          transition: "max-height 0.3s ease-in-out",
                        }}
                      >
                        <li>
                          <a className="p-ripple flex items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                            <i className="pi pi-check-square mr-2 text-primary"></i>
                            <span className="font-small text-primary">
                              Manage Attendance
                            </span>
                            <Ripple />
                          </a>
                        </li>
                      </ul>
                    </li>
                  </ul>

                  <ul className="list-none p-3 m-0">
                    <li>
                      <div
                        className="p-ripple p-3 flex items-center justify-between text-600 cursor-pointer"
                        onClick={() => toggleList("adhoc", adhocListRef)}
                      >
                        <span className="font-medium font-bold text-primary">
                          ADHOC
                        </span>
                        <i
                          className={`pi ${
                            isExpanded["adhoc"]
                              ? "pi-chevron-up"
                              : "pi-chevron-down"
                          } ml-auto mr-1 text-primary`}
                        ></i>
                        <Ripple />
                      </div>
                      <ul
                        ref={adhocListRef}
                        className="list-none p-0 m-0 overflow-hidden transition-all"
                        style={{
                          maxHeight: isExpanded["adhoc"]
                            ? `${adhocListRef.current?.scrollHeight}px`
                            : "0",
                          transition: "max-height 0.3s ease-in-out",
                        }}
                      >
                        <li>
                          <Link
                            to="/ManageAdhoc"
                            onClick={() => setVisible(false)}
                            className="p-ripple flex items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
                          >
                            <i className="pi pi-user-plus mr-2 text-primary"></i>
                            <span className="font-small text-primary">
                              Manage Adhoc
                            </span>
                            <Ripple />
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/AddAdhoc"
                            onClick={() => setVisible(false)}
                            className="p-ripple flex items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
                          >
                            <i className="pi pi-user-plus mr-2 text-primary"></i>
                            <span className="font-small text-primary">
                              Add Adhoc
                            </span>
                            <Ripple />
                          </Link>
                        </li>
                      </ul>
                    </li>
                  </ul>

                  <ul className="list-none p-3 m-0">
                    <li>
                      <div
                        className="p-ripple p-3 flex items-center justify-between text-600 cursor-pointer"
                        onClick={() => toggleList("schedule", scheduleListRef)}
                      >
                        <span className="font-medium font-bold text-primary">
                          SCHEDULE
                        </span>
                        <i
                          className={`pi ${
                            isExpanded["schedule"]
                              ? "pi-chevron-up"
                              : "pi-chevron-down"
                          } ml-auto mr-1 text-primary`}
                        ></i>
                        <Ripple />
                      </div>
                      <ul
                        ref={scheduleListRef}
                        className="list-none p-0 m-0 overflow-hidden transition-all"
                        style={{
                          maxHeight: isExpanded["schedule"]
                            ? `${scheduleListRef.current?.scrollHeight}px`
                            : "0",
                          transition: "max-height 0.3s ease-in-out",
                        }}
                      >
                        <li>
                          <a className="p-ripple flex items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                            <i className="pi pi-calendar mr-2 text-primary"></i>
                            <span className="font-small text-primary">
                              Display Schedule
                            </span>
                            <Ripple />
                          </a>
                        </li>
                      </ul>
                    </li>
                  </ul>

                  <ul className="list-none p-3 m-0">
                    <li>
                      <div
                        className="p-ripple p-3 flex items-center justify-between text-600 cursor-pointer"
                        onClick={() => toggleList("others", othersListRef)}
                      >
                        <span className="font-medium font-bold text-primary">
                          OTHERS
                        </span>
                        <i
                          className={`pi ${
                            isExpanded["others"]
                              ? "pi-chevron-up"
                              : "pi-chevron-down"
                          } ml-auto mr-1 text-primary`}
                        ></i>
                        <Ripple />
                      </div>
                      <ul
                        ref={othersListRef}
                        className="list-none p-0 m-0 overflow-hidden transition-all"
                        style={{
                          maxHeight: isExpanded["others"]
                            ? `${othersListRef.current?.scrollHeight}px`
                            : "0",
                          transition: "max-height 0.3s ease-in-out",
                        }}
                      >
                        <li>
                          <a className="p-ripple flex items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                            <i className="pi pi-folder-open mr-2 text-primary"></i>
                            <span className="font-small text-primary">
                              View Highlights
                            </span>
                            <Ripple />
                          </a>
                        </li>
                        <li>
                          <a className="p-ripple flex items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                            <i className="pi pi-file-edit mr-2 text-primary"></i>
                            <span className="font-small text-primary">
                              Manage Approval Requests
                            </span>
                            <Ripple />
                          </a>
                        </li>
                        <li>
                          <a className="p-ripple flex items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                            <i className="pi pi-folder-open mr-2 text-primary"></i>
                            <span className="font-small text-primary">
                              View Activity Logs
                            </span>
                            <Ripple />
                          </a>
                        </li>
                        <li>
                          <a className="p-ripple flex items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                            <i className="pi pi-lock mr-2 text-primary"></i>
                            <span className="font-small text-primary">
                              View Privacy Settings
                            </span>
                            <Ripple />
                          </a>
                        </li>
                        <li>
                          <a className="p-ripple flex items-center cursor-pointer p-3 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full">
                            <i className="pi pi-list mr-2 text-primary"></i>
                            <span className="font-small text-primary">
                              Manage List Items
                            </span>
                            <Ripple />
                          </a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      ></Sidebar>
    </div>
  );
};

export default SidebarMenu;
