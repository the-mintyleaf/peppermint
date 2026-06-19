import type { OrgFlowNode, OrgFlowEdge } from "./OrganizationTree.store";

export const DUMMY_NODES: OrgFlowNode[] = [
  {
    "id": "moha",
    "type": "org",
    "position": {
      "x": 600,
      "y": 0
    },
    "data": {
      "nodeType": "org",
      "name": "Ministry of Home Affairs",
      "orgType": "ministry",
      "description": "Central government ministry responsible for internal security, administration, disaster management, immigration, and home affairs in Nepal.",
      "location": "Singhdurbar, Kathmandu",
      "status": "active",
      "headCount": 183
    }
  },
  {
    "id": "home-minister",
    "type": "person",
    "position": {
      "x": 600,
      "y": 210
    },
    "data": {
      "nodeType": "person",
      "fullName": "Sudhan Gurung",
      "designation": "Hon'ble Home Minister",
      "department": "Ministry of Home Affairs",
      "role": "minister",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "home-secretary",
    "type": "person",
    "position": {
      "x": 600,
      "y": 420
    },
    "data": {
      "nodeType": "person",
      "fullName": "Rajkumar Shrestha",
      "designation": "Home Secretary",
      "department": "Ministry of Home Affairs",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "division-security-and-coordination-division",
    "type": "department",
    "position": {
      "x": 1620,
      "y": 720
    },
    "data": {
      "nodeType": "department",
      "name": "Security and Coordination Division",
      "deptType": "division",
      "head": "Ananda Kafle",
      "parentName": "Rajkumar Shrestha",
      "peopleCount": 4,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-peace-security-and-crime-control-section",
    "type": "department",
    "position": {
      "x": 5250,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Peace, Security and Crime Control Section",
      "deptType": "section",
      "head": "",
      "parentName": "Security and Coordination Division",
      "peopleCount": 18,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-border-and-immigration-administration-section",
    "type": "department",
    "position": {
      "x": 750,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Border and Immigration Administration Section",
      "deptType": "section",
      "head": "",
      "parentName": "Security and Coordination Division",
      "peopleCount": 7,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-local-administration-and-province-co-ordination-section",
    "type": "department",
    "position": {
      "x": 4350,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Local Administration and Province Co-Ordination Section",
      "deptType": "section",
      "head": "",
      "parentName": "Security and Coordination Division",
      "peopleCount": 5,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-hello-moha-complaint-handling-desk",
    "type": "department",
    "position": {
      "x": 2550,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Hello MoHA, Complaint Handling Desk",
      "deptType": "section",
      "head": "",
      "parentName": "Security and Coordination Division",
      "peopleCount": 2,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-information-coordination-and-analysis-unit",
    "type": "department",
    "position": {
      "x": 3450,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Information Coordination and Analysis Unit",
      "deptType": "section",
      "head": "",
      "parentName": "Security and Coordination Division",
      "peopleCount": 0,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "division-policy-plan-monitoring-and-evaluation-division",
    "type": "department",
    "position": {
      "x": 1280,
      "y": 720
    },
    "data": {
      "nodeType": "department",
      "name": "Policy, Plan, Monitoring and Evaluation Division",
      "deptType": "division",
      "head": "Suman Ghimire",
      "parentName": "Rajkumar Shrestha",
      "peopleCount": 3,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-drug-control-section",
    "type": "department",
    "position": {
      "x": 1950,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Drug Control Section",
      "deptType": "section",
      "head": "",
      "parentName": "Policy, Plan, Monitoring and Evaluation Division",
      "peopleCount": 3,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-planing-monitoring-and-evaluation-section",
    "type": "department",
    "position": {
      "x": 5850,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Planing, Monitoring and Evaluation Section",
      "deptType": "section",
      "head": "",
      "parentName": "Policy, Plan, Monitoring and Evaluation Division",
      "peopleCount": 9,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-citizenship-and-nid-management-section",
    "type": "department",
    "position": {
      "x": 1050,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Citizenship and NID Management Section",
      "deptType": "section",
      "head": "",
      "parentName": "Policy, Plan, Monitoring and Evaluation Division",
      "peopleCount": 5,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "division-administration-division",
    "type": "department",
    "position": {
      "x": -80,
      "y": 720
    },
    "data": {
      "nodeType": "department",
      "name": "Administration Division",
      "deptType": "division",
      "head": "Kali Prasad Parajuli",
      "parentName": "Rajkumar Shrestha",
      "peopleCount": 3,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-information-and-technology-section",
    "type": "department",
    "position": {
      "x": 3150,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Information & Technology Section",
      "deptType": "section",
      "head": "",
      "parentName": "Administration Division",
      "peopleCount": 7,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-grievance-handling-section",
    "type": "department",
    "position": {
      "x": 2250,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Grievance Handling Section",
      "deptType": "section",
      "head": "",
      "parentName": "Administration Division",
      "peopleCount": 10,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-personnel-administration-section",
    "type": "department",
    "position": {
      "x": 5550,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Personnel Administration Section",
      "deptType": "section",
      "head": "",
      "parentName": "Administration Division",
      "peopleCount": 8,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-police-personnel-administration-section",
    "type": "department",
    "position": {
      "x": 6150,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Police Personnel Administration Section",
      "deptType": "section",
      "head": "",
      "parentName": "Administration Division",
      "peopleCount": 4,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "division-internal-management-division",
    "type": "department",
    "position": {
      "x": 600,
      "y": 720
    },
    "data": {
      "nodeType": "department",
      "name": "Internal Management Division",
      "deptType": "division",
      "head": "Rishiram Tiwari",
      "parentName": "Rajkumar Shrestha",
      "peopleCount": 3,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-office-management-and-goods-section",
    "type": "department",
    "position": {
      "x": 4650,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Office Management and Goods Section",
      "deptType": "section",
      "head": "",
      "parentName": "Internal Management Division",
      "peopleCount": 17,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-internal-administration-vechical-meeting-and-ceremony-managemnt-section",
    "type": "department",
    "position": {
      "x": 3750,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Internal Administration, Vechical, Meeting and Ceremony Managemnt Section",
      "deptType": "section",
      "head": "",
      "parentName": "Internal Management Division",
      "peopleCount": 4,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-bibhushan-section",
    "type": "department",
    "position": {
      "x": 450,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Bibhushan Section",
      "deptType": "section",
      "head": "",
      "parentName": "Internal Management Division",
      "peopleCount": 4,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-account-section",
    "type": "department",
    "position": {
      "x": 150,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Account Section",
      "deptType": "section",
      "head": "",
      "parentName": "Internal Management Division",
      "peopleCount": 9,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "division-disaster-and-conflict-management-division",
    "type": "department",
    "position": {
      "x": 260,
      "y": 720
    },
    "data": {
      "nodeType": "department",
      "name": "Disaster and Conflict Management Division",
      "deptType": "division",
      "head": "Suresh Panthi",
      "parentName": "Rajkumar Shrestha",
      "peopleCount": 3,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-peace-promotion-section",
    "type": "department",
    "position": {
      "x": 4950,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Peace Promotion Section",
      "deptType": "section",
      "head": "",
      "parentName": "Disaster and Conflict Management Division",
      "peopleCount": 3,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-relief-and-data-management-section",
    "type": "department",
    "position": {
      "x": 6450,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Relief and Data Management Section",
      "deptType": "section",
      "head": "",
      "parentName": "Disaster and Conflict Management Division",
      "peopleCount": 8,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-disaster-study-risk-reduction-and-recovery-section",
    "type": "department",
    "position": {
      "x": 1650,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Disaster Study Risk Reduction and Recovery Section",
      "deptType": "section",
      "head": "",
      "parentName": "Disaster and Conflict Management Division",
      "peopleCount": 6,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-disaster-preparedness-and-response-section-neoc",
    "type": "department",
    "position": {
      "x": 1350,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Disaster Preparedness and Response Section (NEOC)",
      "deptType": "section",
      "head": "",
      "parentName": "Disaster and Conflict Management Division",
      "peopleCount": 1,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "division-legal-division",
    "type": "department",
    "position": {
      "x": 940,
      "y": 720
    },
    "data": {
      "nodeType": "department",
      "name": "Legal Division",
      "deptType": "division",
      "head": "Krishna Kumar Karki",
      "parentName": "Rajkumar Shrestha",
      "peopleCount": 2,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-human-rights-promotion-section",
    "type": "department",
    "position": {
      "x": 2850,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Human Rights Promotion Section",
      "deptType": "section",
      "head": "",
      "parentName": "Legal Division",
      "peopleCount": 3,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "section-legal-decision-administration-section",
    "type": "department",
    "position": {
      "x": 4050,
      "y": 960
    },
    "data": {
      "nodeType": "department",
      "name": "Legal Decision Administration Section",
      "deptType": "section",
      "head": "",
      "parentName": "Legal Division",
      "peopleCount": 6,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "unit-chalani",
    "type": "department",
    "position": {
      "x": 1110,
      "y": 240
    },
    "data": {
      "nodeType": "department",
      "name": "Chalani",
      "deptType": "auxiliary_or_staff_directory_unit",
      "head": "",
      "parentName": "Ministry of Home Affairs",
      "peopleCount": 4,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "unit-registration-section",
    "type": "department",
    "position": {
      "x": 1450,
      "y": 240
    },
    "data": {
      "nodeType": "department",
      "name": "Registration Section",
      "deptType": "auxiliary_or_staff_directory_unit",
      "head": "",
      "parentName": "Ministry of Home Affairs",
      "peopleCount": 4,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "unit-secretariat-of-home-minister",
    "type": "department",
    "position": {
      "x": 1790,
      "y": 240
    },
    "data": {
      "nodeType": "department",
      "name": "Secretariat of Home Minister",
      "deptType": "auxiliary_or_staff_directory_unit",
      "head": "",
      "parentName": "Ministry of Home Affairs",
      "peopleCount": 3,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "unit-secretariat-of-secretary",
    "type": "department",
    "position": {
      "x": 2130,
      "y": 240
    },
    "data": {
      "nodeType": "department",
      "name": "Secretariat of Secretary",
      "deptType": "auxiliary_or_staff_directory_unit",
      "head": "",
      "parentName": "Ministry of Home Affairs",
      "peopleCount": 1,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "unit-singadurbar-entrance-south-gate",
    "type": "department",
    "position": {
      "x": 2470,
      "y": 240
    },
    "data": {
      "nodeType": "department",
      "name": "Singadurbar Entrance (South-Gate)",
      "deptType": "auxiliary_or_staff_directory_unit",
      "head": "",
      "parentName": "Ministry of Home Affairs",
      "peopleCount": 2,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "person-001",
    "type": "person",
    "position": {
      "x": -420,
      "y": 720
    },
    "data": {
      "nodeType": "person",
      "fullName": "Rajkumar Shrestha",
      "designation": "Home Secretary",
      "department": "Ministry of Home Affairs",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-002",
    "type": "person",
    "position": {
      "x": -5250,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ananda Kafle",
      "designation": "Joint Secretary (Spokesperson)",
      "department": "Security and Coordination Division",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-003",
    "type": "person",
    "position": {
      "x": -750,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Suman Ghimire",
      "designation": "Joint Secretary",
      "department": "Policy, Plan, Monitoring and Evaluation Division",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-004",
    "type": "person",
    "position": {
      "x": -1350,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Rishiram Tiwari",
      "designation": "Joint Secretary",
      "department": "Internal Management Division",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-005",
    "type": "person",
    "position": {
      "x": -450,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Suresh Panthi",
      "designation": "Joint Secretary",
      "department": "Disaster and Conflict Management Division",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-006",
    "type": "person",
    "position": {
      "x": -3150,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Kali Prasad Parajuli",
      "designation": "Joint Secretary",
      "department": "Administration Division",
      "role": "secretary",
      "email": "parajulikali@yahoo.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-007",
    "type": "person",
    "position": {
      "x": -2550,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Krishna Kumar Karki",
      "designation": "Joint Secretary",
      "department": "Legal Division",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-008",
    "type": "person",
    "position": {
      "x": -12000,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Biswa Raj Neupane",
      "designation": "Under Secretary",
      "department": "Disaster Study Risk Reduction and Recovery Section",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-009",
    "type": "person",
    "position": {
      "x": -1950,
      "y": 240
    },
    "data": {
      "nodeType": "person",
      "fullName": "Jitendra Adhikari",
      "designation": "Under Secretary",
      "department": "Ministry of Home Affairs",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-010",
    "type": "person",
    "position": {
      "x": -16800,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Bandana Kumari K.C",
      "designation": "Under Secretary",
      "department": "Human Rights Promotion Section",
      "role": "secretary",
      "email": "kcgbs123@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-011",
    "type": "person",
    "position": {
      "x": 6300,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Pradasani Kumari",
      "designation": "Under Secretary",
      "department": "Border and Immigration Administration Section",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-012",
    "type": "person",
    "position": {
      "x": -16500,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Bartaraj Paudel",
      "designation": "Under Secretary",
      "department": "Internal Administration, Vechical, Meeting and Ceremony Managemnt Section",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-013",
    "type": "person",
    "position": {
      "x": 15300,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Santosh Poudel",
      "designation": "Under Secretary",
      "department": "Office Management and Goods Section",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-014",
    "type": "person",
    "position": {
      "x": 3300,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Narayan Parasd Adhikari",
      "designation": "Under Secretary",
      "department": "Bibhushan Section",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-015",
    "type": "person",
    "position": {
      "x": -7500,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ganesh Gaire",
      "designation": "Under Secretary",
      "department": "Police Personnel Administration Section",
      "role": "secretary",
      "email": "ggaire4@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-016",
    "type": "person",
    "position": {
      "x": 7500,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Prem Dahal",
      "designation": "Under Secretary",
      "department": "Grievance Handling Section",
      "role": "secretary",
      "email": "sugyamibigad@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-017",
    "type": "person",
    "position": {
      "x": -12300,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Bishwamitra Kuinkel",
      "designation": "Under Secretary",
      "department": "Planing, Monitoring and Evaluation Section",
      "role": "secretary",
      "email": "bkuinkel@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-018",
    "type": "person",
    "position": {
      "x": -12900,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Bishnu Hari Wagle",
      "designation": "Under Secretary",
      "department": "Account Section",
      "role": "secretary",
      "email": "bishnuhariwagle@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-019",
    "type": "person",
    "position": {
      "x": -1500,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Khemraj Upadhyaya",
      "designation": "Under Secretary",
      "department": "Peace Promotion Section",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-020",
    "type": "person",
    "position": {
      "x": 1800,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Mina Aryal",
      "designation": "Under Secretary",
      "department": "Personnel Administration Section",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-021",
    "type": "person",
    "position": {
      "x": 18900,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Umakant Adhikari",
      "designation": "Under Secretary",
      "department": "Relief and Data Management Section",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-022",
    "type": "person",
    "position": {
      "x": -600,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Kul Sekhar Aryal",
      "designation": "Under Secretary",
      "department": "Citizenship and NID Management Section",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-023",
    "type": "person",
    "position": {
      "x": 9900,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Rama Acharya (Subedi)",
      "designation": "Under Secretary (Information Officer)",
      "department": "Peace, Security and Crime Control Section",
      "role": "secretary",
      "email": "informationofficer@moha.gov.np",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-024",
    "type": "person",
    "position": {
      "x": -5100,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ishwori Dutta Paneru",
      "designation": "Under Secretary",
      "department": "Hello MoHA, Complaint Handling Desk",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-025",
    "type": "person",
    "position": {
      "x": 18300,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Sushma Shrestha",
      "designation": "Senior Computer Engineer",
      "department": "Information & Technology Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-026",
    "type": "person",
    "position": {
      "x": 5700,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Pitambar Bhandari",
      "designation": "Under Secretary (Law)",
      "department": "Legal Decision Administration Section",
      "role": "secretary",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-027",
    "type": "person",
    "position": {
      "x": 11100,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ranjana Rai",
      "designation": "Section Officer",
      "department": "Disaster Study Risk Reduction and Recovery Section",
      "role": "officer",
      "email": "ranjana_rai88@yahoo.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-028",
    "type": "person",
    "position": {
      "x": 2400,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Muskan Kumar Maskey",
      "designation": "Section Officer",
      "department": "Office Management and Goods Section",
      "role": "officer",
      "email": "muskankr21@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-029",
    "type": "person",
    "position": {
      "x": 90,
      "y": 240
    },
    "data": {
      "nodeType": "person",
      "fullName": "Shyam Krishna Lamichhane",
      "designation": "Section Officer",
      "department": "Ministry of Home Affairs",
      "role": "officer",
      "email": "shyamlamichhane983@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-030",
    "type": "person",
    "position": {
      "x": -10200,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Dinesh Neupane",
      "designation": "Section Officer",
      "department": "Peace, Security and Crime Control Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-031",
    "type": "person",
    "position": {
      "x": 14400,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Sangam Sapkota",
      "designation": "Section Officer",
      "department": "Peace, Security and Crime Control Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-032",
    "type": "person",
    "position": {
      "x": -17700,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "BISHNU PRASAD ARCHYA",
      "designation": "Section Officer",
      "department": "Internal Administration, Vechical, Meeting and Ceremony Managemnt Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-033",
    "type": "person",
    "position": {
      "x": -9600,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Dipak Kumar Acharya",
      "designation": "Section Officer",
      "department": "Peace, Security and Crime Control Section",
      "role": "officer",
      "email": "acharyadeep111@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-034",
    "type": "person",
    "position": {
      "x": -2630,
      "y": 240
    },
    "data": {
      "nodeType": "person",
      "fullName": "Dipesh Bindari",
      "designation": "Section Officer",
      "department": "Ministry of Home Affairs",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-035",
    "type": "person",
    "position": {
      "x": 7800,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Radha Kumari Shrestha",
      "designation": "Section Officer",
      "department": "Peace Promotion Section",
      "role": "officer",
      "email": "anamikanakamora@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-036",
    "type": "person",
    "position": {
      "x": -16200,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Beejayakumar Maharjan",
      "designation": "Section Officer",
      "department": "Bibhushan Section",
      "role": "officer",
      "email": "beejay.kumar9@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-037",
    "type": "person",
    "position": {
      "x": -10800,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Deepesh Chhangchha",
      "designation": "Section Officer",
      "department": "Local Administration and Province Co-Ordination Section",
      "role": "officer",
      "email": "moha.deepesh@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-038",
    "type": "person",
    "position": {
      "x": -1800,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Khem Raj Koirala",
      "designation": "Section Officer",
      "department": "Disaster Preparedness and Response Section (NEOC)",
      "role": "officer",
      "email": "khemraj.koirala@nepal.gov.np",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-039",
    "type": "person",
    "position": {
      "x": 21000,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "खेमराज पौडेल",
      "designation": "Section Officer",
      "department": "Peace, Security and Crime Control Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-040",
    "type": "person",
    "position": {
      "x": 10500,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ramakant Aryal",
      "designation": "Section Officer",
      "department": "Personnel Administration Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-041",
    "type": "person",
    "position": {
      "x": -19500,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Aashish Sharma",
      "designation": "Section Officer",
      "department": "Local Administration and Province Co-Ordination Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-042",
    "type": "person",
    "position": {
      "x": 13200,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Sabin Wagle",
      "designation": "Section Officer",
      "department": "Police Personnel Administration Section",
      "role": "officer",
      "email": "sabin.wagle@nepal.gov.np",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-043",
    "type": "person",
    "position": {
      "x": 14100,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Samir Bhandari",
      "designation": "Section Officer",
      "department": "Disaster Study Risk Reduction and Recovery Section",
      "role": "officer",
      "email": "sawmer42@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-044",
    "type": "person",
    "position": {
      "x": 21300,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "सन्देश अधिकारी",
      "designation": "Section Officer",
      "department": "Personnel Administration Section",
      "role": "officer",
      "email": "sandesh.officer@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-045",
    "type": "person",
    "position": {
      "x": 17700,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Sofin Saha",
      "designation": "Section Officer",
      "department": "Bibhushan Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-046",
    "type": "person",
    "position": {
      "x": 4800,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Padam Bahadur Khatri",
      "designation": "Section Officer",
      "department": "Office Management and Goods Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-047",
    "type": "person",
    "position": {
      "x": 10800,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ramchandra shivakoti",
      "designation": "Section Officer",
      "department": "Hello MoHA, Complaint Handling Desk",
      "role": "officer",
      "email": "ramchand2028@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-048",
    "type": "person",
    "position": {
      "x": 8100,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Raj Bahadur Bista",
      "designation": "Section Officer",
      "department": "Border and Immigration Administration Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-049",
    "type": "person",
    "position": {
      "x": 3900,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Netraraj Giri",
      "designation": "Section Officer",
      "department": "Border and Immigration Administration Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-050",
    "type": "person",
    "position": {
      "x": 20400,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "samita pokhrel",
      "designation": "Section Officer",
      "department": "Legal Decision Administration Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-051",
    "type": "person",
    "position": {
      "x": -900,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Krishna Devkota",
      "designation": "Section Officer",
      "department": "Police Personnel Administration Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-052",
    "type": "person",
    "position": {
      "x": -18000,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ashmita Rai",
      "designation": "Section Officer",
      "department": "Drug Control Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-053",
    "type": "person",
    "position": {
      "x": -2100,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Khem Narayan Paudel",
      "designation": "Section Officer",
      "department": "Relief and Data Management Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-054",
    "type": "person",
    "position": {
      "x": -18900,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ananda Bamsha Neupane",
      "designation": "Section Officer",
      "department": "Peace, Security and Crime Control Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-055",
    "type": "person",
    "position": {
      "x": -15000,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Bijay Raj Paudel",
      "designation": "Section Officer",
      "department": "Relief and Data Management Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-056",
    "type": "person",
    "position": {
      "x": 600,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Lokraj Bohara",
      "designation": "Section Officer",
      "department": "Grievance Handling Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-057",
    "type": "person",
    "position": {
      "x": -18600,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Anita Bhohara",
      "designation": "Section Officer",
      "department": "Grievance Handling Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-058",
    "type": "person",
    "position": {
      "x": -8100,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Dwarika Ojha",
      "designation": "Section Officer",
      "department": "Planing, Monitoring and Evaluation Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-059",
    "type": "person",
    "position": {
      "x": -11100,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Chitra kumari kathayat",
      "designation": "Section Officer",
      "department": "Citizenship and NID Management Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-060",
    "type": "person",
    "position": {
      "x": -18300,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Arun Rai",
      "designation": "Section Officer",
      "department": "Citizenship and NID Management Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-061",
    "type": "person",
    "position": {
      "x": 16500,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Saurav Bashyal",
      "designation": "Section Officer",
      "department": "Peace, Security and Crime Control Section",
      "role": "officer",
      "email": "bashyal.saurav@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-062",
    "type": "person",
    "position": {
      "x": -2700,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Kamal Bahadur Basnet",
      "designation": "Section Officer",
      "department": "Planing, Monitoring and Evaluation Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-063",
    "type": "person",
    "position": {
      "x": -4200,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Jyoti Kumari Bohara",
      "designation": "Section Officer",
      "department": "Grievance Handling Section",
      "role": "officer",
      "email": "rtkumari775@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-064",
    "type": "person",
    "position": {
      "x": 18600,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Tanka Prasad Panthi",
      "designation": "Section Officer",
      "department": "Planing, Monitoring and Evaluation Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-065",
    "type": "person",
    "position": {
      "x": -14700,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Bikram Limbu",
      "designation": "Section Officer",
      "department": "Planing, Monitoring and Evaluation Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-066",
    "type": "person",
    "position": {
      "x": -20100,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "ARJUN SUBEDI",
      "designation": "Section Officer",
      "department": "Relief and Data Management Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-067",
    "type": "person",
    "position": {
      "x": -15900,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Bhim Raj Basnet",
      "designation": "Section Officer",
      "department": "Grievance Handling Section",
      "role": "officer",
      "email": "rajand1974@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-068",
    "type": "person",
    "position": {
      "x": 12000,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Rishiram Upadhyay",
      "designation": "Section Officer",
      "department": "Grievance Handling Section",
      "role": "officer",
      "email": "rishiramu2051@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-069",
    "type": "person",
    "position": {
      "x": 6600,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Prakash Gautam",
      "designation": "Section Officer",
      "department": "Grievance Handling Section",
      "role": "officer",
      "email": "prakashgtm55@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-070",
    "type": "person",
    "position": {
      "x": 16200,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Saroj Subedi",
      "designation": "Account Officer",
      "department": "Account Section",
      "role": "officer",
      "email": "subedi22@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-071",
    "type": "person",
    "position": {
      "x": 4200,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Nirmal Paudel",
      "designation": "Account Officer",
      "department": "Account Section",
      "role": "officer",
      "email": "npkushma1@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-072",
    "type": "person",
    "position": {
      "x": 17100,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Shudarshan Neupane",
      "designation": "Computer Officer",
      "department": "Information & Technology Section",
      "role": "officer",
      "email": "sudarshan.neupane@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-073",
    "type": "person",
    "position": {
      "x": 900,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Madhavi Dhakal Khanal",
      "designation": "Computer Officer",
      "department": "Office Management and Goods Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-074",
    "type": "person",
    "position": {
      "x": 6000,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Prabhat Subash Kharel",
      "designation": "Computer Engineer",
      "department": "Information & Technology Section",
      "role": "staff",
      "email": "subkha3@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-075",
    "type": "person",
    "position": {
      "x": -8700,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Diwos Karki",
      "designation": "Computer Engineer",
      "department": "Information & Technology Section",
      "role": "staff",
      "email": "diwos.karki@moha.gov.np",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-076",
    "type": "person",
    "position": {
      "x": -13200,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Bishal Nemwang",
      "designation": "Law Officer",
      "department": "Legal Decision Administration Section",
      "role": "officer",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-077",
    "type": "person",
    "position": {
      "x": 19200,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Umesh Neupane",
      "designation": "Computer Operator",
      "department": "Account Section",
      "role": "operator",
      "email": "umesh_neupane@hotmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-078",
    "type": "person",
    "position": {
      "x": -1270,
      "y": 240
    },
    "data": {
      "nodeType": "person",
      "fullName": "Lalit Singh Karki",
      "designation": "Computer Operator",
      "department": "Ministry of Home Affairs",
      "role": "operator",
      "email": "karkilalitsingh@yahoo.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-079",
    "type": "person",
    "position": {
      "x": 2100,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Muna Neupane",
      "designation": "Computer Operator",
      "department": "Local Administration and Province Co-Ordination Section",
      "role": "operator",
      "email": "muna.neupane@moha.gov.np",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-080",
    "type": "person",
    "position": {
      "x": -14400,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Binod Kumar Shah",
      "designation": "Computer Operator",
      "department": "Legal Decision Administration Section",
      "role": "operator",
      "email": "sahbinod53@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-081",
    "type": "person",
    "position": {
      "x": -300,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Lakky Sherpa",
      "designation": "Computer Operator",
      "department": "Citizenship and NID Management Section",
      "role": "operator",
      "email": "lakkysherpa@yahoo.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-082",
    "type": "person",
    "position": {
      "x": 5100,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Parash Basnet",
      "designation": "Computer Operator",
      "department": "Information & Technology Section",
      "role": "operator",
      "email": "parashbasnetmoha@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-083",
    "type": "person",
    "position": {
      "x": -4500,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Jivan Kumari Ruchal",
      "designation": "Computer Operator",
      "department": "Relief and Data Management Section",
      "role": "operator",
      "email": "joonaruchal@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-084",
    "type": "person",
    "position": {
      "x": -14100,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Binod Shrestha (Employee of the Month -Baishakh)",
      "designation": "Computer Operator",
      "department": "Personnel Administration Section",
      "role": "operator",
      "email": "binod.shrestha@nepal.gov.np",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-085",
    "type": "person",
    "position": {
      "x": -15600,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Bibek Mishra",
      "designation": "Computer Operator",
      "department": "Office Management and Goods Section",
      "role": "operator",
      "email": "office.mgmt@moha.gov.np",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-086",
    "type": "person",
    "position": {
      "x": 13500,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Sabina Gautam",
      "designation": "Computer Operator",
      "department": "Office Management and Goods Section",
      "role": "operator",
      "email": "gsabinanpj@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-087",
    "type": "person",
    "position": {
      "x": 0,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Laxmi Ramtel",
      "designation": "Computer Operator",
      "department": "Grievance Handling Section",
      "role": "operator",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-088",
    "type": "person",
    "position": {
      "x": 19500,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Yamuna K. C.",
      "designation": "Computer Operator",
      "department": "Planing, Monitoring and Evaluation Section",
      "role": "operator",
      "email": "yamunakc53@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-089",
    "type": "person",
    "position": {
      "x": 18000,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Sumit Dayal",
      "designation": "Computer Operator",
      "department": "Peace, Security and Crime Control Section",
      "role": "operator",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-090",
    "type": "person",
    "position": {
      "x": -9300,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Dipak Kumar Khadka",
      "designation": "Computer Operator",
      "department": "Peace, Security and Crime Control Section",
      "role": "operator",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-091",
    "type": "person",
    "position": {
      "x": -6000,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Hark Raj Bhatt",
      "designation": "Computer Operator",
      "department": "Personnel Administration Section",
      "role": "operator",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-092",
    "type": "person",
    "position": {
      "x": -6300,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Gyanu Thapa Magar",
      "designation": "Computer Operator",
      "department": "Peace, Security and Crime Control Section",
      "role": "operator",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-093",
    "type": "person",
    "position": {
      "x": -6900,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Govinda Dahal",
      "designation": "Computer Operator",
      "department": "Personnel Administration Section",
      "role": "operator",
      "email": "gdahal009@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-094",
    "type": "person",
    "position": {
      "x": 8400,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Raj Kumar Yogi",
      "designation": "Computer Operator",
      "department": "Disaster Study Risk Reduction and Recovery Section",
      "role": "operator",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-095",
    "type": "person",
    "position": {
      "x": 17400,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Shushil kumar singh",
      "designation": "Computer Technicial",
      "department": "Information & Technology Section",
      "role": "staff",
      "email": "sushil.singh2076@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-096",
    "type": "person",
    "position": {
      "x": -1050,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Sarita Rai",
      "designation": "Nayab Subba",
      "department": "Disaster and Conflict Management Division",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-097",
    "type": "person",
    "position": {
      "x": 770,
      "y": 240
    },
    "data": {
      "nodeType": "person",
      "fullName": "Umesh Bhatterai",
      "designation": "Nayab Subba",
      "department": "Ministry of Home Affairs",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-098",
    "type": "person",
    "position": {
      "x": -930,
      "y": 240
    },
    "data": {
      "nodeType": "person",
      "fullName": "Mahadev Thapa",
      "designation": "Nayab Subba",
      "department": "Ministry of Home Affairs",
      "role": "staff",
      "email": "dhaukhani046@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-099",
    "type": "person",
    "position": {
      "x": 15000,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Sanjeev Dhakal",
      "designation": "Nayab Subba",
      "department": "Grievance Handling Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-100",
    "type": "person",
    "position": {
      "x": -6600,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Guru Prasad Pokhrel",
      "designation": "Nayab Subba",
      "department": "Legal Decision Administration Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-101",
    "type": "person",
    "position": {
      "x": -4950,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Anjali Ramtel",
      "designation": "Nayab Subba",
      "department": "Policy, Plan, Monitoring and Evaluation Division",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-102",
    "type": "person",
    "position": {
      "x": 9600,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ram Kumar Lamsal",
      "designation": "Nayab Subba",
      "department": "Internal Administration, Vechical, Meeting and Ceremony Managemnt Section",
      "role": "staff",
      "email": "ramkumar@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-103",
    "type": "person",
    "position": {
      "x": 12900,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Rupa Niraula",
      "designation": "Nayab Subba",
      "department": "Human Rights Promotion Section",
      "role": "staff",
      "email": "niroularupa28@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-104",
    "type": "person",
    "position": {
      "x": 3600,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Nawa Raj Joshi",
      "designation": "Nayab Subba",
      "department": "Personnel Administration Section",
      "role": "staff",
      "email": "nawaraj.joshi@moha.gov.np",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-105",
    "type": "person",
    "position": {
      "x": 300,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Loknath Agasti",
      "designation": "Nayab Subba",
      "department": "Relief and Data Management Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-106",
    "type": "person",
    "position": {
      "x": -22200,
      "y": 480
    },
    "data": {
      "nodeType": "person",
      "fullName": "Sushila Timalsina",
      "designation": "Nayab Subba",
      "department": "Registration Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-107",
    "type": "person",
    "position": {
      "x": 19800,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Yogendra Khatri",
      "designation": "Nayab Subba",
      "department": "Office Management and Goods Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-108",
    "type": "person",
    "position": {
      "x": -5700,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Hemanta Rijal",
      "designation": "Nayab Subba",
      "department": "Disaster Study Risk Reduction and Recovery Section",
      "role": "staff",
      "email": "hrijyal@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-109",
    "type": "person",
    "position": {
      "x": -19800,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Aarati Paudel Thapa",
      "designation": "Nayab Subba",
      "department": "Local Administration and Province Co-Ordination Section",
      "role": "staff",
      "email": "aratithapa641@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-110",
    "type": "person",
    "position": {
      "x": -7800,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Gandiv B.K.",
      "designation": "Nayab Subba",
      "department": "Peace, Security and Crime Control Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-111",
    "type": "person",
    "position": {
      "x": -3600,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Kabiraj Updahaya",
      "designation": "Nayab Subba",
      "department": "Border and Immigration Administration Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-112",
    "type": "person",
    "position": {
      "x": 20700,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "खुबराज श्रेष्ठ",
      "designation": "Nayab Subba",
      "department": "Peace, Security and Crime Control Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-113",
    "type": "person",
    "position": {
      "x": -590,
      "y": 240
    },
    "data": {
      "nodeType": "person",
      "fullName": "SURESH KUMAR JOSHI",
      "designation": "Nayab Subba",
      "department": "Ministry of Home Affairs",
      "role": "staff",
      "email": "sureshjoshi2341@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-114",
    "type": "person",
    "position": {
      "x": -4800,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Janardan Rijal",
      "designation": "Nayab Subba",
      "department": "Border and Immigration Administration Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-115",
    "type": "person",
    "position": {
      "x": -5400,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ishwora Adhikari",
      "designation": "Nayab Subba",
      "department": "Planing, Monitoring and Evaluation Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-116",
    "type": "person",
    "position": {
      "x": -1650,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Rambabu Baral",
      "designation": "Nayab Subba",
      "department": "Security and Coordination Division",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-117",
    "type": "person",
    "position": {
      "x": 9000,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ram Balak Yaday",
      "designation": "Nayab Subba",
      "department": "Peace, Security and Crime Control Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-118",
    "type": "person",
    "position": {
      "x": 8700,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ram Bahadur Karki",
      "designation": "Nayab Subba",
      "department": "Drug Control Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-119",
    "type": "person",
    "position": {
      "x": -2250,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Mamata Ojha",
      "designation": "Nayab Subba",
      "department": "Internal Management Division",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-120",
    "type": "person",
    "position": {
      "x": 1500,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Menuka Chapagain Poudel",
      "designation": "Nayab Subba",
      "department": "Planing, Monitoring and Evaluation Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-121",
    "type": "person",
    "position": {
      "x": -12600,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Bishnu Poudel Ghimire",
      "designation": "Nayab Subba",
      "department": "Citizenship and NID Management Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-122",
    "type": "person",
    "position": {
      "x": 1200,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Manab Babu Thapa",
      "designation": "Nayab Subba",
      "department": "Peace, Security and Crime Control Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-123",
    "type": "person",
    "position": {
      "x": 12600,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Rukmani Gurung",
      "designation": "Nayab Subba",
      "department": "Peace, Security and Crime Control Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-124",
    "type": "person",
    "position": {
      "x": -4350,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Bikram Giri",
      "designation": "Nayab Subba",
      "department": "Administration Division",
      "role": "staff",
      "email": "giribikram2020@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-125",
    "type": "person",
    "position": {
      "x": 20100,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "laxmi kumari sharma",
      "designation": "Nayab Subba",
      "department": "Drug Control Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-126",
    "type": "person",
    "position": {
      "x": 7200,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Prashant Paneru",
      "designation": "Nayab Subba",
      "department": "Border and Immigration Administration Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-127",
    "type": "person",
    "position": {
      "x": 3000,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Narayan Adhikari",
      "designation": "Accoutannt",
      "department": "Account Section",
      "role": "staff",
      "email": "narayanadhikari794@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-128",
    "type": "person",
    "position": {
      "x": -10500,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Devi Dhungana",
      "designation": "Accoutannt",
      "department": "Account Section",
      "role": "staff",
      "email": "acharyadevi37@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-129",
    "type": "person",
    "position": {
      "x": -1200,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Khima Aryal",
      "designation": "Accoutannt",
      "department": "Account Section",
      "role": "staff",
      "email": "khimaaryal_2007@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-130",
    "type": "person",
    "position": {
      "x": 9300,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ram Giri",
      "designation": "Telephone Operator",
      "department": "Office Management and Goods Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-131",
    "type": "person",
    "position": {
      "x": -1610,
      "y": 240
    },
    "data": {
      "nodeType": "person",
      "fullName": "Kamala Lama Syantan",
      "designation": "Office Helper",
      "department": "Ministry of Home Affairs",
      "role": "staff",
      "email": "kamalawaiba2070@yahoo.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-132",
    "type": "person",
    "position": {
      "x": 16800,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Shobha Thapa magar",
      "designation": "Office Helper",
      "department": "Human Rights Promotion Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-133",
    "type": "person",
    "position": {
      "x": -13500,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Birendra Khatiwada",
      "designation": "Office Helper",
      "department": "Personnel Administration Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-134",
    "type": "person",
    "position": {
      "x": -3000,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Kalpana Khadka (Basnet)",
      "designation": "Office Helper",
      "department": "Information & Technology Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-135",
    "type": "person",
    "position": {
      "x": -25200,
      "y": 480
    },
    "data": {
      "nodeType": "person",
      "fullName": "Jay Bahadur Chhetri",
      "designation": "Office Helper",
      "department": "Secretariat of Home Minister",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-136",
    "type": "person",
    "position": {
      "x": -3450,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Jamuna Gyawali",
      "designation": "Office Helper",
      "department": "Administration Division",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-137",
    "type": "person",
    "position": {
      "x": 15900,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Saraswati Dhungana",
      "designation": "Office Helper",
      "department": "Relief and Data Management Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-138",
    "type": "person",
    "position": {
      "x": -8400,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Durga Subedi",
      "designation": "Office Helper",
      "department": "Internal Administration, Vechical, Meeting and Ceremony Managemnt Section",
      "role": "staff",
      "email": "durgasubedi@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-139",
    "type": "person",
    "position": {
      "x": -23400,
      "y": 480
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ramsharan bhujel",
      "designation": "Office Helper",
      "department": "Singadurbar Entrance (South-Gate)",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-140",
    "type": "person",
    "position": {
      "x": 14700,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Sangita Budhathoki",
      "designation": "Office Helper",
      "department": "Border and Immigration Administration Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-141",
    "type": "person",
    "position": {
      "x": 10200,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Rama Devi Baniya",
      "designation": "Office Helper",
      "department": "Account Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-142",
    "type": "person",
    "position": {
      "x": -1950,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Manima Devi KaTharu",
      "designation": "Office Helper",
      "department": "Security and Coordination Division",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-143",
    "type": "person",
    "position": {
      "x": -25500,
      "y": 480
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ishwora Chudal",
      "designation": "Office Helper",
      "department": "Chalani",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-144",
    "type": "person",
    "position": {
      "x": 11400,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ranju Darnal",
      "designation": "Office Helper",
      "department": "Legal Decision Administration Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-145",
    "type": "person",
    "position": {
      "x": -9000,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Dipendra Panta",
      "designation": "Office Helper",
      "department": "Bibhushan Section",
      "role": "staff",
      "email": "dpanta30@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-146",
    "type": "person",
    "position": {
      "x": -2400,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Kamala Poudel",
      "designation": "Office Helper",
      "department": "Peace Promotion Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-147",
    "type": "person",
    "position": {
      "x": -250,
      "y": 240
    },
    "data": {
      "nodeType": "person",
      "fullName": "Shrijana Ranamagar",
      "designation": "Office Helper",
      "department": "Ministry of Home Affairs",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-148",
    "type": "person",
    "position": {
      "x": -23700,
      "y": 480
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ram Sogarath Das",
      "designation": "Office Helper",
      "department": "Registration Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-149",
    "type": "person",
    "position": {
      "x": -23100,
      "y": 480
    },
    "data": {
      "nodeType": "person",
      "fullName": "Santa Bahadur Tamang",
      "designation": "Office Helper",
      "department": "Chalani",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-150",
    "type": "person",
    "position": {
      "x": -22500,
      "y": 480
    },
    "data": {
      "nodeType": "person",
      "fullName": "Sujan Rai",
      "designation": "Office Helper",
      "department": "Chalani",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-151",
    "type": "person",
    "position": {
      "x": 5400,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Parwati Malla",
      "designation": "Office Helper",
      "department": "Planing, Monitoring and Evaluation Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-152",
    "type": "person",
    "position": {
      "x": -17400,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Balbahadur Karki",
      "designation": "Office Helper",
      "department": "Office Management and Goods Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-153",
    "type": "person",
    "position": {
      "x": -25800,
      "y": 480
    },
    "data": {
      "nodeType": "person",
      "fullName": "Buddhi Kumar Shrestha",
      "designation": "Office Helper",
      "department": "Secretariat of Home Minister",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-154",
    "type": "person",
    "position": {
      "x": -3300,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Kalpana Bhattrai",
      "designation": "Office Helper",
      "department": "Account Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-155",
    "type": "person",
    "position": {
      "x": -26100,
      "y": 480
    },
    "data": {
      "nodeType": "person",
      "fullName": "Anita Pandey",
      "designation": "Office Helper",
      "department": "Singadurbar Entrance (South-Gate)",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-156",
    "type": "person",
    "position": {
      "x": -24300,
      "y": 480
    },
    "data": {
      "nodeType": "person",
      "fullName": "Rajan Raj Giri",
      "designation": "Office Helper",
      "department": "Chalani",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-157",
    "type": "person",
    "position": {
      "x": -2290,
      "y": 240
    },
    "data": {
      "nodeType": "person",
      "fullName": "Durga Ram Bhandari",
      "designation": "Office Helper",
      "department": "Ministry of Home Affairs",
      "role": "staff",
      "email": "Durgaji294@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-158",
    "type": "person",
    "position": {
      "x": -13800,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Binu Pujari Tamang",
      "designation": "Office Helper",
      "department": "Office Management and Goods Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-159",
    "type": "person",
    "position": {
      "x": 12300,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Rita Adhikari Gautam",
      "designation": "Office Helper",
      "department": "Police Personnel Administration Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-160",
    "type": "person",
    "position": {
      "x": -7200,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Gayatri Sigdel",
      "designation": "Office Helper",
      "department": "Office Management and Goods Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-161",
    "type": "person",
    "position": {
      "x": -24900,
      "y": 480
    },
    "data": {
      "nodeType": "person",
      "fullName": "Laxmi Silwal",
      "designation": "Office Helper",
      "department": "Registration Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-162",
    "type": "person",
    "position": {
      "x": -22800,
      "y": 480
    },
    "data": {
      "nodeType": "person",
      "fullName": "Shamsher Gurung",
      "designation": "Office Helper",
      "department": "Secretariat of Home Minister",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-163",
    "type": "person",
    "position": {
      "x": -24600,
      "y": 480
    },
    "data": {
      "nodeType": "person",
      "fullName": "Nirmala Bhandari",
      "designation": "Office Helper",
      "department": "Registration Section",
      "role": "staff",
      "email": "bhandarinirmala234@gmail.com",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-164",
    "type": "person",
    "position": {
      "x": 4500,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Nirmala Parajuli",
      "designation": "Office Helper",
      "department": "Grievance Handling Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-165",
    "type": "person",
    "position": {
      "x": -24000,
      "y": 480
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ram Kumar Basnet",
      "designation": "Office Helper",
      "department": "Secretariat of Secretary",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-166",
    "type": "person",
    "position": {
      "x": -3750,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Gita Timalsena",
      "designation": "Office Helper",
      "department": "Legal Division",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-167",
    "type": "person",
    "position": {
      "x": -150,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Sushila Pathak",
      "designation": "Office Helper",
      "department": "Policy, Plan, Monitoring and Evaluation Division",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-168",
    "type": "person",
    "position": {
      "x": -11400,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Chandra Bahadur Khatri",
      "designation": "Office Helper",
      "department": "Disaster Study Risk Reduction and Recovery Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-169",
    "type": "person",
    "position": {
      "x": -4050,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Gayatri Thapa Magar",
      "designation": "Office Helper",
      "department": "Disaster and Conflict Management Division",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-170",
    "type": "person",
    "position": {
      "x": -4650,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Bhagirathi Bhat",
      "designation": "Office Helper",
      "department": "Internal Management Division",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-171",
    "type": "person",
    "position": {
      "x": -19200,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Ambika Nepal Paudel",
      "designation": "Office Helper",
      "department": "Relief and Data Management Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-172",
    "type": "person",
    "position": {
      "x": 6900,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Pramila Khatri",
      "designation": "Office Helper",
      "department": "Local Administration and Province Co-Ordination Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-173",
    "type": "person",
    "position": {
      "x": -2850,
      "y": 960
    },
    "data": {
      "nodeType": "person",
      "fullName": "Kopila Bhujel",
      "designation": "Office Helper",
      "department": "Security and Coordination Division",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-174",
    "type": "person",
    "position": {
      "x": 2700,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Nabin Shrestha",
      "designation": "Office Helper",
      "department": "Peace, Security and Crime Control Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-175",
    "type": "person",
    "position": {
      "x": 13800,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Salma Kapali Suchikar",
      "designation": "Jhadu Badaru",
      "department": "Office Management and Goods Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-176",
    "type": "person",
    "position": {
      "x": -11700,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Chandeswori Kapali",
      "designation": "Jhadu Badaru",
      "department": "Office Management and Goods Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-177",
    "type": "person",
    "position": {
      "x": 15600,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Sanumaiya kapali",
      "designation": "Jhadu Badaru",
      "department": "Office Management and Goods Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-178",
    "type": "person",
    "position": {
      "x": 11700,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Rijesh Nepali",
      "designation": "Jhadu Badaru",
      "department": "Office Management and Goods Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-179",
    "type": "person",
    "position": {
      "x": -9900,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Dineswori Kapali",
      "designation": "Jhadu Badaru",
      "department": "Office Management and Goods Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-180",
    "type": "person",
    "position": {
      "x": -15300,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Bibek Pujari",
      "designation": "Jhadu Badaru",
      "department": "Office Management and Goods Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-181",
    "type": "person",
    "position": {
      "x": -3900,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Kaamana Bhandari",
      "designation": "Armed Police Attendant",
      "department": "Peace, Security and Crime Control Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-182",
    "type": "person",
    "position": {
      "x": -17100,
      "y": 1200
    },
    "data": {
      "nodeType": "person",
      "fullName": "Bandana Bhujel",
      "designation": "Armed Police Attendant",
      "department": "Peace, Security and Crime Control Section",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "person-183",
    "type": "person",
    "position": {
      "x": 430,
      "y": 240
    },
    "data": {
      "nodeType": "person",
      "fullName": "Tankanath Gautam",
      "designation": "Chalani",
      "department": "Ministry of Home Affairs",
      "role": "staff",
      "email": "",
      "status": "active",
      "activeTasks": 0
    }
  },
  {
    "id": "subordinate-central-agencies",
    "type": "department",
    "position": {
      "x": 3490,
      "y": 240
    },
    "data": {
      "nodeType": "department",
      "name": "Central Subordinate Agencies",
      "deptType": "office_group",
      "head": "",
      "parentName": "Ministry of Home Affairs",
      "peopleCount": 0,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "office-department-of-national-id-and-civil-registration",
    "type": "org",
    "position": {
      "x": 2100,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Department of National ID and Civil Registration",
      "orgType": "central_agency",
      "description": "Central Agency under Ministry of Home Affairs, Nepal.",
      "location": "Nepal",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "office-nepal-police",
    "type": "org",
    "position": {
      "x": 27000,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Nepal Police",
      "orgType": "central_agency",
      "description": "Central Agency under Ministry of Home Affairs, Nepal.",
      "location": "Nepal",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "office-armed-police-force-nepal",
    "type": "org",
    "position": {
      "x": -300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Armed Police Force, Nepal",
      "orgType": "central_agency",
      "description": "Central Agency under Ministry of Home Affairs, Nepal.",
      "location": "Nepal",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "office-nepal-immigration",
    "type": "org",
    "position": {
      "x": 26700,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Nepal Immigration",
      "orgType": "central_agency",
      "description": "Central Agency under Ministry of Home Affairs, Nepal.",
      "location": "Nepal",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "office-department-of-prison-management",
    "type": "org",
    "position": {
      "x": 2400,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Department of Prison Management",
      "orgType": "central_agency",
      "description": "Central Agency under Ministry of Home Affairs, Nepal.",
      "location": "Nepal",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "office-department-for-management-of-proceeds-crime",
    "type": "org",
    "position": {
      "x": 1800,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Department for Management of Proceeds Crime",
      "orgType": "central_agency",
      "description": "Central Agency under Ministry of Home Affairs, Nepal.",
      "location": "Nepal",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "office-secretariat-of-nepal-hajj-committee",
    "type": "org",
    "position": {
      "x": 27300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Secretariat of Nepal Hajj Committee",
      "orgType": "central_agency",
      "description": "Central Agency under Ministry of Home Affairs, Nepal.",
      "location": "Nepal",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "office-national-emergency-operation-center",
    "type": "org",
    "position": {
      "x": 26400,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "National Emergency Operation Center",
      "orgType": "central_agency",
      "description": "Central Agency under Ministry of Home Affairs, Nepal.",
      "location": "Nepal",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "office-national-disaster-risk-reduction-management-authority",
    "type": "org",
    "position": {
      "x": 26100,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "National Disaster Risk Reduction Management Authority",
      "orgType": "central_agency",
      "description": "Central Agency under Ministry of Home Affairs, Nepal.",
      "location": "Nepal",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "district-administration-offices",
    "type": "department",
    "position": {
      "x": 3830,
      "y": 240
    },
    "data": {
      "nodeType": "department",
      "name": "District Administration Offices",
      "deptType": "office_group",
      "head": "",
      "parentName": "Ministry of Home Affairs",
      "peopleCount": 0,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "dao-taplejung",
    "type": "org",
    "position": {
      "x": 24900,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Taplejung",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Taplejung",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-panchthar",
    "type": "org",
    "position": {
      "x": 18000,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Panchthar",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Panchthar",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-ilaam",
    "type": "org",
    "position": {
      "x": 10200,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Ilaam",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Ilaam",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-jhapa",
    "type": "org",
    "position": {
      "x": 10800,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Jhapa",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Jhapa",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-morang",
    "type": "org",
    "position": {
      "x": 15300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Morang",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Morang",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-sunsari",
    "type": "org",
    "position": {
      "x": 23700,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Sunsari",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Sunsari",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-dhankuta",
    "type": "org",
    "position": {
      "x": 7800,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Dhankuta",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Dhankuta",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-terhathum",
    "type": "org",
    "position": {
      "x": 25200,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Terhathum",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Terhathum",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-bhojpur",
    "type": "org",
    "position": {
      "x": 5700,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Bhojpur",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Bhojpur",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-sankhuwasava",
    "type": "org",
    "position": {
      "x": 21600,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Sankhuwasava",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Sankhuwasava",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-solukhumbu",
    "type": "org",
    "position": {
      "x": 23400,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Solukhumbu",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Solukhumbu",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-khotang",
    "type": "org",
    "position": {
      "x": 13500,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Khotang",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Khotang",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-okhaldhunga",
    "type": "org",
    "position": {
      "x": 17400,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Okhaldhunga",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Okhaldhunga",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-udayapur",
    "type": "org",
    "position": {
      "x": 25500,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Udayapur",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Udayapur",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-siraha",
    "type": "org",
    "position": {
      "x": 23100,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Siraha",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Siraha",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-saptari",
    "type": "org",
    "position": {
      "x": 21900,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Saptari",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Saptari",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-dhanusha",
    "type": "org",
    "position": {
      "x": 8100,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Dhanusha",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Dhanusha",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-mahottari",
    "type": "org",
    "position": {
      "x": 14400,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Mahottari",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Mahottari",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-sarlahi",
    "type": "org",
    "position": {
      "x": 22200,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Sarlahi",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Sarlahi",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-sindhuli",
    "type": "org",
    "position": {
      "x": 22500,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Sindhuli",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Sindhuli",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-ramechhap",
    "type": "org",
    "position": {
      "x": 19200,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Ramechhap",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Ramechhap",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-dolakha",
    "type": "org",
    "position": {
      "x": 8400,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Dolakha",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Dolakha",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-rasuwa",
    "type": "org",
    "position": {
      "x": 19500,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Rasuwa",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Rasuwa",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-sindhupalchok",
    "type": "org",
    "position": {
      "x": 22800,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Sindhupalchok",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Sindhupalchok",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-nuwakot",
    "type": "org",
    "position": {
      "x": 17100,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Nuwakot",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Nuwakot",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-dhading",
    "type": "org",
    "position": {
      "x": 7500,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Dhading",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Dhading",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-kathmandu",
    "type": "org",
    "position": {
      "x": 12900,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Kathmandu",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Kathmandu",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-lalitpur",
    "type": "org",
    "position": {
      "x": 13800,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Lalitpur",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Lalitpur",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-bhaktapur",
    "type": "org",
    "position": {
      "x": 5400,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Bhaktapur",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Bhaktapur",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-kavrepalanchok",
    "type": "org",
    "position": {
      "x": 13200,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Kavrepalanchok",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Kavrepalanchok",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-makawanpur",
    "type": "org",
    "position": {
      "x": 14700,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Makawanpur",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Makawanpur",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-rautahat",
    "type": "org",
    "position": {
      "x": 19800,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Rautahat",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Rautahat",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-bara",
    "type": "org",
    "position": {
      "x": 4800,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Bara",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Bara",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-parsa",
    "type": "org",
    "position": {
      "x": 18600,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Parsa",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Parsa",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-chitwan",
    "type": "org",
    "position": {
      "x": 6000,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Chitwan",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Chitwan",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-nawalparasi-bardhghat-susta-east",
    "type": "org",
    "position": {
      "x": 16800,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Nawalparasi (Bardhghat Susta East)",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Nawalparasi (Bardhghat Susta East)",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-rupandehi",
    "type": "org",
    "position": {
      "x": 21000,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Rupandehi",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Rupandehi",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-kapilvastu",
    "type": "org",
    "position": {
      "x": 12300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Kapilvastu",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Kapilvastu",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-palpa",
    "type": "org",
    "position": {
      "x": 17700,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Palpa",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Palpa",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-arghakhanchi",
    "type": "org",
    "position": {
      "x": 3000,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Arghakhanchi",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Arghakhanchi",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-gulmi",
    "type": "org",
    "position": {
      "x": 9600,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Gulmi",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Gulmi",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-syangja",
    "type": "org",
    "position": {
      "x": 24300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Syangja",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Syangja",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-tanahun",
    "type": "org",
    "position": {
      "x": 24600,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Tanahun",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Tanahun",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-gorkha",
    "type": "org",
    "position": {
      "x": 9300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Gorkha",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Gorkha",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-lamjung",
    "type": "org",
    "position": {
      "x": 14100,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Lamjung",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Lamjung",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-kaski",
    "type": "org",
    "position": {
      "x": 12600,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Kaski",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Kaski",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-manang",
    "type": "org",
    "position": {
      "x": 15000,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Manang",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Manang",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-mustang",
    "type": "org",
    "position": {
      "x": 15900,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Mustang",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Mustang",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-myagdi",
    "type": "org",
    "position": {
      "x": 16200,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Myagdi",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Myagdi",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-baglung",
    "type": "org",
    "position": {
      "x": 3300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Baglung",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Baglung",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-parbat",
    "type": "org",
    "position": {
      "x": 18300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Parbat",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Parbat",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-dang",
    "type": "org",
    "position": {
      "x": 6900,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Dang",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Dang",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-pyuthan",
    "type": "org",
    "position": {
      "x": 18900,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Pyuthan",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Pyuthan",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-rolpa",
    "type": "org",
    "position": {
      "x": 20100,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Rolpa",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Rolpa",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-salyan",
    "type": "org",
    "position": {
      "x": 21300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Salyan",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Salyan",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-rukum-east-part",
    "type": "org",
    "position": {
      "x": 20400,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Rukum (East Part)",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Rukum (East Part)",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-dolpa",
    "type": "org",
    "position": {
      "x": 8700,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Dolpa",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Dolpa",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-mugu",
    "type": "org",
    "position": {
      "x": 15600,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Mugu",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Mugu",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-humla",
    "type": "org",
    "position": {
      "x": 9900,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Humla",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Humla",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-jumla",
    "type": "org",
    "position": {
      "x": 11100,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Jumla",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Jumla",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-kalikot",
    "type": "org",
    "position": {
      "x": 11700,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Kalikot",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Kalikot",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-jajarkot",
    "type": "org",
    "position": {
      "x": 10500,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Jajarkot",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Jajarkot",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-dailekh",
    "type": "org",
    "position": {
      "x": 6600,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Dailekh",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Dailekh",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-surkhet",
    "type": "org",
    "position": {
      "x": 24000,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Surkhet",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Surkhet",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-bardiya",
    "type": "org",
    "position": {
      "x": 5100,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Bardiya",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Bardiya",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-banke",
    "type": "org",
    "position": {
      "x": 4500,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Banke",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Banke",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-kailali",
    "type": "org",
    "position": {
      "x": 11400,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Kailali",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Kailali",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-doti",
    "type": "org",
    "position": {
      "x": 9000,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Doti",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Doti",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-achhaam",
    "type": "org",
    "position": {
      "x": 2700,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Achhaam",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Achhaam",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-bajura",
    "type": "org",
    "position": {
      "x": 4200,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Bajura",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Bajura",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-bajhang",
    "type": "org",
    "position": {
      "x": 3900,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Bajhang",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Bajhang",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-darchula",
    "type": "org",
    "position": {
      "x": 7200,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Darchula",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Darchula",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-baitadi",
    "type": "org",
    "position": {
      "x": 3600,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Baitadi",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Baitadi",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-dadeldhura",
    "type": "org",
    "position": {
      "x": 6300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Dadeldhura",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Dadeldhura",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-kanchanpur",
    "type": "org",
    "position": {
      "x": 12000,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Kanchanpur",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Kanchanpur",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-nawalparasi-bardaghat-susta-west",
    "type": "org",
    "position": {
      "x": 16500,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Nawalparasi (Bardaghat Susta West)",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Nawalparasi (Bardaghat Susta West)",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "dao-rukum-west-part",
    "type": "org",
    "position": {
      "x": 20700,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "District Administration Office, Rukum (West Part)",
      "orgType": "district_administration_office",
      "description": "District Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Rukum (West Part)",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "area-administration-offices",
    "type": "department",
    "position": {
      "x": 2810,
      "y": 240
    },
    "data": {
      "nodeType": "department",
      "name": "Area Administration Offices",
      "deptType": "office_group",
      "head": "",
      "parentName": "Ministry of Home Affairs",
      "peopleCount": 0,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "aao-area-administration-office-taplejung-sirijangha",
    "type": "org",
    "position": {
      "x": -2700,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Taplejung, Sirijangha",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Sirijangha",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-rabi",
    "type": "org",
    "position": {
      "x": -8100,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Rabi",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Rabi",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-mangalbare-illam",
    "type": "org",
    "position": {
      "x": -9300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Mangalbare, Illam",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Illam",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-gauriganj-jhapa",
    "type": "org",
    "position": {
      "x": -16200,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Gauriganj, Jhapa",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Jhapa",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-rangeli-morang",
    "type": "org",
    "position": {
      "x": -6900,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Rangeli, Morang",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Morang",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-urlabari-morang",
    "type": "org",
    "position": {
      "x": -1200,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Urlabari, Morang",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Morang",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-dharan-sunsari",
    "type": "org",
    "position": {
      "x": -17400,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Dharan, Sunsari",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Sunsari",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-harinagara-sunsari",
    "type": "org",
    "position": {
      "x": -15000,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Harinagara, Sunsari",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Sunsari",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-rajarani-dhankuta",
    "type": "org",
    "position": {
      "x": -21600,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office Rajarani, Dhankuta",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Dhankuta",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-sankrantibazar-terhathum",
    "type": "org",
    "position": {
      "x": -6300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Sankrantibazar, Terhathum",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Terhathum",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-dingla-bhojpur",
    "type": "org",
    "position": {
      "x": -17100,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Dingla, Bhojpur",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Bhojpur",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-chainpur-sankhuwasava",
    "type": "org",
    "position": {
      "x": -21900,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office Chainpur, Sankhuwasava",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Sankhuwasava",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-sotang-solukhumbu",
    "type": "org",
    "position": {
      "x": -3600,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Sotang, Solukhumbu",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Solukhumbu",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-khotangbazar-khotang",
    "type": "org",
    "position": {
      "x": -12300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Khotangbazar, Khotang",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Khotang",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-ainselukharka-khotang",
    "type": "org",
    "position": {
      "x": -21300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Ainselukharka, Khotang",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Khotang",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-khijiphalante-okhaldhunga",
    "type": "org",
    "position": {
      "x": -12600,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Khijiphalante, Okhaldhunga",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Okhaldhunga",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-katari-udayapur",
    "type": "org",
    "position": {
      "x": -12900,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Katari, Udayapur",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Udayapur",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-lahan-siraha",
    "type": "org",
    "position": {
      "x": -11400,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Lahan, Siraha",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Siraha",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-bodebarsayan-saptari",
    "type": "org",
    "position": {
      "x": -19200,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Bodebarsayan, Saptari",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Saptari",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-kanchanpur-saptari",
    "type": "org",
    "position": {
      "x": -13200,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Kanchanpur, Saptari",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Saptari",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-yadukuwa-dhanusha",
    "type": "org",
    "position": {
      "x": -600,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Yadukuwa, Dhanusha",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Dhanusha",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-ramgopalpur-mahottari",
    "type": "org",
    "position": {
      "x": -7500,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Ramgopalpur, Mahottari",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Mahottari",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-bardibas-mahottari",
    "type": "org",
    "position": {
      "x": -20100,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Bardibas, Mahottari",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Mahottari",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-gaushala-mahottari",
    "type": "org",
    "position": {
      "x": -15900,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Gaushala, Mahottari",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Mahottari",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-barhathwa-sarlahi",
    "type": "org",
    "position": {
      "x": -19800,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Barhathwa, Sarlahi",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Sarlahi",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-hariwon-sarlahi",
    "type": "org",
    "position": {
      "x": -14700,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Hariwon, Sarlahi",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Sarlahi",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-lapchanepriti-ramechhap",
    "type": "org",
    "position": {
      "x": -10800,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Lapchanepriti, Ramechhap",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Ramechhap",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-singatibazar-dolakha",
    "type": "org",
    "position": {
      "x": -4500,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Singatibazar, Dolakha",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Dolakha",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-satbise-nuwakot",
    "type": "org",
    "position": {
      "x": -5700,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Satbise, Nuwakot",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Nuwakot",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-sankhu-kathmandu",
    "type": "org",
    "position": {
      "x": -6600,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Sankhu, Kathmandu",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Kathmandu",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-pharping-kathmandu",
    "type": "org",
    "position": {
      "x": -8400,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Pharping, Kathmandu",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Kathmandu",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-gotikhel-lalitpur",
    "type": "org",
    "position": {
      "x": -15300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Gotikhel, Lalitpur",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Lalitpur",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-banakhuchaur-kavrepalanchowk",
    "type": "org",
    "position": {
      "x": -20700,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Banakhuchaur, Kavrepalanchowk",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Kavrepalanchowk",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-garuda-rautahat",
    "type": "org",
    "position": {
      "x": -16500,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Garuda, Rautahat",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Rautahat",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-chandranighapur-rautahat",
    "type": "org",
    "position": {
      "x": -18300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Chandranighapur, Rautahat",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Rautahat",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-kolbi-bara",
    "type": "org",
    "position": {
      "x": -11700,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Kolbi, Bara",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Bara",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-simraoungadh-bara",
    "type": "org",
    "position": {
      "x": -4800,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Simraoungadh, Bara",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Bara",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-simara-bara",
    "type": "org",
    "position": {
      "x": -5100,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Simara, Bara",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Bara",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-supouli-parsa",
    "type": "org",
    "position": {
      "x": -3000,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Supouli, Parsa",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Parsa",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-madi-chitwan",
    "type": "org",
    "position": {
      "x": -9900,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Madi, Chitwan",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Chitwan",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-majhgawa-rupandehi",
    "type": "org",
    "position": {
      "x": -9600,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Majhgawa, Rupandehi",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Rupandehi",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-butwal-rupandehi",
    "type": "org",
    "position": {
      "x": -18600,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Butwal, Rupandehi",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Rupandehi",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-chandrauta-kapilvastu",
    "type": "org",
    "position": {
      "x": -18000,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Chandrauta, Kapilvastu",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Kapilvastu",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-banganga-kapilvastu",
    "type": "org",
    "position": {
      "x": -20400,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Banganga, Kapilvastu",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Kapilvastu",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-rampur-palpa",
    "type": "org",
    "position": {
      "x": -7200,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Rampur, Palpa",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Palpa",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-waling-syangja",
    "type": "org",
    "position": {
      "x": -900,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Waling, Syangja",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Syangja",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-sirdibas-gorkha",
    "type": "org",
    "position": {
      "x": -4200,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Sirdibas, Gorkha",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Gorkha",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-lekhnath-kaski",
    "type": "org",
    "position": {
      "x": -10500,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Lekhnath, Kaski",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Kaski",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-lo-manthang-mustang",
    "type": "org",
    "position": {
      "x": -10200,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Lo Manthang, Mustang",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Mustang",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-burtibang-baglung",
    "type": "org",
    "position": {
      "x": -18900,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Burtibang, Baglung",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Baglung",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-huwas-parbat",
    "type": "org",
    "position": {
      "x": -14400,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Huwas, Parbat",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Parbat",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-tulsipur-dang",
    "type": "org",
    "position": {
      "x": -1500,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Tulsipur, Dang",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Dang",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-lamahi-dang",
    "type": "org",
    "position": {
      "x": -11100,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Lamahi, Dang",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Dang",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-jaspur-pyuthan",
    "type": "org",
    "position": {
      "x": -13800,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Jaspur, Pyuthan",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Pyuthan",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-ghartigaun-rolpa",
    "type": "org",
    "position": {
      "x": -15600,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Ghartigaun, Rolpa",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Rolpa",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-tharmare-salyan",
    "type": "org",
    "position": {
      "x": -2400,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Tharmare, Salyan",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Salyan",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-ilanarku-dolpa",
    "type": "org",
    "position": {
      "x": -14100,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Ilanarku, Dolpa",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Dolpa",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-sorukot-mugu",
    "type": "org",
    "position": {
      "x": -3900,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Sorukot, Mugu",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Mugu",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-sarkegad-humla",
    "type": "org",
    "position": {
      "x": -6000,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Sarkegad, Humla",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Humla",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-narakot-jumla",
    "type": "org",
    "position": {
      "x": -8700,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Narakot, Jumla",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Jumla",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-dullu-dailekh",
    "type": "org",
    "position": {
      "x": -16800,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Dullu, Dailekh",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Dailekh",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-babiyachour-surkhet",
    "type": "org",
    "position": {
      "x": -21000,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Babiyachour, Surkhet",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Surkhet",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-mehelkuna-surkhet",
    "type": "org",
    "position": {
      "x": -9000,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Mehelkuna, Surkhet",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Surkhet",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-rajapur-bardiya",
    "type": "org",
    "position": {
      "x": -7800,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Rajapur, Bardiya",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Bardiya",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-basgadhi-bardiya",
    "type": "org",
    "position": {
      "x": -19500,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Basgadhi, Bardiya",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Bardiya",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-kohalpur-banke",
    "type": "org",
    "position": {
      "x": -12000,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Kohalpur, Banke",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Banke",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-sukhad-kailali",
    "type": "org",
    "position": {
      "x": -3300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Sukhad, Kailali",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Kailali",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-tikapur-kailali",
    "type": "org",
    "position": {
      "x": -2100,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Tikapur, Kailali",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Kailali",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-jogbudha-dadeldhura",
    "type": "org",
    "position": {
      "x": -13500,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Jogbudha, Dadeldhura",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Dadeldhura",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-tribhuwanbasti-kanchanpur",
    "type": "org",
    "position": {
      "x": -1800,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Tribhuwanbasti, Kanchanpur",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Kanchanpur",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-semari-nawalparasi-west",
    "type": "org",
    "position": {
      "x": -5400,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Semari, Nawalparasi West",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Nawalparasi West",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "aao-area-administration-office-chaurjahari-rukum-west",
    "type": "org",
    "position": {
      "x": -17700,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Area Administration Office, Chaurjahari, Rukum-West",
      "orgType": "area_administration_office",
      "description": "Area Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Rukum-West",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "border-administration-offices",
    "type": "department",
    "position": {
      "x": 3150,
      "y": 240
    },
    "data": {
      "nodeType": "department",
      "name": "Border / Immigration Administration Offices",
      "deptType": "office_group",
      "head": "",
      "parentName": "Ministry of Home Affairs",
      "peopleCount": 0,
      "activeTasks": 0,
      "completedTasks": 0,
      "status": "active"
    }
  },
  {
    "id": "bao-border-administration-office-olanchungola-taplejung",
    "type": "org",
    "position": {
      "x": 1500,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Border Administration Office, Olanchungola, Taplejung",
      "orgType": "border_or_immigration_administration_office",
      "description": "Border Or Immigration Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Taplejung",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "bao-border-administration-office-chyanthyapu-panchthar",
    "type": "org",
    "position": {
      "x": 300,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Border Administration Office, Chyanthyapu, Panchthar",
      "orgType": "border_or_immigration_administration_office",
      "description": "Border Or Immigration Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Panchthar",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "bao-immigration-and-border-administration-office-pashupatinagar-ilam",
    "type": "org",
    "position": {
      "x": 25800,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Immigration and Border Administration Office, Pashupatinagar, Ilam",
      "orgType": "border_or_immigration_administration_office",
      "description": "Border Or Immigration Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Ilam",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "bao-border-administration-office-hatiyagola-sankhuwasava",
    "type": "org",
    "position": {
      "x": 600,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Border Administration Office, Hatiyagola, Sankhuwasava",
      "orgType": "border_or_immigration_administration_office",
      "description": "Border Or Immigration Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Sankhuwasava",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "bao-border-administration-office-namche-solukhumbu",
    "type": "org",
    "position": {
      "x": 1200,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Border Administration Office, Namche, Solukhumbu",
      "orgType": "border_or_immigration_administration_office",
      "description": "Border Or Immigration Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Solukhumbu",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "bao-border-administration-office-lamabagar-dolakha",
    "type": "org",
    "position": {
      "x": 900,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Border Administration Office, Lamabagar, Dolakha",
      "orgType": "border_or_immigration_administration_office",
      "description": "Border Or Immigration Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Dolakha",
      "status": "active",
      "headCount": 0
    }
  },
  {
    "id": "bao-border-administration-office-byashchagaru-darchula",
    "type": "org",
    "position": {
      "x": 0,
      "y": 480
    },
    "data": {
      "nodeType": "org",
      "name": "Border Administration Office, Byashchagaru, Darchula",
      "orgType": "border_or_immigration_administration_office",
      "description": "Border Or Immigration Administration Office under Ministry of Home Affairs, Nepal.",
      "location": "Darchula",
      "status": "active",
      "headCount": 0
    }
  }
];

export const DUMMY_EDGES: OrgFlowEdge[] = [
  {
    "id": "e-moha-home-minister",
    "source": "moha",
    "target": "home-minister"
  },
  {
    "id": "e-home-minister-home-secretary",
    "source": "home-minister",
    "target": "home-secretary"
  },
  {
    "id": "e-home-secretary-division-security-and-coordination-division",
    "source": "home-secretary",
    "target": "division-security-and-coordination-division"
  },
  {
    "id": "e-division-security-and-coordination-division-section-peace-security-and-crime-control-section",
    "source": "division-security-and-coordination-division",
    "target": "section-peace-security-and-crime-control-section"
  },
  {
    "id": "e-division-security-and-coordination-division-section-border-and-immigration-administration-section",
    "source": "division-security-and-coordination-division",
    "target": "section-border-and-immigration-administration-section"
  },
  {
    "id": "e-division-security-and-coordination-division-section-local-administration-and-province-co-ordination-section",
    "source": "division-security-and-coordination-division",
    "target": "section-local-administration-and-province-co-ordination-section"
  },
  {
    "id": "e-division-security-and-coordination-division-section-hello-moha-complaint-handling-desk",
    "source": "division-security-and-coordination-division",
    "target": "section-hello-moha-complaint-handling-desk"
  },
  {
    "id": "e-division-security-and-coordination-division-section-information-coordination-and-analysis-unit",
    "source": "division-security-and-coordination-division",
    "target": "section-information-coordination-and-analysis-unit"
  },
  {
    "id": "e-home-secretary-division-policy-plan-monitoring-and-evaluation-division",
    "source": "home-secretary",
    "target": "division-policy-plan-monitoring-and-evaluation-division"
  },
  {
    "id": "e-division-policy-plan-monitoring-and-evaluation-division-section-drug-control-section",
    "source": "division-policy-plan-monitoring-and-evaluation-division",
    "target": "section-drug-control-section"
  },
  {
    "id": "e-division-policy-plan-monitoring-and-evaluation-division-section-planing-monitoring-and-evaluation-section",
    "source": "division-policy-plan-monitoring-and-evaluation-division",
    "target": "section-planing-monitoring-and-evaluation-section"
  },
  {
    "id": "e-division-policy-plan-monitoring-and-evaluation-division-section-citizenship-and-nid-management-section",
    "source": "division-policy-plan-monitoring-and-evaluation-division",
    "target": "section-citizenship-and-nid-management-section"
  },
  {
    "id": "e-home-secretary-division-administration-division",
    "source": "home-secretary",
    "target": "division-administration-division"
  },
  {
    "id": "e-division-administration-division-section-information-and-technology-section",
    "source": "division-administration-division",
    "target": "section-information-and-technology-section"
  },
  {
    "id": "e-division-administration-division-section-grievance-handling-section",
    "source": "division-administration-division",
    "target": "section-grievance-handling-section"
  },
  {
    "id": "e-division-administration-division-section-personnel-administration-section",
    "source": "division-administration-division",
    "target": "section-personnel-administration-section"
  },
  {
    "id": "e-division-administration-division-section-police-personnel-administration-section",
    "source": "division-administration-division",
    "target": "section-police-personnel-administration-section"
  },
  {
    "id": "e-home-secretary-division-internal-management-division",
    "source": "home-secretary",
    "target": "division-internal-management-division"
  },
  {
    "id": "e-division-internal-management-division-section-office-management-and-goods-section",
    "source": "division-internal-management-division",
    "target": "section-office-management-and-goods-section"
  },
  {
    "id": "e-division-internal-management-division-section-internal-administration-vechical-meeting-and-ceremony-managemnt-section",
    "source": "division-internal-management-division",
    "target": "section-internal-administration-vechical-meeting-and-ceremony-managemnt-section"
  },
  {
    "id": "e-division-internal-management-division-section-bibhushan-section",
    "source": "division-internal-management-division",
    "target": "section-bibhushan-section"
  },
  {
    "id": "e-division-internal-management-division-section-account-section",
    "source": "division-internal-management-division",
    "target": "section-account-section"
  },
  {
    "id": "e-home-secretary-division-disaster-and-conflict-management-division",
    "source": "home-secretary",
    "target": "division-disaster-and-conflict-management-division"
  },
  {
    "id": "e-division-disaster-and-conflict-management-division-section-peace-promotion-section",
    "source": "division-disaster-and-conflict-management-division",
    "target": "section-peace-promotion-section"
  },
  {
    "id": "e-division-disaster-and-conflict-management-division-section-relief-and-data-management-section",
    "source": "division-disaster-and-conflict-management-division",
    "target": "section-relief-and-data-management-section"
  },
  {
    "id": "e-division-disaster-and-conflict-management-division-section-disaster-study-risk-reduction-and-recovery-section",
    "source": "division-disaster-and-conflict-management-division",
    "target": "section-disaster-study-risk-reduction-and-recovery-section"
  },
  {
    "id": "e-division-disaster-and-conflict-management-division-section-disaster-preparedness-and-response-section-neoc",
    "source": "division-disaster-and-conflict-management-division",
    "target": "section-disaster-preparedness-and-response-section-neoc"
  },
  {
    "id": "e-home-secretary-division-legal-division",
    "source": "home-secretary",
    "target": "division-legal-division"
  },
  {
    "id": "e-division-legal-division-section-human-rights-promotion-section",
    "source": "division-legal-division",
    "target": "section-human-rights-promotion-section"
  },
  {
    "id": "e-division-legal-division-section-legal-decision-administration-section",
    "source": "division-legal-division",
    "target": "section-legal-decision-administration-section"
  },
  {
    "id": "e-moha-unit-chalani",
    "source": "moha",
    "target": "unit-chalani"
  },
  {
    "id": "e-moha-unit-registration-section",
    "source": "moha",
    "target": "unit-registration-section"
  },
  {
    "id": "e-moha-unit-secretariat-of-home-minister",
    "source": "moha",
    "target": "unit-secretariat-of-home-minister"
  },
  {
    "id": "e-moha-unit-secretariat-of-secretary",
    "source": "moha",
    "target": "unit-secretariat-of-secretary"
  },
  {
    "id": "e-moha-unit-singadurbar-entrance-south-gate",
    "source": "moha",
    "target": "unit-singadurbar-entrance-south-gate"
  },
  {
    "id": "e-home-secretary-person-001",
    "source": "home-secretary",
    "target": "person-001"
  },
  {
    "id": "e-division-security-and-coordination-division-person-002",
    "source": "division-security-and-coordination-division",
    "target": "person-002"
  },
  {
    "id": "e-division-policy-plan-monitoring-and-evaluation-division-person-003",
    "source": "division-policy-plan-monitoring-and-evaluation-division",
    "target": "person-003"
  },
  {
    "id": "e-division-internal-management-division-person-004",
    "source": "division-internal-management-division",
    "target": "person-004"
  },
  {
    "id": "e-division-disaster-and-conflict-management-division-person-005",
    "source": "division-disaster-and-conflict-management-division",
    "target": "person-005"
  },
  {
    "id": "e-division-administration-division-person-006",
    "source": "division-administration-division",
    "target": "person-006"
  },
  {
    "id": "e-division-legal-division-person-007",
    "source": "division-legal-division",
    "target": "person-007"
  },
  {
    "id": "e-section-disaster-study-risk-reduction-and-recovery-section-person-008",
    "source": "section-disaster-study-risk-reduction-and-recovery-section",
    "target": "person-008"
  },
  {
    "id": "e-moha-person-009",
    "source": "moha",
    "target": "person-009"
  },
  {
    "id": "e-section-human-rights-promotion-section-person-010",
    "source": "section-human-rights-promotion-section",
    "target": "person-010"
  },
  {
    "id": "e-section-border-and-immigration-administration-section-person-011",
    "source": "section-border-and-immigration-administration-section",
    "target": "person-011"
  },
  {
    "id": "e-section-internal-administration-vechical-meeting-and-ceremony-managemnt-section-person-012",
    "source": "section-internal-administration-vechical-meeting-and-ceremony-managemnt-section",
    "target": "person-012"
  },
  {
    "id": "e-section-office-management-and-goods-section-person-013",
    "source": "section-office-management-and-goods-section",
    "target": "person-013"
  },
  {
    "id": "e-section-bibhushan-section-person-014",
    "source": "section-bibhushan-section",
    "target": "person-014"
  },
  {
    "id": "e-section-police-personnel-administration-section-person-015",
    "source": "section-police-personnel-administration-section",
    "target": "person-015"
  },
  {
    "id": "e-section-grievance-handling-section-person-016",
    "source": "section-grievance-handling-section",
    "target": "person-016"
  },
  {
    "id": "e-section-planing-monitoring-and-evaluation-section-person-017",
    "source": "section-planing-monitoring-and-evaluation-section",
    "target": "person-017"
  },
  {
    "id": "e-section-account-section-person-018",
    "source": "section-account-section",
    "target": "person-018"
  },
  {
    "id": "e-section-peace-promotion-section-person-019",
    "source": "section-peace-promotion-section",
    "target": "person-019"
  },
  {
    "id": "e-section-personnel-administration-section-person-020",
    "source": "section-personnel-administration-section",
    "target": "person-020"
  },
  {
    "id": "e-section-relief-and-data-management-section-person-021",
    "source": "section-relief-and-data-management-section",
    "target": "person-021"
  },
  {
    "id": "e-section-citizenship-and-nid-management-section-person-022",
    "source": "section-citizenship-and-nid-management-section",
    "target": "person-022"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-023",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-023"
  },
  {
    "id": "e-section-hello-moha-complaint-handling-desk-person-024",
    "source": "section-hello-moha-complaint-handling-desk",
    "target": "person-024"
  },
  {
    "id": "e-section-information-and-technology-section-person-025",
    "source": "section-information-and-technology-section",
    "target": "person-025"
  },
  {
    "id": "e-section-legal-decision-administration-section-person-026",
    "source": "section-legal-decision-administration-section",
    "target": "person-026"
  },
  {
    "id": "e-section-disaster-study-risk-reduction-and-recovery-section-person-027",
    "source": "section-disaster-study-risk-reduction-and-recovery-section",
    "target": "person-027"
  },
  {
    "id": "e-section-office-management-and-goods-section-person-028",
    "source": "section-office-management-and-goods-section",
    "target": "person-028"
  },
  {
    "id": "e-moha-person-029",
    "source": "moha",
    "target": "person-029"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-030",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-030"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-031",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-031"
  },
  {
    "id": "e-section-internal-administration-vechical-meeting-and-ceremony-managemnt-section-person-032",
    "source": "section-internal-administration-vechical-meeting-and-ceremony-managemnt-section",
    "target": "person-032"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-033",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-033"
  },
  {
    "id": "e-moha-person-034",
    "source": "moha",
    "target": "person-034"
  },
  {
    "id": "e-section-peace-promotion-section-person-035",
    "source": "section-peace-promotion-section",
    "target": "person-035"
  },
  {
    "id": "e-section-bibhushan-section-person-036",
    "source": "section-bibhushan-section",
    "target": "person-036"
  },
  {
    "id": "e-section-local-administration-and-province-co-ordination-section-person-037",
    "source": "section-local-administration-and-province-co-ordination-section",
    "target": "person-037"
  },
  {
    "id": "e-section-disaster-preparedness-and-response-section-neoc-person-038",
    "source": "section-disaster-preparedness-and-response-section-neoc",
    "target": "person-038"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-039",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-039"
  },
  {
    "id": "e-section-personnel-administration-section-person-040",
    "source": "section-personnel-administration-section",
    "target": "person-040"
  },
  {
    "id": "e-section-local-administration-and-province-co-ordination-section-person-041",
    "source": "section-local-administration-and-province-co-ordination-section",
    "target": "person-041"
  },
  {
    "id": "e-section-police-personnel-administration-section-person-042",
    "source": "section-police-personnel-administration-section",
    "target": "person-042"
  },
  {
    "id": "e-section-disaster-study-risk-reduction-and-recovery-section-person-043",
    "source": "section-disaster-study-risk-reduction-and-recovery-section",
    "target": "person-043"
  },
  {
    "id": "e-section-personnel-administration-section-person-044",
    "source": "section-personnel-administration-section",
    "target": "person-044"
  },
  {
    "id": "e-section-bibhushan-section-person-045",
    "source": "section-bibhushan-section",
    "target": "person-045"
  },
  {
    "id": "e-section-office-management-and-goods-section-person-046",
    "source": "section-office-management-and-goods-section",
    "target": "person-046"
  },
  {
    "id": "e-section-hello-moha-complaint-handling-desk-person-047",
    "source": "section-hello-moha-complaint-handling-desk",
    "target": "person-047"
  },
  {
    "id": "e-section-border-and-immigration-administration-section-person-048",
    "source": "section-border-and-immigration-administration-section",
    "target": "person-048"
  },
  {
    "id": "e-section-border-and-immigration-administration-section-person-049",
    "source": "section-border-and-immigration-administration-section",
    "target": "person-049"
  },
  {
    "id": "e-section-legal-decision-administration-section-person-050",
    "source": "section-legal-decision-administration-section",
    "target": "person-050"
  },
  {
    "id": "e-section-police-personnel-administration-section-person-051",
    "source": "section-police-personnel-administration-section",
    "target": "person-051"
  },
  {
    "id": "e-section-drug-control-section-person-052",
    "source": "section-drug-control-section",
    "target": "person-052"
  },
  {
    "id": "e-section-relief-and-data-management-section-person-053",
    "source": "section-relief-and-data-management-section",
    "target": "person-053"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-054",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-054"
  },
  {
    "id": "e-section-relief-and-data-management-section-person-055",
    "source": "section-relief-and-data-management-section",
    "target": "person-055"
  },
  {
    "id": "e-section-grievance-handling-section-person-056",
    "source": "section-grievance-handling-section",
    "target": "person-056"
  },
  {
    "id": "e-section-grievance-handling-section-person-057",
    "source": "section-grievance-handling-section",
    "target": "person-057"
  },
  {
    "id": "e-section-planing-monitoring-and-evaluation-section-person-058",
    "source": "section-planing-monitoring-and-evaluation-section",
    "target": "person-058"
  },
  {
    "id": "e-section-citizenship-and-nid-management-section-person-059",
    "source": "section-citizenship-and-nid-management-section",
    "target": "person-059"
  },
  {
    "id": "e-section-citizenship-and-nid-management-section-person-060",
    "source": "section-citizenship-and-nid-management-section",
    "target": "person-060"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-061",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-061"
  },
  {
    "id": "e-section-planing-monitoring-and-evaluation-section-person-062",
    "source": "section-planing-monitoring-and-evaluation-section",
    "target": "person-062"
  },
  {
    "id": "e-section-grievance-handling-section-person-063",
    "source": "section-grievance-handling-section",
    "target": "person-063"
  },
  {
    "id": "e-section-planing-monitoring-and-evaluation-section-person-064",
    "source": "section-planing-monitoring-and-evaluation-section",
    "target": "person-064"
  },
  {
    "id": "e-section-planing-monitoring-and-evaluation-section-person-065",
    "source": "section-planing-monitoring-and-evaluation-section",
    "target": "person-065"
  },
  {
    "id": "e-section-relief-and-data-management-section-person-066",
    "source": "section-relief-and-data-management-section",
    "target": "person-066"
  },
  {
    "id": "e-section-grievance-handling-section-person-067",
    "source": "section-grievance-handling-section",
    "target": "person-067"
  },
  {
    "id": "e-section-grievance-handling-section-person-068",
    "source": "section-grievance-handling-section",
    "target": "person-068"
  },
  {
    "id": "e-section-grievance-handling-section-person-069",
    "source": "section-grievance-handling-section",
    "target": "person-069"
  },
  {
    "id": "e-section-account-section-person-070",
    "source": "section-account-section",
    "target": "person-070"
  },
  {
    "id": "e-section-account-section-person-071",
    "source": "section-account-section",
    "target": "person-071"
  },
  {
    "id": "e-section-information-and-technology-section-person-072",
    "source": "section-information-and-technology-section",
    "target": "person-072"
  },
  {
    "id": "e-section-office-management-and-goods-section-person-073",
    "source": "section-office-management-and-goods-section",
    "target": "person-073"
  },
  {
    "id": "e-section-information-and-technology-section-person-074",
    "source": "section-information-and-technology-section",
    "target": "person-074"
  },
  {
    "id": "e-section-information-and-technology-section-person-075",
    "source": "section-information-and-technology-section",
    "target": "person-075"
  },
  {
    "id": "e-section-legal-decision-administration-section-person-076",
    "source": "section-legal-decision-administration-section",
    "target": "person-076"
  },
  {
    "id": "e-section-account-section-person-077",
    "source": "section-account-section",
    "target": "person-077"
  },
  {
    "id": "e-moha-person-078",
    "source": "moha",
    "target": "person-078"
  },
  {
    "id": "e-section-local-administration-and-province-co-ordination-section-person-079",
    "source": "section-local-administration-and-province-co-ordination-section",
    "target": "person-079"
  },
  {
    "id": "e-section-legal-decision-administration-section-person-080",
    "source": "section-legal-decision-administration-section",
    "target": "person-080"
  },
  {
    "id": "e-section-citizenship-and-nid-management-section-person-081",
    "source": "section-citizenship-and-nid-management-section",
    "target": "person-081"
  },
  {
    "id": "e-section-information-and-technology-section-person-082",
    "source": "section-information-and-technology-section",
    "target": "person-082"
  },
  {
    "id": "e-section-relief-and-data-management-section-person-083",
    "source": "section-relief-and-data-management-section",
    "target": "person-083"
  },
  {
    "id": "e-section-personnel-administration-section-person-084",
    "source": "section-personnel-administration-section",
    "target": "person-084"
  },
  {
    "id": "e-section-office-management-and-goods-section-person-085",
    "source": "section-office-management-and-goods-section",
    "target": "person-085"
  },
  {
    "id": "e-section-office-management-and-goods-section-person-086",
    "source": "section-office-management-and-goods-section",
    "target": "person-086"
  },
  {
    "id": "e-section-grievance-handling-section-person-087",
    "source": "section-grievance-handling-section",
    "target": "person-087"
  },
  {
    "id": "e-section-planing-monitoring-and-evaluation-section-person-088",
    "source": "section-planing-monitoring-and-evaluation-section",
    "target": "person-088"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-089",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-089"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-090",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-090"
  },
  {
    "id": "e-section-personnel-administration-section-person-091",
    "source": "section-personnel-administration-section",
    "target": "person-091"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-092",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-092"
  },
  {
    "id": "e-section-personnel-administration-section-person-093",
    "source": "section-personnel-administration-section",
    "target": "person-093"
  },
  {
    "id": "e-section-disaster-study-risk-reduction-and-recovery-section-person-094",
    "source": "section-disaster-study-risk-reduction-and-recovery-section",
    "target": "person-094"
  },
  {
    "id": "e-section-information-and-technology-section-person-095",
    "source": "section-information-and-technology-section",
    "target": "person-095"
  },
  {
    "id": "e-division-disaster-and-conflict-management-division-person-096",
    "source": "division-disaster-and-conflict-management-division",
    "target": "person-096"
  },
  {
    "id": "e-moha-person-097",
    "source": "moha",
    "target": "person-097"
  },
  {
    "id": "e-moha-person-098",
    "source": "moha",
    "target": "person-098"
  },
  {
    "id": "e-section-grievance-handling-section-person-099",
    "source": "section-grievance-handling-section",
    "target": "person-099"
  },
  {
    "id": "e-section-legal-decision-administration-section-person-100",
    "source": "section-legal-decision-administration-section",
    "target": "person-100"
  },
  {
    "id": "e-division-policy-plan-monitoring-and-evaluation-division-person-101",
    "source": "division-policy-plan-monitoring-and-evaluation-division",
    "target": "person-101"
  },
  {
    "id": "e-section-internal-administration-vechical-meeting-and-ceremony-managemnt-section-person-102",
    "source": "section-internal-administration-vechical-meeting-and-ceremony-managemnt-section",
    "target": "person-102"
  },
  {
    "id": "e-section-human-rights-promotion-section-person-103",
    "source": "section-human-rights-promotion-section",
    "target": "person-103"
  },
  {
    "id": "e-section-personnel-administration-section-person-104",
    "source": "section-personnel-administration-section",
    "target": "person-104"
  },
  {
    "id": "e-section-relief-and-data-management-section-person-105",
    "source": "section-relief-and-data-management-section",
    "target": "person-105"
  },
  {
    "id": "e-unit-registration-section-person-106",
    "source": "unit-registration-section",
    "target": "person-106"
  },
  {
    "id": "e-section-office-management-and-goods-section-person-107",
    "source": "section-office-management-and-goods-section",
    "target": "person-107"
  },
  {
    "id": "e-section-disaster-study-risk-reduction-and-recovery-section-person-108",
    "source": "section-disaster-study-risk-reduction-and-recovery-section",
    "target": "person-108"
  },
  {
    "id": "e-section-local-administration-and-province-co-ordination-section-person-109",
    "source": "section-local-administration-and-province-co-ordination-section",
    "target": "person-109"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-110",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-110"
  },
  {
    "id": "e-section-border-and-immigration-administration-section-person-111",
    "source": "section-border-and-immigration-administration-section",
    "target": "person-111"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-112",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-112"
  },
  {
    "id": "e-moha-person-113",
    "source": "moha",
    "target": "person-113"
  },
  {
    "id": "e-section-border-and-immigration-administration-section-person-114",
    "source": "section-border-and-immigration-administration-section",
    "target": "person-114"
  },
  {
    "id": "e-section-planing-monitoring-and-evaluation-section-person-115",
    "source": "section-planing-monitoring-and-evaluation-section",
    "target": "person-115"
  },
  {
    "id": "e-division-security-and-coordination-division-person-116",
    "source": "division-security-and-coordination-division",
    "target": "person-116"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-117",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-117"
  },
  {
    "id": "e-section-drug-control-section-person-118",
    "source": "section-drug-control-section",
    "target": "person-118"
  },
  {
    "id": "e-division-internal-management-division-person-119",
    "source": "division-internal-management-division",
    "target": "person-119"
  },
  {
    "id": "e-section-planing-monitoring-and-evaluation-section-person-120",
    "source": "section-planing-monitoring-and-evaluation-section",
    "target": "person-120"
  },
  {
    "id": "e-section-citizenship-and-nid-management-section-person-121",
    "source": "section-citizenship-and-nid-management-section",
    "target": "person-121"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-122",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-122"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-123",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-123"
  },
  {
    "id": "e-division-administration-division-person-124",
    "source": "division-administration-division",
    "target": "person-124"
  },
  {
    "id": "e-section-drug-control-section-person-125",
    "source": "section-drug-control-section",
    "target": "person-125"
  },
  {
    "id": "e-section-border-and-immigration-administration-section-person-126",
    "source": "section-border-and-immigration-administration-section",
    "target": "person-126"
  },
  {
    "id": "e-section-account-section-person-127",
    "source": "section-account-section",
    "target": "person-127"
  },
  {
    "id": "e-section-account-section-person-128",
    "source": "section-account-section",
    "target": "person-128"
  },
  {
    "id": "e-section-account-section-person-129",
    "source": "section-account-section",
    "target": "person-129"
  },
  {
    "id": "e-section-office-management-and-goods-section-person-130",
    "source": "section-office-management-and-goods-section",
    "target": "person-130"
  },
  {
    "id": "e-moha-person-131",
    "source": "moha",
    "target": "person-131"
  },
  {
    "id": "e-section-human-rights-promotion-section-person-132",
    "source": "section-human-rights-promotion-section",
    "target": "person-132"
  },
  {
    "id": "e-section-personnel-administration-section-person-133",
    "source": "section-personnel-administration-section",
    "target": "person-133"
  },
  {
    "id": "e-section-information-and-technology-section-person-134",
    "source": "section-information-and-technology-section",
    "target": "person-134"
  },
  {
    "id": "e-unit-secretariat-of-home-minister-person-135",
    "source": "unit-secretariat-of-home-minister",
    "target": "person-135"
  },
  {
    "id": "e-division-administration-division-person-136",
    "source": "division-administration-division",
    "target": "person-136"
  },
  {
    "id": "e-section-relief-and-data-management-section-person-137",
    "source": "section-relief-and-data-management-section",
    "target": "person-137"
  },
  {
    "id": "e-section-internal-administration-vechical-meeting-and-ceremony-managemnt-section-person-138",
    "source": "section-internal-administration-vechical-meeting-and-ceremony-managemnt-section",
    "target": "person-138"
  },
  {
    "id": "e-unit-singadurbar-entrance-south-gate-person-139",
    "source": "unit-singadurbar-entrance-south-gate",
    "target": "person-139"
  },
  {
    "id": "e-section-border-and-immigration-administration-section-person-140",
    "source": "section-border-and-immigration-administration-section",
    "target": "person-140"
  },
  {
    "id": "e-section-account-section-person-141",
    "source": "section-account-section",
    "target": "person-141"
  },
  {
    "id": "e-division-security-and-coordination-division-person-142",
    "source": "division-security-and-coordination-division",
    "target": "person-142"
  },
  {
    "id": "e-unit-chalani-person-143",
    "source": "unit-chalani",
    "target": "person-143"
  },
  {
    "id": "e-section-legal-decision-administration-section-person-144",
    "source": "section-legal-decision-administration-section",
    "target": "person-144"
  },
  {
    "id": "e-section-bibhushan-section-person-145",
    "source": "section-bibhushan-section",
    "target": "person-145"
  },
  {
    "id": "e-section-peace-promotion-section-person-146",
    "source": "section-peace-promotion-section",
    "target": "person-146"
  },
  {
    "id": "e-moha-person-147",
    "source": "moha",
    "target": "person-147"
  },
  {
    "id": "e-unit-registration-section-person-148",
    "source": "unit-registration-section",
    "target": "person-148"
  },
  {
    "id": "e-unit-chalani-person-149",
    "source": "unit-chalani",
    "target": "person-149"
  },
  {
    "id": "e-unit-chalani-person-150",
    "source": "unit-chalani",
    "target": "person-150"
  },
  {
    "id": "e-section-planing-monitoring-and-evaluation-section-person-151",
    "source": "section-planing-monitoring-and-evaluation-section",
    "target": "person-151"
  },
  {
    "id": "e-section-office-management-and-goods-section-person-152",
    "source": "section-office-management-and-goods-section",
    "target": "person-152"
  },
  {
    "id": "e-unit-secretariat-of-home-minister-person-153",
    "source": "unit-secretariat-of-home-minister",
    "target": "person-153"
  },
  {
    "id": "e-section-account-section-person-154",
    "source": "section-account-section",
    "target": "person-154"
  },
  {
    "id": "e-unit-singadurbar-entrance-south-gate-person-155",
    "source": "unit-singadurbar-entrance-south-gate",
    "target": "person-155"
  },
  {
    "id": "e-unit-chalani-person-156",
    "source": "unit-chalani",
    "target": "person-156"
  },
  {
    "id": "e-moha-person-157",
    "source": "moha",
    "target": "person-157"
  },
  {
    "id": "e-section-office-management-and-goods-section-person-158",
    "source": "section-office-management-and-goods-section",
    "target": "person-158"
  },
  {
    "id": "e-section-police-personnel-administration-section-person-159",
    "source": "section-police-personnel-administration-section",
    "target": "person-159"
  },
  {
    "id": "e-section-office-management-and-goods-section-person-160",
    "source": "section-office-management-and-goods-section",
    "target": "person-160"
  },
  {
    "id": "e-unit-registration-section-person-161",
    "source": "unit-registration-section",
    "target": "person-161"
  },
  {
    "id": "e-unit-secretariat-of-home-minister-person-162",
    "source": "unit-secretariat-of-home-minister",
    "target": "person-162"
  },
  {
    "id": "e-unit-registration-section-person-163",
    "source": "unit-registration-section",
    "target": "person-163"
  },
  {
    "id": "e-section-grievance-handling-section-person-164",
    "source": "section-grievance-handling-section",
    "target": "person-164"
  },
  {
    "id": "e-unit-secretariat-of-secretary-person-165",
    "source": "unit-secretariat-of-secretary",
    "target": "person-165"
  },
  {
    "id": "e-division-legal-division-person-166",
    "source": "division-legal-division",
    "target": "person-166"
  },
  {
    "id": "e-division-policy-plan-monitoring-and-evaluation-division-person-167",
    "source": "division-policy-plan-monitoring-and-evaluation-division",
    "target": "person-167"
  },
  {
    "id": "e-section-disaster-study-risk-reduction-and-recovery-section-person-168",
    "source": "section-disaster-study-risk-reduction-and-recovery-section",
    "target": "person-168"
  },
  {
    "id": "e-division-disaster-and-conflict-management-division-person-169",
    "source": "division-disaster-and-conflict-management-division",
    "target": "person-169"
  },
  {
    "id": "e-division-internal-management-division-person-170",
    "source": "division-internal-management-division",
    "target": "person-170"
  },
  {
    "id": "e-section-relief-and-data-management-section-person-171",
    "source": "section-relief-and-data-management-section",
    "target": "person-171"
  },
  {
    "id": "e-section-local-administration-and-province-co-ordination-section-person-172",
    "source": "section-local-administration-and-province-co-ordination-section",
    "target": "person-172"
  },
  {
    "id": "e-division-security-and-coordination-division-person-173",
    "source": "division-security-and-coordination-division",
    "target": "person-173"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-174",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-174"
  },
  {
    "id": "e-section-office-management-and-goods-section-person-175",
    "source": "section-office-management-and-goods-section",
    "target": "person-175"
  },
  {
    "id": "e-section-office-management-and-goods-section-person-176",
    "source": "section-office-management-and-goods-section",
    "target": "person-176"
  },
  {
    "id": "e-section-office-management-and-goods-section-person-177",
    "source": "section-office-management-and-goods-section",
    "target": "person-177"
  },
  {
    "id": "e-section-office-management-and-goods-section-person-178",
    "source": "section-office-management-and-goods-section",
    "target": "person-178"
  },
  {
    "id": "e-section-office-management-and-goods-section-person-179",
    "source": "section-office-management-and-goods-section",
    "target": "person-179"
  },
  {
    "id": "e-section-office-management-and-goods-section-person-180",
    "source": "section-office-management-and-goods-section",
    "target": "person-180"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-181",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-181"
  },
  {
    "id": "e-section-peace-security-and-crime-control-section-person-182",
    "source": "section-peace-security-and-crime-control-section",
    "target": "person-182"
  },
  {
    "id": "e-moha-person-183",
    "source": "moha",
    "target": "person-183"
  },
  {
    "id": "e-moha-subordinate-central-agencies",
    "source": "moha",
    "target": "subordinate-central-agencies"
  },
  {
    "id": "e-subordinate-central-agencies-office-department-of-national-id-and-civil-registration",
    "source": "subordinate-central-agencies",
    "target": "office-department-of-national-id-and-civil-registration"
  },
  {
    "id": "e-subordinate-central-agencies-office-nepal-police",
    "source": "subordinate-central-agencies",
    "target": "office-nepal-police"
  },
  {
    "id": "e-subordinate-central-agencies-office-armed-police-force-nepal",
    "source": "subordinate-central-agencies",
    "target": "office-armed-police-force-nepal"
  },
  {
    "id": "e-subordinate-central-agencies-office-nepal-immigration",
    "source": "subordinate-central-agencies",
    "target": "office-nepal-immigration"
  },
  {
    "id": "e-subordinate-central-agencies-office-department-of-prison-management",
    "source": "subordinate-central-agencies",
    "target": "office-department-of-prison-management"
  },
  {
    "id": "e-subordinate-central-agencies-office-department-for-management-of-proceeds-crime",
    "source": "subordinate-central-agencies",
    "target": "office-department-for-management-of-proceeds-crime"
  },
  {
    "id": "e-subordinate-central-agencies-office-secretariat-of-nepal-hajj-committee",
    "source": "subordinate-central-agencies",
    "target": "office-secretariat-of-nepal-hajj-committee"
  },
  {
    "id": "e-subordinate-central-agencies-office-national-emergency-operation-center",
    "source": "subordinate-central-agencies",
    "target": "office-national-emergency-operation-center"
  },
  {
    "id": "e-subordinate-central-agencies-office-national-disaster-risk-reduction-management-authority",
    "source": "subordinate-central-agencies",
    "target": "office-national-disaster-risk-reduction-management-authority"
  },
  {
    "id": "e-moha-district-administration-offices",
    "source": "moha",
    "target": "district-administration-offices"
  },
  {
    "id": "e-district-administration-offices-dao-taplejung",
    "source": "district-administration-offices",
    "target": "dao-taplejung"
  },
  {
    "id": "e-district-administration-offices-dao-panchthar",
    "source": "district-administration-offices",
    "target": "dao-panchthar"
  },
  {
    "id": "e-district-administration-offices-dao-ilaam",
    "source": "district-administration-offices",
    "target": "dao-ilaam"
  },
  {
    "id": "e-district-administration-offices-dao-jhapa",
    "source": "district-administration-offices",
    "target": "dao-jhapa"
  },
  {
    "id": "e-district-administration-offices-dao-morang",
    "source": "district-administration-offices",
    "target": "dao-morang"
  },
  {
    "id": "e-district-administration-offices-dao-sunsari",
    "source": "district-administration-offices",
    "target": "dao-sunsari"
  },
  {
    "id": "e-district-administration-offices-dao-dhankuta",
    "source": "district-administration-offices",
    "target": "dao-dhankuta"
  },
  {
    "id": "e-district-administration-offices-dao-terhathum",
    "source": "district-administration-offices",
    "target": "dao-terhathum"
  },
  {
    "id": "e-district-administration-offices-dao-bhojpur",
    "source": "district-administration-offices",
    "target": "dao-bhojpur"
  },
  {
    "id": "e-district-administration-offices-dao-sankhuwasava",
    "source": "district-administration-offices",
    "target": "dao-sankhuwasava"
  },
  {
    "id": "e-district-administration-offices-dao-solukhumbu",
    "source": "district-administration-offices",
    "target": "dao-solukhumbu"
  },
  {
    "id": "e-district-administration-offices-dao-khotang",
    "source": "district-administration-offices",
    "target": "dao-khotang"
  },
  {
    "id": "e-district-administration-offices-dao-okhaldhunga",
    "source": "district-administration-offices",
    "target": "dao-okhaldhunga"
  },
  {
    "id": "e-district-administration-offices-dao-udayapur",
    "source": "district-administration-offices",
    "target": "dao-udayapur"
  },
  {
    "id": "e-district-administration-offices-dao-siraha",
    "source": "district-administration-offices",
    "target": "dao-siraha"
  },
  {
    "id": "e-district-administration-offices-dao-saptari",
    "source": "district-administration-offices",
    "target": "dao-saptari"
  },
  {
    "id": "e-district-administration-offices-dao-dhanusha",
    "source": "district-administration-offices",
    "target": "dao-dhanusha"
  },
  {
    "id": "e-district-administration-offices-dao-mahottari",
    "source": "district-administration-offices",
    "target": "dao-mahottari"
  },
  {
    "id": "e-district-administration-offices-dao-sarlahi",
    "source": "district-administration-offices",
    "target": "dao-sarlahi"
  },
  {
    "id": "e-district-administration-offices-dao-sindhuli",
    "source": "district-administration-offices",
    "target": "dao-sindhuli"
  },
  {
    "id": "e-district-administration-offices-dao-ramechhap",
    "source": "district-administration-offices",
    "target": "dao-ramechhap"
  },
  {
    "id": "e-district-administration-offices-dao-dolakha",
    "source": "district-administration-offices",
    "target": "dao-dolakha"
  },
  {
    "id": "e-district-administration-offices-dao-rasuwa",
    "source": "district-administration-offices",
    "target": "dao-rasuwa"
  },
  {
    "id": "e-district-administration-offices-dao-sindhupalchok",
    "source": "district-administration-offices",
    "target": "dao-sindhupalchok"
  },
  {
    "id": "e-district-administration-offices-dao-nuwakot",
    "source": "district-administration-offices",
    "target": "dao-nuwakot"
  },
  {
    "id": "e-district-administration-offices-dao-dhading",
    "source": "district-administration-offices",
    "target": "dao-dhading"
  },
  {
    "id": "e-district-administration-offices-dao-kathmandu",
    "source": "district-administration-offices",
    "target": "dao-kathmandu"
  },
  {
    "id": "e-district-administration-offices-dao-lalitpur",
    "source": "district-administration-offices",
    "target": "dao-lalitpur"
  },
  {
    "id": "e-district-administration-offices-dao-bhaktapur",
    "source": "district-administration-offices",
    "target": "dao-bhaktapur"
  },
  {
    "id": "e-district-administration-offices-dao-kavrepalanchok",
    "source": "district-administration-offices",
    "target": "dao-kavrepalanchok"
  },
  {
    "id": "e-district-administration-offices-dao-makawanpur",
    "source": "district-administration-offices",
    "target": "dao-makawanpur"
  },
  {
    "id": "e-district-administration-offices-dao-rautahat",
    "source": "district-administration-offices",
    "target": "dao-rautahat"
  },
  {
    "id": "e-district-administration-offices-dao-bara",
    "source": "district-administration-offices",
    "target": "dao-bara"
  },
  {
    "id": "e-district-administration-offices-dao-parsa",
    "source": "district-administration-offices",
    "target": "dao-parsa"
  },
  {
    "id": "e-district-administration-offices-dao-chitwan",
    "source": "district-administration-offices",
    "target": "dao-chitwan"
  },
  {
    "id": "e-district-administration-offices-dao-nawalparasi-bardhghat-susta-east",
    "source": "district-administration-offices",
    "target": "dao-nawalparasi-bardhghat-susta-east"
  },
  {
    "id": "e-district-administration-offices-dao-rupandehi",
    "source": "district-administration-offices",
    "target": "dao-rupandehi"
  },
  {
    "id": "e-district-administration-offices-dao-kapilvastu",
    "source": "district-administration-offices",
    "target": "dao-kapilvastu"
  },
  {
    "id": "e-district-administration-offices-dao-palpa",
    "source": "district-administration-offices",
    "target": "dao-palpa"
  },
  {
    "id": "e-district-administration-offices-dao-arghakhanchi",
    "source": "district-administration-offices",
    "target": "dao-arghakhanchi"
  },
  {
    "id": "e-district-administration-offices-dao-gulmi",
    "source": "district-administration-offices",
    "target": "dao-gulmi"
  },
  {
    "id": "e-district-administration-offices-dao-syangja",
    "source": "district-administration-offices",
    "target": "dao-syangja"
  },
  {
    "id": "e-district-administration-offices-dao-tanahun",
    "source": "district-administration-offices",
    "target": "dao-tanahun"
  },
  {
    "id": "e-district-administration-offices-dao-gorkha",
    "source": "district-administration-offices",
    "target": "dao-gorkha"
  },
  {
    "id": "e-district-administration-offices-dao-lamjung",
    "source": "district-administration-offices",
    "target": "dao-lamjung"
  },
  {
    "id": "e-district-administration-offices-dao-kaski",
    "source": "district-administration-offices",
    "target": "dao-kaski"
  },
  {
    "id": "e-district-administration-offices-dao-manang",
    "source": "district-administration-offices",
    "target": "dao-manang"
  },
  {
    "id": "e-district-administration-offices-dao-mustang",
    "source": "district-administration-offices",
    "target": "dao-mustang"
  },
  {
    "id": "e-district-administration-offices-dao-myagdi",
    "source": "district-administration-offices",
    "target": "dao-myagdi"
  },
  {
    "id": "e-district-administration-offices-dao-baglung",
    "source": "district-administration-offices",
    "target": "dao-baglung"
  },
  {
    "id": "e-district-administration-offices-dao-parbat",
    "source": "district-administration-offices",
    "target": "dao-parbat"
  },
  {
    "id": "e-district-administration-offices-dao-dang",
    "source": "district-administration-offices",
    "target": "dao-dang"
  },
  {
    "id": "e-district-administration-offices-dao-pyuthan",
    "source": "district-administration-offices",
    "target": "dao-pyuthan"
  },
  {
    "id": "e-district-administration-offices-dao-rolpa",
    "source": "district-administration-offices",
    "target": "dao-rolpa"
  },
  {
    "id": "e-district-administration-offices-dao-salyan",
    "source": "district-administration-offices",
    "target": "dao-salyan"
  },
  {
    "id": "e-district-administration-offices-dao-rukum-east-part",
    "source": "district-administration-offices",
    "target": "dao-rukum-east-part"
  },
  {
    "id": "e-district-administration-offices-dao-dolpa",
    "source": "district-administration-offices",
    "target": "dao-dolpa"
  },
  {
    "id": "e-district-administration-offices-dao-mugu",
    "source": "district-administration-offices",
    "target": "dao-mugu"
  },
  {
    "id": "e-district-administration-offices-dao-humla",
    "source": "district-administration-offices",
    "target": "dao-humla"
  },
  {
    "id": "e-district-administration-offices-dao-jumla",
    "source": "district-administration-offices",
    "target": "dao-jumla"
  },
  {
    "id": "e-district-administration-offices-dao-kalikot",
    "source": "district-administration-offices",
    "target": "dao-kalikot"
  },
  {
    "id": "e-district-administration-offices-dao-jajarkot",
    "source": "district-administration-offices",
    "target": "dao-jajarkot"
  },
  {
    "id": "e-district-administration-offices-dao-dailekh",
    "source": "district-administration-offices",
    "target": "dao-dailekh"
  },
  {
    "id": "e-district-administration-offices-dao-surkhet",
    "source": "district-administration-offices",
    "target": "dao-surkhet"
  },
  {
    "id": "e-district-administration-offices-dao-bardiya",
    "source": "district-administration-offices",
    "target": "dao-bardiya"
  },
  {
    "id": "e-district-administration-offices-dao-banke",
    "source": "district-administration-offices",
    "target": "dao-banke"
  },
  {
    "id": "e-district-administration-offices-dao-kailali",
    "source": "district-administration-offices",
    "target": "dao-kailali"
  },
  {
    "id": "e-district-administration-offices-dao-doti",
    "source": "district-administration-offices",
    "target": "dao-doti"
  },
  {
    "id": "e-district-administration-offices-dao-achhaam",
    "source": "district-administration-offices",
    "target": "dao-achhaam"
  },
  {
    "id": "e-district-administration-offices-dao-bajura",
    "source": "district-administration-offices",
    "target": "dao-bajura"
  },
  {
    "id": "e-district-administration-offices-dao-bajhang",
    "source": "district-administration-offices",
    "target": "dao-bajhang"
  },
  {
    "id": "e-district-administration-offices-dao-darchula",
    "source": "district-administration-offices",
    "target": "dao-darchula"
  },
  {
    "id": "e-district-administration-offices-dao-baitadi",
    "source": "district-administration-offices",
    "target": "dao-baitadi"
  },
  {
    "id": "e-district-administration-offices-dao-dadeldhura",
    "source": "district-administration-offices",
    "target": "dao-dadeldhura"
  },
  {
    "id": "e-district-administration-offices-dao-kanchanpur",
    "source": "district-administration-offices",
    "target": "dao-kanchanpur"
  },
  {
    "id": "e-district-administration-offices-dao-nawalparasi-bardaghat-susta-west",
    "source": "district-administration-offices",
    "target": "dao-nawalparasi-bardaghat-susta-west"
  },
  {
    "id": "e-district-administration-offices-dao-rukum-west-part",
    "source": "district-administration-offices",
    "target": "dao-rukum-west-part"
  },
  {
    "id": "e-moha-area-administration-offices",
    "source": "moha",
    "target": "area-administration-offices"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-taplejung-sirijangha",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-taplejung-sirijangha"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-rabi",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-rabi"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-mangalbare-illam",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-mangalbare-illam"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-gauriganj-jhapa",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-gauriganj-jhapa"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-rangeli-morang",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-rangeli-morang"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-urlabari-morang",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-urlabari-morang"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-dharan-sunsari",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-dharan-sunsari"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-harinagara-sunsari",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-harinagara-sunsari"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-rajarani-dhankuta",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-rajarani-dhankuta"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-sankrantibazar-terhathum",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-sankrantibazar-terhathum"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-dingla-bhojpur",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-dingla-bhojpur"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-chainpur-sankhuwasava",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-chainpur-sankhuwasava"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-sotang-solukhumbu",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-sotang-solukhumbu"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-khotangbazar-khotang",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-khotangbazar-khotang"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-ainselukharka-khotang",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-ainselukharka-khotang"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-khijiphalante-okhaldhunga",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-khijiphalante-okhaldhunga"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-katari-udayapur",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-katari-udayapur"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-lahan-siraha",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-lahan-siraha"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-bodebarsayan-saptari",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-bodebarsayan-saptari"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-kanchanpur-saptari",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-kanchanpur-saptari"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-yadukuwa-dhanusha",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-yadukuwa-dhanusha"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-ramgopalpur-mahottari",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-ramgopalpur-mahottari"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-bardibas-mahottari",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-bardibas-mahottari"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-gaushala-mahottari",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-gaushala-mahottari"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-barhathwa-sarlahi",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-barhathwa-sarlahi"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-hariwon-sarlahi",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-hariwon-sarlahi"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-lapchanepriti-ramechhap",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-lapchanepriti-ramechhap"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-singatibazar-dolakha",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-singatibazar-dolakha"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-satbise-nuwakot",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-satbise-nuwakot"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-sankhu-kathmandu",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-sankhu-kathmandu"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-pharping-kathmandu",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-pharping-kathmandu"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-gotikhel-lalitpur",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-gotikhel-lalitpur"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-banakhuchaur-kavrepalanchowk",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-banakhuchaur-kavrepalanchowk"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-garuda-rautahat",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-garuda-rautahat"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-chandranighapur-rautahat",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-chandranighapur-rautahat"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-kolbi-bara",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-kolbi-bara"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-simraoungadh-bara",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-simraoungadh-bara"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-simara-bara",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-simara-bara"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-supouli-parsa",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-supouli-parsa"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-madi-chitwan",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-madi-chitwan"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-majhgawa-rupandehi",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-majhgawa-rupandehi"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-butwal-rupandehi",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-butwal-rupandehi"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-chandrauta-kapilvastu",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-chandrauta-kapilvastu"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-banganga-kapilvastu",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-banganga-kapilvastu"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-rampur-palpa",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-rampur-palpa"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-waling-syangja",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-waling-syangja"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-sirdibas-gorkha",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-sirdibas-gorkha"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-lekhnath-kaski",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-lekhnath-kaski"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-lo-manthang-mustang",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-lo-manthang-mustang"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-burtibang-baglung",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-burtibang-baglung"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-huwas-parbat",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-huwas-parbat"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-tulsipur-dang",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-tulsipur-dang"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-lamahi-dang",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-lamahi-dang"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-jaspur-pyuthan",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-jaspur-pyuthan"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-ghartigaun-rolpa",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-ghartigaun-rolpa"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-tharmare-salyan",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-tharmare-salyan"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-ilanarku-dolpa",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-ilanarku-dolpa"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-sorukot-mugu",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-sorukot-mugu"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-sarkegad-humla",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-sarkegad-humla"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-narakot-jumla",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-narakot-jumla"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-dullu-dailekh",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-dullu-dailekh"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-babiyachour-surkhet",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-babiyachour-surkhet"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-mehelkuna-surkhet",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-mehelkuna-surkhet"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-rajapur-bardiya",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-rajapur-bardiya"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-basgadhi-bardiya",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-basgadhi-bardiya"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-kohalpur-banke",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-kohalpur-banke"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-sukhad-kailali",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-sukhad-kailali"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-tikapur-kailali",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-tikapur-kailali"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-jogbudha-dadeldhura",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-jogbudha-dadeldhura"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-tribhuwanbasti-kanchanpur",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-tribhuwanbasti-kanchanpur"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-semari-nawalparasi-west",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-semari-nawalparasi-west"
  },
  {
    "id": "e-area-administration-offices-aao-area-administration-office-chaurjahari-rukum-west",
    "source": "area-administration-offices",
    "target": "aao-area-administration-office-chaurjahari-rukum-west"
  },
  {
    "id": "e-moha-border-administration-offices",
    "source": "moha",
    "target": "border-administration-offices"
  },
  {
    "id": "e-border-administration-offices-bao-border-administration-office-olanchungola-taplejung",
    "source": "border-administration-offices",
    "target": "bao-border-administration-office-olanchungola-taplejung"
  },
  {
    "id": "e-border-administration-offices-bao-border-administration-office-chyanthyapu-panchthar",
    "source": "border-administration-offices",
    "target": "bao-border-administration-office-chyanthyapu-panchthar"
  },
  {
    "id": "e-border-administration-offices-bao-immigration-and-border-administration-office-pashupatinagar-ilam",
    "source": "border-administration-offices",
    "target": "bao-immigration-and-border-administration-office-pashupatinagar-ilam"
  },
  {
    "id": "e-border-administration-offices-bao-border-administration-office-hatiyagola-sankhuwasava",
    "source": "border-administration-offices",
    "target": "bao-border-administration-office-hatiyagola-sankhuwasava"
  },
  {
    "id": "e-border-administration-offices-bao-border-administration-office-namche-solukhumbu",
    "source": "border-administration-offices",
    "target": "bao-border-administration-office-namche-solukhumbu"
  },
  {
    "id": "e-border-administration-offices-bao-border-administration-office-lamabagar-dolakha",
    "source": "border-administration-offices",
    "target": "bao-border-administration-office-lamabagar-dolakha"
  },
  {
    "id": "e-border-administration-offices-bao-border-administration-office-byashchagaru-darchula",
    "source": "border-administration-offices",
    "target": "bao-border-administration-office-byashchagaru-darchula"
  }
];
