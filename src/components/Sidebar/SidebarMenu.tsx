import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Menu, ChevronDown, ChevronUp } from 'lucide-react';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Types
interface MenuItem {
  title: string;
  icon: string;
  path: string;
  children?: MenuItem[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const supervisorMenu: MenuSection[] = [
  {
    title: 'PATIENTS',
    items: [
      {
        title: 'Manage Patients',
        icon: 'UserRound',
        path: '/supervisor/manage-patients',
      },
      {
        title: 'Add Patients',
        icon: 'UserRoundPlus',
        path: '/supervisor/add-patient',
      },
      {
        title: 'View Medication Schedule',
        icon: 'Calendar',
        path: '/supervisor/view-medication-schedule',
      },
      {
        title: 'Manage Medication',
        icon: 'Pill',
        path: '/supervisor/manage-medication',
      },
    ],
  },
  {
    title: 'ACTIVITIES',
    items: [
      {
        title: 'Manage Activities',
        icon: 'List',
        path: '/supervisor/manage-activities',
      },
    ],
  },
  {
    title: 'ATTENDANCE',
    items: [
      {
        title: 'Manage Attendance',
        icon: 'CheckSquare',
        path: '/supervisor/manage-attendance',
      },
    ],
  },
  {
    title: 'ADHOC',
    items: [
      {
        title: 'Manage Adhoc',
        icon: 'Clipboard',
        path: '/supervisor/manage-adhoc',
      },
      {
        title: 'Add Adhoc',
        icon: 'ClipboardPlus',
        path: '/supervisor/add-adhoc',
      },
    ],
  },
  {
    title: 'SCHEDULE',
    items: [
      {
        title: 'Display Schedule',
        icon: 'Calendar',
        path: '/supervisor/display-schedule',
      },
    ],
  },
  {
    title: 'OTHERS',
    items: [
      {
        title: 'View Highlights',
        icon: 'Star',
        path: '/supevisor/view-highlights',
      },
      {
        title: 'Manage Approval Requests',
        icon: 'SquareCheck',
        path: '/supervisor/manage-approval-requests',
      },
      {
        title: 'View Activity Logs',
        icon: 'BookText',
        path: '/supervisor/view-activity-logs',
      },
      {
        title: 'View Privacy Settings',
        icon: 'Lock',
        path: '/supervisor/view-privacy-settings',
      },
      {
        title: 'Manage List Items',
        icon: 'List',
        path: '/supervisor/manage-list-items',
      },
    ],
  },
];

const adminMenu: MenuSection[] = [
  {
    title: 'ACCOUNTS',
    items: [
      {
        title: 'Manage Accounts',
        icon: 'UserRound',
        path: '/admin/manage-accounts',
      },
      {
        title: 'Add Patients',
        icon: 'UserRoundPlus',
        path: '/admin/register-account',
      },
      {
        title: 'Manage Roles',
        icon: 'UserRoundCog',
        path: '/admin/manage-roles',
      },
    ],
  },
  {
    title: 'CENTRES',
    items: [
      {
        title: 'Manage Activities',
        icon: 'List',
        path: '/admin/manage-activities',
      },
    ],
  },
  {
    title: 'LIST',
    items: [
      {
        title: 'Manage Lists',
        icon: 'List',
        path: '/admin/manage-lists',
      },
      {
        title: 'View Lists Log',
        icon: 'List',
        path: '/admin/view-lists-log',
      },
    ],
  },
  {
    title: 'DEVELOPER',
    items: [
      {
        title: 'Edit Roles',
        icon: 'Wrench',
        path: '/admin/edit-roles',
      },
      {
        title: 'Manage Social History',
        icon: 'Wrench',
        path: '/admin/manage-social-history',
      },
      {
        title: 'Manage Miscellaneous',
        icon: 'Wrench',
        path: '/admin/manage-miscellaneous',
      },
    ],
  },
  {
    title: 'OTHERS',
    items: [
      {
        title: 'Account Logs',
        icon: 'UserRound',
        path: '/admin/view-highlights',
      },
      {
        title: 'Manage Approval Requests',
        icon: 'SquareCheck',
        path: '/admin/manage-approval-requests',
      },
      {
        title: 'Manage Notification Scenarios',
        icon: 'BookText',
        path: '/admin/manage-notification-scenarios',
      },
    ],
  },
];

// ExpandableSection component
const ExpandableSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between text-lg">
          <span className="font-bold">{title}</span>
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
};

// MenuItem component
const MenuItem: React.FC<{
  to: string;
  icon: string;
  label: string;
  closeSheet: () => void;
}> = ({ to, icon, label, closeSheet }) => {
  const IconComponent = Icons[icon as keyof typeof Icons] as LucideIcon;

  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate(to);
    closeSheet();
  };

  return (
    <Button variant="ghost" className="w-full justify-start text-base" asChild>
      <a onClick={handleNavigation} className="flex items-center">
        <IconComponent className="mr-2 h-5 w-5" />
        <span>{label}</span>
      </a>
    </Button>
  );
};

// Main SidebarMenu component
const SidebarMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const closeSheet = () => setOpen(false);
  const { currentUser } = useAuth();
  const menuSections =
    currentUser?.roleName === 'ADMIN'
      ? adminMenu
      : currentUser?.roleName === 'SUPERVISOR'
      ? supervisorMenu
      : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] py-4">
        <div className="flex flex-col h-full">
          <div className="flex items-center mb-4 px-4">
            <img className="h-12 w-24" src="/pear.png" alt="Pear Logo" />
          </div>
          <div className="flex-grow overflow-y-auto">
            {menuSections &&
              menuSections.map((section) => (
                <ExpandableSection key={section.title} title={section.title}>
                  {section.items.map((item) => (
                    <MenuItem
                      key={item.title}
                      to={item.path}
                      icon={item.icon}
                      label={item.title}
                      closeSheet={closeSheet}
                    />
                  ))}
                </ExpandableSection>
              ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SidebarMenu;
