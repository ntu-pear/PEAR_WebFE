import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "../ui/button"
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


const sidebarConfig: Record<string, SidebarSectionProps[]> = {
  admin: [],
  supervisor: [
    {
      title: "Patients",
      buttons: [
        { label: "Manage Patients", href: "/manage-patients" },
        { label: "Manage Medication", href: "/manage-medication" },
        { label: "View Medication Schedule", href: "/view-medication-schedule" },
      ],
    },
    {
      title: "Activities",
      buttons: [
        { label: "Manage Activities", href: "/manage-activities" },
      ],
    },
    {
      title: "Attendance",
      buttons: [
        { label: "Manage Attendance", href: "/manage-attendance" },
      ],
    },
  ],
};

type SidebarButtonVariant = "secondary" | "ghost";

interface SidebarButtonProps extends ButtonProps {
  label: string;
  variant?: SidebarButtonVariant;
  href: string;
  onClick?: () => void;
}

function SidebarButton({ label, variant = "ghost", onClick, href, ...props }: SidebarButtonProps) {
  return (
    <Link to={href} className={cn("w-full justify-start")} >
      <Button
        {...props}
        variant={variant}
        onClick={onClick}
        className={cn("w-full justify-start")}>
        {label}
      </Button>
    </Link>
  )
}

interface SidebarSectionProps {
  title: string;
  buttons: SidebarButtonProps[];
  activeButton?: string | null;
  onButtonClick?: (idx: string) => void;
}

function SidebarSection({ title, buttons, activeButton, onButtonClick }: SidebarSectionProps) {
  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        {title}
      </h2>
      <div className="space-y-1 px-1.5">
        {buttons.map((button, idx) => {
          const identifier = button.href;
          return (
            <SidebarButton
              key={idx}
              {...button}
              variant={activeButton === identifier ? "secondary" : "ghost"}
              onClick={() => onButtonClick && onButtonClick(identifier)} />
          )
        })}
      </div>
    </div>
  );
}



interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  role: "admin" | "supervisor"
}

export function Sidebar2({ role, className }: SidebarProps) {
  const sections = sidebarConfig[role] || []
  //default first button is active if exist
  const [activeButton, setActiveButton] = useState<string | null>(null)

  useEffect(()=>{
    const currentPath = window.location.pathname;
    const foundButton = sections
    .flatMap(section => section.buttons)
    .find(button => button.href === currentPath); 

    if(foundButton){
      setActiveButton(foundButton.href);
    }

  },sections)

  return (
    <div data-testid="sidebar2" className={cn("fixed max-w-64 top-16 pb-12 border", className)}>
      <div className="space-y-4 py-4">
        {sections.map((section, idx) => (
          <SidebarSection
            key={idx}
            {...section}
            activeButton={activeButton}
            onButtonClick={setActiveButton}
          />
        ))}
      </div>
    </div>
  )
}

export default Sidebar2;