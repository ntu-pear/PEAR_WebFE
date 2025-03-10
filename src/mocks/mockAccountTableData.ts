import { AccountTableDataServer, User } from "@/api/admin/user";
import { TableRowData } from "@/components/Table/DataTable";

export interface AccountTableData extends TableRowData {
  id: string;
  name: string;
  status: string;
  email: string;
  createdDate: string;
  role: string;
}

export const mockAccountTDList: AccountTableDataServer = {
  total: 8,
  pageNo: 1,
  pageSize: 10,
  data: [
  {
    "id": "U01d447fkcfe",
    "preferredName": "",
    "nric_FullName": "1 Test Account",
    "nric": "S9996953A",
    "nric_Address": "123 Ang Mo Kio Ave 1 #04-332 Singapore 550123",
    "nric_DateOfBirth": "1999-04-30",
    "nric_Gender": "F",
    "roleName": "CAREGIVER",
    "contactNo": "+65 99991223",
    "allowNotification": true,
    "profilePicture": "https://res.cloudinary.com/dnusi4qsd/image/upload/v1739163007/profile_pictures/user_U01d447fkcfe_profile_picture.jpg",
    "status": "ACTIVE",
    "email": "adeline@gmail.com",
    "emailConfirmed": true,
    "verified": true,
    "active": true,
    "twoFactorEnabled": false,
    "lockoutEnabled": false,
    "lockoutReason": null,
    "createdById": "1",
    "createdDate": "2025-02-17 15:21:00",
    "modifiedById": "Ufa53ec48e2f",
    "modifiedDate": "2025-02-20 14:10:19",
    "loginTimeStamp": "2025-02-20 14:10:19"
  },
  {
    "id": "U85f3847c88b",
    "preferredName": "",
    "nric_FullName": "JESS NG",
    "nric": "T0048674B",
    "nric_Address": "123 Jurong West Ave 1 #04-332 Singapore 550123",
    "nric_DateOfBirth": "2000-01-20",
    "nric_Gender": "F",
    "roleName": "SUPERVISOR",
    "contactNo": "+65 89992293",
    "allowNotification": true,
    "profilePicture": "https://res.cloudinary.com/dnusi4qsd/image/upload/v1739162931/profile_pictures/user_U85f3847c88b_profile_picture.jpg",
    "status": "ACTIVE",
    "email": "jess@gmail.com",
    "emailConfirmed": true,
    "verified": true,
    "active": true,
    "twoFactorEnabled": false,
    "lockoutEnabled": false,
    "lockoutReason": null,
    "createdById": "1",
    "createdDate": "2025-02-17 15:21:00",
    "modifiedById": "U85f3847c88b",
    "modifiedDate": "2025-02-19 15:41:48",
    "loginTimeStamp": "2025-02-20 14:10:19"
  },
  {
    "id": "U9b44ce4l228",
    "preferredName": "",
    "nric_FullName": "ADELINE ANG",
    "nric": "S8080809D",
    "nric_Address": "123 Bishan Ave 1 #04-332 Singapore 550123",
    "nric_DateOfBirth": "1980-08-10",
    "nric_Gender": "F",
    "roleName": "CAREGIVER",
    "contactNo": "+65 95231223",
    "allowNotification": true,
    "profilePicture": "https://res.cloudinary.com/dnusi4qsd/image/upload/v1739163025/profile_pictures/user_U9b44ce4l228_profile_picture.jpg",
    "status": "ACTIVE",
    "email": "adeline2@gmail.com",
    "emailConfirmed": true,
    "verified": true,
    "active": true,
    "twoFactorEnabled": false,
    "lockoutEnabled": false,
    "lockoutReason": null,
    "createdById": "1",
    "createdDate": "2025-02-17 15:21:00",
    "modifiedById": "Ufa53ec48e2f",
    "modifiedDate": "2025-02-18 00:31:23",
    "loginTimeStamp": "2025-02-20 14:10:19"
  },
  {
    "id": "Ubdc5372f735",
    "preferredName": "",
    "nric_FullName": "DAWN ONG",
    "nric": "T0299934C",
    "nric_Address": "123 Sengkang Ave 1 #04-332 Singapore 550123",
    "nric_DateOfBirth": "2002-04-01",
    "nric_Gender": "F",
    "roleName": "GUARDIAN",
    "contactNo": "+65 85551223",
    "allowNotification": true,
    "profilePicture": "https://res.cloudinary.com/dnusi4qsd/image/upload/v1739162875/profile_pictures/user_Ubdc5372f735_profile_picture.jpg",
    "status": "ACTIVE",
    "email": "dawnong333@gmail.com",
    "emailConfirmed": true,
    "verified": true,
    "active": true,
    "twoFactorEnabled": false,
    "lockoutEnabled": false,
    "lockoutReason": null,
    "createdById": "1",
    "createdDate": "2025-02-17 15:21:00",
    "modifiedById": "Ufa53ec48e2f",
    "modifiedDate": "2025-02-17 23:39:37",
    "loginTimeStamp": "2025-02-20 14:10:19"
  },
  {
    "id": "Ud31e15522f4",
    "preferredName": "",
    "nric_FullName": "DANIEL ANG",
    "nric": "T0123245D",
    "nric_Address": "123 Punggol Ave 1 #04-332 Singapore 550123",
    "nric_DateOfBirth": "2001-03-01",
    "nric_Gender": "M",
    "roleName": "DOCTOR",
    "contactNo": "+65 83232223",
    "allowNotification": true,
    "profilePicture": "https://res.cloudinary.com/dnusi4qsd/image/upload/v1739162837/profile_pictures/user_Ud31e15522f4_profile_picture.jpg",
    "status": "ACTIVE",
    "email": "daniel@gmail.com",
    "emailConfirmed": true,
    "verified": true,
    "active": true,
    "twoFactorEnabled": false,
    "lockoutEnabled": false,
    "lockoutReason": null,
    "createdById": "1",
    "createdDate": "2025-02-17 15:21:00",
    "modifiedById": "Ufa53ec48e2f",
    "modifiedDate": "2025-02-18 00:34:40",
    "loginTimeStamp": "2025-02-20 14:10:19"
  },
  {
    "id": "Ud7acef5fa69",
    "preferredName": "",
    "nric_FullName": "ALAN WEE",
    "nric": "T0341345E",
    "nric_Address": "123 Bukit Timah Ave 1 #04-332 Singapore 550123",
    "nric_DateOfBirth": "2003-05-01",
    "nric_Gender": "M",
    "roleName": "GAME THERAPIST",
    "contactNo": "+65 88881223",
    "allowNotification": true,
    "profilePicture": "https://res.cloudinary.com/dnusi4qsd/image/upload/v1739162902/profile_pictures/user_Ud7acef5fa69_profile_picture.jpg",
    "status": "ACTIVE",
    "email": "alan@gmail.com",
    "emailConfirmed": true,
    "verified": true,
    "active": true,
    "twoFactorEnabled": false,
    "lockoutEnabled": false,
    "lockoutReason": null,
    "createdById": "1",
    "createdDate": "2025-02-17 15:21:00",
    "modifiedById": "Ud7acef5fa69",
    "modifiedDate": "2025-02-19 19:14:26",
    "loginTimeStamp": "2025-02-20 14:10:19"
  },
  {
    "id": "Ud7acef5fa6f",
    "preferredName": "",
    "nric_FullName": "TESTER ",
    "nric": "T0341345D",
    "nric_Address": "123 Bukit Timah Ave 1 #05-333 Singapore 550123",
    "nric_DateOfBirth": "2003-05-01",
    "nric_Gender": "M",
    "roleName": "GAME THERAPIST",
    "contactNo": "81241211",
    "allowNotification": true,
    "profilePicture": "",
    "status": "ACTIVE",
    "email": "fyppear.frontend2@gmail.com",
    "emailConfirmed": true,
    "verified": true,
    "active": true,
    "twoFactorEnabled": true,
    "lockoutEnabled": false,
    "lockoutReason": null,
    "createdById": "1",
    "createdDate": "2025-02-19 19:41:38",
    "modifiedById": "1",
    "modifiedDate": "2025-02-19 21:27:15",
    "loginTimeStamp": "2025-02-20 14:10:19"
  },
  {
    "id": "Ufa53ec48e2f",
    "preferredName": "",
    "nric_FullName": "JANICE ONG",
    "nric": "T0012323D",
    "nric_Address": "123 Serangoon Ave 1 #04-332 Singapore 550123",
    "nric_DateOfBirth": "2000-02-01",
    "nric_Gender": "F",
    "roleName": "ADMIN",
    "contactNo": "+65 81241223",
    "allowNotification": true,
    "profilePicture": "https://res.cloudinary.com/dnusi4qsd/image/upload/v1739162954/profile_pictures/user_Ufa53ec48e2f_profile_picture.jpg",
    "status": "ACTIVE",
    "email": "janice@gmail.com",
    "emailConfirmed": true,
    "verified": true,
    "active": true,
    "twoFactorEnabled": false,
    "lockoutEnabled": false,
    "lockoutReason": null,
    "createdById": "1",
    "createdDate": "2025-02-17 15:21:00",
    "modifiedById": "1",
    "modifiedDate": "2025-02-17 15:21:00",
    "loginTimeStamp": "2025-02-20 14:10:19"
  }
]}