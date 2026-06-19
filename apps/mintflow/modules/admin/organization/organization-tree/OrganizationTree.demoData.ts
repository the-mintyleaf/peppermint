// @ts-nocheck — demo/seed data; extended role values and deptType values are intentional
import type { OrgFlowNode, OrgFlowEdge } from "./OrganizationTree.store";

// ──────────────────────────────────────────────────────────────────────────────
// NEPAL MINISTRY OF HOME AFFAIRS — 7-Level Demo Structure
//
// L1: Ministry of Home Affairs (org)
// L2: Minister, Secretary (person), 4 Divisions + 2 Departments (dept)
// L3: Sections under Divisions (dept/section)
// L4: Sub-sections / Units (dept/unit)
// L5: Field Offices — Provincial Admin Offices (dept)
// L6: Group node — 77 District Admin Offices
// L7: Group node — 114 Area Admin Offices
//
// Person chain inside Administration Division:
// Home Secretary → Joint Secretary → Under Secretary → Section Officer
//   → Assistant Section Officer → Computer Operator → Office Assistant (7 levels)
//
// Health test nodes:
// - "Legal Affairs Section" has no head person (triggers missing_head)
// - "Vacant Unit" has no people at all (triggers empty_dept)
// - One inactive person is marked as head (triggers inactive_head)
// ──────────────────────────────────────────────────────────────────────────────

export const DUMMY_NODES: OrgFlowNode[] = [
  // ── L1: Root ──────────────────────────────────────────────────────────────
  {
    id: "moha",
    type: "org",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "org",
      name: "Ministry of Home Affairs",
      orgType: "ministry",
      description:
        "Central government ministry responsible for internal security, administration, disaster management, immigration, and home affairs in Nepal.",
      location: "Singhdurbar, Kathmandu",
      status: "active",
      headCount: 320,
      activeTasks: 12,
    },
  },

  // ── L2: Leadership persons ────────────────────────────────────────────────
  {
    id: "p-minister",
    type: "person",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "person",
      fullName: "Ramsaran Kandel",
      designation: "Hon'ble Home Minister",
      department: "Ministry of Home Affairs",
      role: "minister",
      email: "minister@moha.gov.np",
      status: "active",
      accountStatus: "active",
      roleName: "Minister",
      activeTasks: 3,
    },
  },
  {
    id: "p-secretary",
    type: "person",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "person",
      fullName: "Rajkumar Shrestha",
      designation: "Home Secretary",
      department: "Ministry of Home Affairs",
      role: "secretary",
      email: "secretary@moha.gov.np",
      status: "active",
      accountStatus: "active",
      roleName: "Secretary",
      activeTasks: 8,
    },
  },

  // ── L2: Divisions ─────────────────────────────────────────────────────────
  {
    id: "div-security",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Security and Coordination Division",
      deptType: "division",
      head: "Ananda Kafle",
      parentName: "Ministry of Home Affairs",
      peopleCount: 18,
      activeTasks: 5,
      completedTasks: 12,
      pendingTasks: 2,
      status: "active",
    },
  },
  {
    id: "div-admin",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Administration Division",
      deptType: "division",
      head: "Binod Thapa",
      parentName: "Ministry of Home Affairs",
      peopleCount: 42,
      activeTasks: 7,
      completedTasks: 20,
      pendingTasks: 4,
      status: "active",
    },
  },
  {
    id: "div-policy",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Policy and Planning Division",
      deptType: "division",
      head: "Sunita Poudel",
      parentName: "Ministry of Home Affairs",
      peopleCount: 14,
      activeTasks: 3,
      completedTasks: 8,
      pendingTasks: 1,
      status: "active",
    },
  },
  {
    id: "div-disaster",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Disaster Management Division",
      deptType: "division",
      head: "Gopal Bhandari",
      parentName: "Ministry of Home Affairs",
      peopleCount: 22,
      activeTasks: 9,
      completedTasks: 15,
      pendingTasks: 3,
      status: "active",
    },
  },

  // ── L2: Departments under MOHA ────────────────────────────────────────────
  {
    id: "dept-immigration",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Department of Immigration",
      deptType: "department",
      head: "Prakash Dahal",
      parentName: "Ministry of Home Affairs",
      peopleCount: 68,
      activeTasks: 14,
      completedTasks: 30,
      pendingTasks: 5,
      status: "active",
    },
  },
  {
    id: "dept-national-id",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Department of National Identity",
      deptType: "department",
      head: "Maya Karki",
      parentName: "Ministry of Home Affairs",
      peopleCount: 34,
      activeTasks: 6,
      completedTasks: 18,
      pendingTasks: 2,
      status: "active",
    },
  },

  // ── L3: Sections under Security Division ──────────────────────────────────
  {
    id: "sec-peace",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Peace and Security Section",
      deptType: "section",
      head: "Kamal Rai",
      parentName: "Security and Coordination Division",
      peopleCount: 6,
      activeTasks: 2,
      completedTasks: 5,
      status: "active",
    },
  },
  {
    id: "sec-crime",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Crime Control Section",
      deptType: "section",
      head: "Laxmi Tamang",
      parentName: "Security and Coordination Division",
      peopleCount: 7,
      activeTasks: 3,
      completedTasks: 8,
      status: "active",
    },
  },
  {
    id: "sec-intelligence",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Intelligence Coordination Section",
      deptType: "section",
      head: "Raju Adhikari",
      parentName: "Security and Coordination Division",
      peopleCount: 5,
      activeTasks: 1,
      completedTasks: 4,
      status: "active",
    },
  },

  // ── L3: Sections under Administration Division ────────────────────────────
  {
    id: "sec-general-admin",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "General Administration Section",
      deptType: "section",
      head: "Binod Thapa",
      parentName: "Administration Division",
      peopleCount: 12,
      activeTasks: 4,
      completedTasks: 10,
      status: "active",
    },
  },
  {
    id: "sec-finance",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Finance and Budget Section",
      deptType: "section",
      head: "Sita Gurung",
      parentName: "Administration Division",
      peopleCount: 8,
      activeTasks: 2,
      completedTasks: 6,
      status: "active",
    },
  },
  {
    id: "sec-legal",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      // No head assigned — triggers "missing_head" health issue
      name: "Legal Affairs Section",
      deptType: "section",
      parentName: "Administration Division",
      peopleCount: 4,
      activeTasks: 1,
      completedTasks: 3,
      status: "active",
    },
  },

  // ── L3: Sections under Policy Division ───────────────────────────────────
  {
    id: "sec-research",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Research and Analysis Section",
      deptType: "section",
      head: "Hari Bista",
      parentName: "Policy and Planning Division",
      peopleCount: 5,
      activeTasks: 2,
      completedTasks: 4,
      status: "active",
    },
  },
  {
    id: "sec-planning",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "National Planning Section",
      deptType: "section",
      head: "Durga Magar",
      parentName: "Policy and Planning Division",
      peopleCount: 6,
      activeTasks: 1,
      completedTasks: 5,
      status: "active",
    },
  },

  // ── L3: Sections under Disaster Management Division ───────────────────────
  {
    id: "sec-response",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Emergency Response Section",
      deptType: "section",
      head: "Sanjay Khatri",
      parentName: "Disaster Management Division",
      peopleCount: 8,
      activeTasks: 4,
      completedTasks: 7,
      status: "active",
    },
  },
  {
    id: "sec-relief",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Relief and Rehabilitation Section",
      deptType: "section",
      head: "Puja Shah",
      parentName: "Disaster Management Division",
      peopleCount: 7,
      activeTasks: 3,
      completedTasks: 6,
      status: "active",
    },
  },

  // ── L3: Sections under Dept of Immigration ────────────────────────────────
  {
    id: "sec-visa",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Visa Processing Section",
      deptType: "section",
      head: "Nirmal Basnet",
      parentName: "Department of Immigration",
      peopleCount: 18,
      activeTasks: 6,
      completedTasks: 14,
      status: "active",
    },
  },
  {
    id: "sec-border",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Border Management Section",
      deptType: "section",
      head: "Deepak Joshi",
      parentName: "Department of Immigration",
      peopleCount: 22,
      activeTasks: 5,
      completedTasks: 11,
      status: "active",
    },
  },
  {
    id: "sec-foreign-nationals",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Foreign Nationals Section",
      deptType: "section",
      head: "Anita Sharma",
      parentName: "Department of Immigration",
      peopleCount: 12,
      activeTasks: 3,
      completedTasks: 8,
      status: "active",
    },
  },

  // ── L3: Sections under Dept of National Identity ──────────────────────────
  {
    id: "sec-registration",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Citizen Registration Section",
      deptType: "section",
      head: "Rupa Khadka",
      parentName: "Department of National Identity",
      peopleCount: 16,
      activeTasks: 4,
      completedTasks: 9,
      status: "active",
    },
  },
  {
    id: "sec-identity-card",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "National ID Card Section",
      deptType: "section",
      head: "Suresh Panta",
      parentName: "Department of National Identity",
      peopleCount: 14,
      activeTasks: 3,
      completedTasks: 7,
      status: "active",
    },
  },

  // ── L4: Units under General Administration Section ────────────────────────
  {
    id: "unit-records",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Records Management Unit",
      deptType: "unit",
      head: "Lila Pandey",
      parentName: "General Administration Section",
      peopleCount: 4,
      activeTasks: 1,
      completedTasks: 3,
      status: "active",
    },
  },
  {
    id: "unit-procurement",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Procurement and Supply Unit",
      deptType: "unit",
      head: "Mohan Oli",
      parentName: "General Administration Section",
      peopleCount: 3,
      activeTasks: 2,
      completedTasks: 4,
      status: "active",
    },
  },

  // Vacant unit — triggers "empty_dept" health issue
  {
    id: "unit-vacant",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "IT Infrastructure Unit",
      deptType: "unit",
      parentName: "General Administration Section",
      peopleCount: 0,
      activeTasks: 0,
      completedTasks: 0,
      status: "active",
    },
  },

  // ── L4: Units under Visa Processing Section ───────────────────────────────
  {
    id: "unit-tourist-visa",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Tourist Visa Unit",
      deptType: "unit",
      head: "Kumari Adhikari",
      parentName: "Visa Processing Section",
      peopleCount: 8,
      activeTasks: 3,
      completedTasks: 6,
      status: "active",
    },
  },
  {
    id: "unit-business-visa",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Business Visa Unit",
      deptType: "unit",
      head: "Pramod Bhattarai",
      parentName: "Visa Processing Section",
      peopleCount: 6,
      activeTasks: 2,
      completedTasks: 4,
      status: "active",
    },
  },

  // ── L4: Units under Border Management Section ─────────────────────────────
  {
    id: "unit-border-checkpoint",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Checkpoint Operations Unit",
      deptType: "unit",
      head: "Bikash Pokharel",
      parentName: "Border Management Section",
      peopleCount: 10,
      activeTasks: 3,
      completedTasks: 7,
      status: "active",
    },
  },
  {
    id: "unit-border-intel",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Border Intelligence Unit",
      deptType: "unit",
      head: "Shreya Limbu",
      parentName: "Border Management Section",
      peopleCount: 7,
      activeTasks: 2,
      completedTasks: 5,
      status: "active",
    },
  },

  // ── L5: Provincial Admin Offices (under MOHA directly) ───────────────────
  {
    id: "pao-bagmati",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Bagmati Province Administration Office",
      deptType: "branch",
      head: "Dhan Bahadur Rai",
      parentName: "Ministry of Home Affairs",
      peopleCount: 28,
      activeTasks: 4,
      completedTasks: 11,
      status: "active",
    },
  },
  {
    id: "pao-gandaki",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Gandaki Province Administration Office",
      deptType: "branch",
      head: "Sushila Roka",
      parentName: "Ministry of Home Affairs",
      peopleCount: 22,
      activeTasks: 3,
      completedTasks: 9,
      status: "active",
    },
  },
  {
    id: "pao-lumbini",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Lumbini Province Administration Office",
      deptType: "branch",
      head: "Tek Narayan Dhakal",
      parentName: "Ministry of Home Affairs",
      peopleCount: 25,
      activeTasks: 3,
      completedTasks: 10,
      status: "active",
    },
  },

  // ── L6: Group node — District Administration Offices ──────────────────────
  {
    id: "group-district-offices",
    type: "group",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "group",
      name: "District Administration Offices",
      groupCategory: "dept",
      memberCount: 77,
      memberIds: [
        "dao-kathmandu", "dao-lalitpur", "dao-bhaktapur", "dao-kaski", "dao-chitwan",
        "dao-rupandehi", "dao-morang", "dao-sunsari", "dao-jhapa", "dao-bara",
      ],
      status: "active",
    },
  },

  // A few individual DAOs (members of the group) for expand testing
  {
    id: "dao-kathmandu",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "District Administration Office — Kathmandu",
      deptType: "branch",
      head: "Arjun Thapa",
      parentName: "District Administration Offices",
      peopleCount: 12,
      activeTasks: 2,
      completedTasks: 5,
      status: "active",
    },
  },
  {
    id: "dao-lalitpur",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "District Administration Office — Lalitpur",
      deptType: "branch",
      head: "Rita Maharjan",
      parentName: "District Administration Offices",
      peopleCount: 10,
      activeTasks: 1,
      completedTasks: 4,
      status: "active",
    },
  },
  {
    id: "dao-bhaktapur",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "District Administration Office — Bhaktapur",
      deptType: "branch",
      head: "Bijay Shrestha",
      parentName: "District Administration Offices",
      peopleCount: 9,
      activeTasks: 1,
      completedTasks: 3,
      status: "active",
    },
  },
  {
    id: "dao-kaski",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "District Administration Office — Kaski",
      deptType: "branch",
      head: "Sumitra Gurung",
      parentName: "District Administration Offices",
      peopleCount: 11,
      activeTasks: 2,
      completedTasks: 4,
      status: "active",
    },
  },
  {
    id: "dao-chitwan",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "District Administration Office — Chitwan",
      deptType: "branch",
      head: "Narayan Devkota",
      parentName: "District Administration Offices",
      peopleCount: 13,
      activeTasks: 2,
      completedTasks: 6,
      status: "active",
    },
  },
  {
    id: "dao-rupandehi",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "District Administration Office — Rupandehi",
      deptType: "branch",
      head: "Kamala Chaudhary",
      parentName: "District Administration Offices",
      peopleCount: 10,
      activeTasks: 1,
      completedTasks: 3,
      status: "active",
    },
  },
  {
    id: "dao-morang",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "District Administration Office — Morang",
      deptType: "branch",
      head: "Dipendra Yadav",
      parentName: "District Administration Offices",
      peopleCount: 11,
      activeTasks: 2,
      completedTasks: 5,
      status: "active",
    },
  },
  {
    id: "dao-sunsari",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "District Administration Office — Sunsari",
      deptType: "branch",
      head: "Sonia Karmacharya",
      parentName: "District Administration Offices",
      peopleCount: 9,
      activeTasks: 1,
      completedTasks: 3,
      status: "active",
    },
  },
  {
    id: "dao-jhapa",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "District Administration Office — Jhapa",
      deptType: "branch",
      head: "Bikram Subba",
      parentName: "District Administration Offices",
      peopleCount: 12,
      activeTasks: 2,
      completedTasks: 4,
      status: "active",
    },
  },
  {
    id: "dao-bara",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "District Administration Office — Bara",
      deptType: "branch",
      head: "Geeta Mahato",
      parentName: "District Administration Offices",
      peopleCount: 10,
      activeTasks: 1,
      completedTasks: 4,
      status: "active",
    },
  },

  // ── L7: Group node — Area Administration Offices ──────────────────────────
  {
    id: "group-area-offices",
    type: "group",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "group",
      name: "Area Administration Offices",
      groupCategory: "dept",
      memberCount: 114,
      memberIds: ["aao-thamel", "aao-patan", "aao-banepa", "aao-pokhara"],
      status: "active",
    },
  },
  {
    id: "aao-thamel",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Area Administration Office — Thamel",
      deptType: "office" as DeptType,
      head: "Ramesh Shrestha",
      parentName: "Area Administration Offices",
      peopleCount: 4,
      status: "active",
    },
  },
  {
    id: "aao-patan",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Area Administration Office — Patan",
      deptType: "office" as DeptType,
      head: "Sita Manandhar",
      parentName: "Area Administration Offices",
      peopleCount: 4,
      status: "active",
    },
  },
  {
    id: "aao-banepa",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Area Administration Office — Banepa",
      deptType: "office" as DeptType,
      head: "Dilip Tuladhar",
      parentName: "Area Administration Offices",
      peopleCount: 3,
      status: "active",
    },
  },
  {
    id: "aao-pokhara",
    type: "department",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "department",
      name: "Area Administration Office — Pokhara",
      deptType: "office" as DeptType,
      head: "Mina Ghale",
      parentName: "Area Administration Offices",
      peopleCount: 4,
      status: "active",
    },
  },

  // ── Person chain (7 levels) under Administration Division ─────────────────
  // L2 already: p-secretary
  // L3: Joint Secretary
  {
    id: "p-joint-sec",
    type: "person",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "person",
      fullName: "Ananda Kafle",
      designation: "Joint Secretary (Administration)",
      department: "Administration Division",
      role: "joint_secretary",
      email: "ajoint@moha.gov.np",
      status: "active",
      accountStatus: "active",
      roleName: "Joint Secretary",
      reportingManager: "Rajkumar Shrestha",
      activeTasks: 5,
    },
  },
  // L4: Under Secretary
  {
    id: "p-under-sec",
    type: "person",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "person",
      fullName: "Meena Tamang",
      designation: "Under Secretary",
      department: "Administration Division",
      role: "under_secretary",
      email: "undersec@moha.gov.np",
      status: "active",
      accountStatus: "active",
      roleName: "Under Secretary",
      reportingManager: "Ananda Kafle",
      activeTasks: 4,
    },
  },
  // L5: Section Officer
  {
    id: "p-section-officer",
    type: "person",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "person",
      fullName: "Rajan Bista",
      designation: "Section Officer",
      department: "General Administration Section",
      role: "section_officer",
      email: "secofficer@moha.gov.np",
      status: "active",
      accountStatus: "active",
      roleName: "Section Officer",
      reportingManager: "Meena Tamang",
      activeTasks: 3,
    },
  },
  // L6: Assistant Section Officer
  {
    id: "p-asst-officer",
    type: "person",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "person",
      fullName: "Suman Karki",
      designation: "Assistant Section Officer",
      department: "General Administration Section",
      role: "assistant",
      email: "asstoff@moha.gov.np",
      status: "active",
      accountStatus: "active",
      roleName: "Assistant",
      reportingManager: "Rajan Bista",
      activeTasks: 2,
    },
  },
  // L7: Computer Operator
  {
    id: "p-computer-operator",
    type: "person",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "person",
      fullName: "Nisha Giri",
      designation: "Computer Operator",
      department: "General Administration Section",
      role: "member",
      email: "nisha@moha.gov.np",
      status: "active",
      accountStatus: "active",
      roleName: "Operator",
      reportingManager: "Suman Karki",
      activeTasks: 1,
    },
  },

  // ── Inactive head — health test ───────────────────────────────────────────
  // A person with role "head" that is inactive, assigned to sec-legal (which already has no head data)
  {
    id: "p-inactive-head",
    type: "person",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "person",
      fullName: "Hari Prasad Koirala",
      designation: "Legal Officer (Former Head)",
      department: "Legal Affairs Section",
      role: "head",
      email: "hari.koirala@moha.gov.np",
      status: "inactive",
      accountStatus: "inactive",
      roleName: "Head",
      activeTasks: 0,
    },
  },

  // ── People under key sections for testing ─────────────────────────────────
  {
    id: "p-visa-officer-1",
    type: "person",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "person",
      fullName: "Prabha Shahi",
      designation: "Immigration Officer",
      department: "Visa Processing Section",
      role: "officer",
      email: "prabha@moha.gov.np",
      status: "active",
      accountStatus: "active",
      roleName: "Officer",
      activeTasks: 2,
    },
  },
  {
    id: "p-visa-officer-2",
    type: "person",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "person",
      fullName: "Bijay Gurung",
      designation: "Immigration Officer",
      department: "Visa Processing Section",
      role: "officer",
      email: "bijay@moha.gov.np",
      status: "active",
      accountStatus: "none",
      roleName: "Officer",
      activeTasks: 1,
    },
  },
  {
    id: "p-border-officer",
    type: "person",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "person",
      fullName: "Rajesh Thapa",
      designation: "Border Security Officer",
      department: "Border Management Section",
      role: "officer",
      email: "rajesh.t@moha.gov.np",
      status: "active",
      accountStatus: "active",
      roleName: "Security Officer",
      activeTasks: 3,
    },
  },
  {
    id: "p-disaster-coordinator",
    type: "person",
    position: { x: 0, y: 0 },
    data: {
      nodeType: "person",
      fullName: "Kamala Subedi",
      designation: "Disaster Response Coordinator",
      department: "Emergency Response Section",
      role: "coordinator",
      email: "kamala.s@moha.gov.np",
      status: "active",
      accountStatus: "active",
      roleName: "Coordinator",
      activeTasks: 4,
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EDGES
// ─────────────────────────────────────────────────────────────────────────────

export const DUMMY_EDGES: OrgFlowEdge[] = [
  // ── MOHA → L2 Persons ────────────────────────────────────────────────────
  { id: "e-moha-minister", source: "moha", target: "p-minister", data: { relationshipType: "heads" } },
  { id: "e-moha-secretary", source: "moha", target: "p-secretary", data: { relationshipType: "heads" } },

  // ── MOHA → L2 Divisions ──────────────────────────────────────────────────
  { id: "e-moha-security", source: "moha", target: "div-security", data: { relationshipType: "contains" } },
  { id: "e-moha-admin", source: "moha", target: "div-admin", data: { relationshipType: "contains" } },
  { id: "e-moha-policy", source: "moha", target: "div-policy", data: { relationshipType: "contains" } },
  { id: "e-moha-disaster", source: "moha", target: "div-disaster", data: { relationshipType: "contains" } },

  // ── MOHA → L2 Departments ────────────────────────────────────────────────
  { id: "e-moha-immigration", source: "moha", target: "dept-immigration", data: { relationshipType: "contains" } },
  { id: "e-moha-natid", source: "moha", target: "dept-national-id", data: { relationshipType: "contains" } },

  // ── MOHA → L5 Provincial Offices ─────────────────────────────────────────
  { id: "e-moha-pao-bagmati", source: "moha", target: "pao-bagmati", data: { relationshipType: "contains" } },
  { id: "e-moha-pao-gandaki", source: "moha", target: "pao-gandaki", data: { relationshipType: "contains" } },
  { id: "e-moha-pao-lumbini", source: "moha", target: "pao-lumbini", data: { relationshipType: "contains" } },

  // ── MOHA → L6 Group: District Offices ────────────────────────────────────
  { id: "e-moha-group-dao", source: "moha", target: "group-district-offices", data: { relationshipType: "contains" } },

  // ── Person chain: Secretary → Joint Secretary → Under Secretary → ... ─────
  { id: "e-sec-joint", source: "p-secretary", target: "p-joint-sec", data: { relationshipType: "supervises" } },
  { id: "e-joint-under", source: "p-joint-sec", target: "p-under-sec", data: { relationshipType: "supervises" } },
  { id: "e-under-section", source: "p-under-sec", target: "p-section-officer", data: { relationshipType: "supervises" } },
  { id: "e-section-asst", source: "p-section-officer", target: "p-asst-officer", data: { relationshipType: "supervises" } },
  { id: "e-asst-operator", source: "p-asst-officer", target: "p-computer-operator", data: { relationshipType: "supervises" } },

  // ── Security Division → L3 Sections ──────────────────────────────────────
  { id: "e-security-peace", source: "div-security", target: "sec-peace", data: { relationshipType: "contains" } },
  { id: "e-security-crime", source: "div-security", target: "sec-crime", data: { relationshipType: "contains" } },
  { id: "e-security-intel", source: "div-security", target: "sec-intelligence", data: { relationshipType: "contains" } },

  // ── Admin Division → L3 Sections ─────────────────────────────────────────
  { id: "e-admin-general", source: "div-admin", target: "sec-general-admin", data: { relationshipType: "contains" } },
  { id: "e-admin-finance", source: "div-admin", target: "sec-finance", data: { relationshipType: "contains" } },
  { id: "e-admin-legal", source: "div-admin", target: "sec-legal", data: { relationshipType: "contains" } },

  // ── Policy Division → L3 Sections ────────────────────────────────────────
  { id: "e-policy-research", source: "div-policy", target: "sec-research", data: { relationshipType: "contains" } },
  { id: "e-policy-planning", source: "div-policy", target: "sec-planning", data: { relationshipType: "contains" } },

  // ── Disaster Division → L3 Sections ──────────────────────────────────────
  { id: "e-disaster-response", source: "div-disaster", target: "sec-response", data: { relationshipType: "contains" } },
  { id: "e-disaster-relief", source: "div-disaster", target: "sec-relief", data: { relationshipType: "contains" } },

  // ── Immigration Dept → L3 Sections ───────────────────────────────────────
  { id: "e-immigration-visa", source: "dept-immigration", target: "sec-visa", data: { relationshipType: "contains" } },
  { id: "e-immigration-border", source: "dept-immigration", target: "sec-border", data: { relationshipType: "contains" } },
  { id: "e-immigration-foreign", source: "dept-immigration", target: "sec-foreign-nationals", data: { relationshipType: "contains" } },

  // ── National ID Dept → L3 Sections ───────────────────────────────────────
  { id: "e-natid-registration", source: "dept-national-id", target: "sec-registration", data: { relationshipType: "contains" } },
  { id: "e-natid-idcard", source: "dept-national-id", target: "sec-identity-card", data: { relationshipType: "contains" } },

  // ── General Admin Section → L4 Units ─────────────────────────────────────
  { id: "e-general-records", source: "sec-general-admin", target: "unit-records", data: { relationshipType: "contains" } },
  { id: "e-general-procurement", source: "sec-general-admin", target: "unit-procurement", data: { relationshipType: "contains" } },
  { id: "e-general-vacant", source: "sec-general-admin", target: "unit-vacant", data: { relationshipType: "contains" } },

  // ── Visa Section → L4 Units ───────────────────────────────────────────────
  { id: "e-visa-tourist", source: "sec-visa", target: "unit-tourist-visa", data: { relationshipType: "contains" } },
  { id: "e-visa-business", source: "sec-visa", target: "unit-business-visa", data: { relationshipType: "contains" } },

  // ── Border Section → L4 Units ─────────────────────────────────────────────
  { id: "e-border-checkpoint", source: "sec-border", target: "unit-border-checkpoint", data: { relationshipType: "contains" } },
  { id: "e-border-intel", source: "sec-border", target: "unit-border-intel", data: { relationshipType: "contains" } },

  // ── Group: District Offices → member DAOs ─────────────────────────────────
  { id: "e-dao-ktm", source: "group-district-offices", target: "dao-kathmandu", data: { relationshipType: "contains" } },
  { id: "e-dao-ltp", source: "group-district-offices", target: "dao-lalitpur", data: { relationshipType: "contains" } },
  { id: "e-dao-bkt", source: "group-district-offices", target: "dao-bhaktapur", data: { relationshipType: "contains" } },
  { id: "e-dao-kaski", source: "group-district-offices", target: "dao-kaski", data: { relationshipType: "contains" } },
  { id: "e-dao-chitwan", source: "group-district-offices", target: "dao-chitwan", data: { relationshipType: "contains" } },
  { id: "e-dao-rupandehi", source: "group-district-offices", target: "dao-rupandehi", data: { relationshipType: "contains" } },
  { id: "e-dao-morang", source: "group-district-offices", target: "dao-morang", data: { relationshipType: "contains" } },
  { id: "e-dao-sunsari", source: "group-district-offices", target: "dao-sunsari", data: { relationshipType: "contains" } },
  { id: "e-dao-jhapa", source: "group-district-offices", target: "dao-jhapa", data: { relationshipType: "contains" } },
  { id: "e-dao-bara", source: "group-district-offices", target: "dao-bara", data: { relationshipType: "contains" } },

  // ── Bagmati Province → Group: Area Admin Offices ─────────────────────────
  { id: "e-bagmati-area", source: "pao-bagmati", target: "group-area-offices", data: { relationshipType: "contains" } },

  // ── Group: Area Offices → member AAOs ────────────────────────────────────
  { id: "e-aao-thamel", source: "group-area-offices", target: "aao-thamel", data: { relationshipType: "contains" } },
  { id: "e-aao-patan", source: "group-area-offices", target: "aao-patan", data: { relationshipType: "contains" } },
  { id: "e-aao-banepa", source: "group-area-offices", target: "aao-banepa", data: { relationshipType: "contains" } },
  { id: "e-aao-pokhara", source: "group-area-offices", target: "aao-pokhara", data: { relationshipType: "contains" } },

  // ── Health test: sec-legal → inactive head ────────────────────────────────
  { id: "e-legal-inactive-head", source: "sec-legal", target: "p-inactive-head", data: { relationshipType: "heads" } },

  // ── Person chain: Admin Division → Secretary ──────────────────────────────
  { id: "e-admin-sec", source: "div-admin", target: "p-secretary", data: { relationshipType: "reports_to" } },

  // ── People under Visa section ─────────────────────────────────────────────
  { id: "e-visa-officer-1", source: "sec-visa", target: "p-visa-officer-1", data: { relationshipType: "member_of" } },
  { id: "e-visa-officer-2", source: "sec-visa", target: "p-visa-officer-2", data: { relationshipType: "member_of" } },

  // ── People under Border section ───────────────────────────────────────────
  { id: "e-border-officer", source: "sec-border", target: "p-border-officer", data: { relationshipType: "member_of" } },

  // ── People under Emergency Response section ───────────────────────────────
  { id: "e-disaster-coordinator", source: "sec-response", target: "p-disaster-coordinator", data: { relationshipType: "member_of" } },
];
