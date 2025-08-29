import Searchbar from "@/components/Searchbar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ListFilter } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTableClient } from "@/components/Table/DataTable";
import { Badge } from "@/components/ui/badge";

const ManageApprovalRequest: React.FC = () => {
    type RequestStatus = "All" | "Pending" | "Approved" | "Rejected"
    const requestStatusList: RequestStatus[] = [
        "All",
        "Pending",
        "Approved",
        "Rejected"
    ]
    type Role = "All" | "Caregiver" | "Doctor" | "Game Therapist"
    const requesteeRoleList: Role[] = [
        "All",
        "Caregiver",
        "Doctor",
        "Game Therapist"
    ]
    const [selectedRequestStatus, setSelectedRequestStatus] = useState<RequestStatus>("All")
    const [selectedRequesteeRole, setRequesteeRole] = useState<Role>("All")
    const [searchItem, setSearchItem] = useState("");
    

    type RequestRow = {
        id: number;
        request_title: string;
        status: "Pending" | "Approved" | "Rejected";
        created_date: Date;
        requested_by: string;
        requestee_role: "Caregiver" | "Doctor" | "Game Therapist";
    };

    const columns: Array<{
        key: keyof RequestRow;
        header: string;
        render?: (value: any) => React.ReactNode;
    }> = [
            { key: "request_title", header: "Request Title" },
            {
                key: "status", header: "Status", render: (value: "Pending" | "Approved" | "Rejected") => {
                    const colorClass: Record<"Pending" | "Approved" | "Rejected", "pending" | "approve" | "reject"> = {
                        Pending: "pending",
                        Approved: "approve",
                        Rejected: "reject"
                    }
                    return <Badge variant={colorClass[value]}>{value}</Badge>
                }
            },
            {
                key: "created_date",
                header: "Created Date",
                render: (value: Date) => value.toLocaleString()
            },
            { key: "requested_by", header: "Requested By" },
            { key: "requestee_role", header: "Role" },
        ];
    const sampleData: RequestRow[] = [
        {
            id: 1,
            request_title: "Delete a patient’s allergy",
            status: "Pending",
            created_date: new Date("2025-08-25 09:30 AM"),
            requested_by: "Alice Tan",
            requestee_role: "Caregiver",
        },
        {
            id: 2,
            request_title: "Recommends a patient to play certain categories of android tablet games",
            status: "Approved",
            created_date: new Date("2025-08-24 02:15 PM"),
            requested_by: "Bob Lim",
            requestee_role: "Doctor",
        },
        {
            id: 3,
            request_title: "Modifies android game categories for a patient",
            status: "Rejected",
            created_date: new Date("2025-08-23 11:00 AM"),
            requested_by: "Charlie Wong",
            requestee_role: "Game Therapist",
        },
        {
            id: 4,
            request_title: "Update patient activity schedule",
            status: "Pending",
            created_date: new Date("2025-08-26 10:00 AM"),
            requested_by: "Diana Ng",
            requestee_role: "Caregiver",
        },
        {
            id: 5,
            request_title: "Approve new therapy game assignments",
            status: "Approved",
            created_date: new Date("2025-08-22 03:45 PM"),
            requested_by: "Ethan Lee",
            requestee_role: "Game Therapist",
        },
        {
            id: 6,
            request_title: "Reject unauthorized game changes",
            status: "Rejected",
            created_date: new Date("2025-08-21 09:15 AM"),
            requested_by: "Fiona Koh",
            requestee_role: "Doctor",
        },
        {
            id: 7,
            request_title: "Add new exercises to patient game plan",
            status: "Pending",
            created_date: new Date("2025-08-26 01:30 PM"),
            requested_by: "George Tan",
            requestee_role: "Game Therapist",
        },
        {
            id: 8,
            request_title: "Approve patient access to specific tablet games",
            status: "Approved",
            created_date: new Date("2025-08-20 11:50 AM"),
            requested_by: "Hannah Lim",
            requestee_role: "Caregiver",
        },
        {
            id: 9,
            request_title: "Reject unauthorized medication changes",
            status: "Rejected",
            created_date: new Date("2025-08-19 02:20 PM"),
            requested_by: "Ian Wong",
            requestee_role: "Doctor",
        },
    ];

    const [filteredData, setFilteredData] = useState(sampleData)
    useEffect(()=>{
        let data = sampleData
        if(selectedRequestStatus != "All"){
            data = data.filter(item=>item.status === selectedRequestStatus)
        }
        if(selectedRequesteeRole != "All"){
            data = data.filter(item=>item.requestee_role===selectedRequesteeRole)
        }
        if(searchItem.trim() != ""){
            data = data.filter(item=>item.request_title.toLowerCase().startsWith(searchItem.trim().toLowerCase()))
        }
        setFilteredData(data)
    },[selectedRequestStatus, selectedRequesteeRole,searchItem])

    return (
        <div className='container flex flex-col min-h-screen w-full mx-auto px-0 sm:px-4 '>
            <div className='flex flex-col sm:gap-4 sm:py-6'>
                <div className='flex justify-between items-center mr-6'>
                    <Searchbar searchItem={searchItem} onSearchChange={(e) => { setSearchItem(e.target.value) }}></Searchbar>
                    <div className="flex gap-4">
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-1">
                                    <ListFilter className="h-4 w-4" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                        Status
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuRadioGroup
                                    value={selectedRequestStatus}
                                    onValueChange={(value) => setSelectedRequestStatus(value as RequestStatus)}
                                >
                                    {requestStatusList.map((status) => (
                                        <DropdownMenuRadioItem value={status} key={status} >
                                            {status}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-1">
                                    <ListFilter className="h-4 w-4" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                        Role
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuRadioGroup
                                    value={selectedRequesteeRole}
                                    onValueChange={(value) => setRequesteeRole(value as Role)}
                                >
                                    {requesteeRoleList.map((role) => (
                                        <DropdownMenuRadioItem value={role} key={role} >
                                            {role}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <Card className="ml-4 mr-4 sm:ml-6 sm:mr-6 px-4 py-2">
                    <CardHeader>
                        <CardTitle>Request Approval</CardTitle>
                        <CardDescription>
                            Review and approve pending requests.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTableClient
                            data={filteredData}
                            columns={columns}
                            viewMore={false}
                            renderActions={(item) =>
                                item.status === "Pending" && (
                                    <div className="flex gap-2">
                                        <Button variant="approve" size="sm" className="h-8 gap-1">
                                            Approve
                                        </Button>
                                        <Button variant="reject" size="sm" className="h-8 gap-1">
                                            Reject
                                        </Button>
                                    </div>
                                )
                            }
                        />
                    </CardContent>
                </Card>
            </div >
        </div>
    )
}
export default ManageApprovalRequest