import { TableRowData } from "@/components/Table/DataTable";

export interface RoleData extends TableRowData {
    id: string;
    name: string;
}

export const mockRolesList: RoleData[] = [
    {
        id: "2301D884-221A-4E7D-B509-0113DCC043E1",
        name: "Administrator"
    },
    {
        id: "01B168FD-810B-432D-9010-233BA0B380E6",
        name: "Caregiver"
    },
    {
        id: "7D9B7113-A8F8-4035-99A7-A20DD400F6A3",
        name: "Doctor"
    },
    {
        id: "01B168FD-810B-432D-9010-233BA0B380E7",
        name: "Game Therapist"
    },
    {
        id: "78A7570F-3CE5-48BA-9461-80283ED1D94D",
        name: "Guardian"
    },
    {
        id: "01B168FE-810B-432D-9010-233BA0B380E9",
        name: "Supervisor"
    },
]