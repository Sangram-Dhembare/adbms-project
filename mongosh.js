// Smart Campus Event Engine & Ticket Hub
// Run once against a fresh database: mongosh < mongosh.js
use campus_events;

db.clubs.insertMany([
  { _id: "CLB101", name: "Coding Club", category: "Technical" },
  { _id: "CLB102", name: "Music Society", category: "Cultural" },
  { _id: "CLB103", name: "Robotics Club", category: "Technical" }
]);

db.events.insertMany([
  {
    _id: "EVT101",
    title: "HackCampus 2026",
    category: "Technical",
    organizerClub: "Coding Club",
    venue: "Auditorium A",
    date: ISODate("2026-10-15T09:00:00Z"),
    capacity: 200,
    seatsAvailable: 45,
    entryFee: 150,
    tags: ["hackathon", "coding", "prizes"],
    coordinators: [{ name: "Aarav Sharma", contact: "aarav@college.edu" }],
    sponsors: ["TechCorp", "DevStudio"]
  },
  {
    _id: "EVT102",
    title: "Annual Music Night",
    category: "Cultural",
    organizerClub: "Music Society",
    venue: "Open Air Theatre",
    date: ISODate("2026-10-20T18:00:00Z"),
    capacity: 500,
    seatsAvailable: 120,
    entryFee: 0,
    tags: ["music", "concert", "night"],
    coordinators: [{ name: "Riya Sen", contact: "riya@college.edu" }],
    sponsors: []
  },
  {
    _id: "EVT103",
    title: "AI & Robotics Workshop",
    category: "Technical",
    organizerClub: "Robotics Club",
    venue: "Lab 3",
    date: ISODate("2026-11-05T10:00:00Z"),
    capacity: 60,
    seatsAvailable: 10,
    entryFee: 50,
    tags: ["ai", "robotics", "workshop"],
    coordinators: [{ name: "Karan Patel", contact: "karan@college.edu" }],
    sponsors: ["RoboLabs"]
  }
]);

db.registrations.insertMany([
  {
    ticketId: "TICK-2026-001",
    eventId: "EVT101",
    studentId: "STU8821",
    studentName: "Priya Verma",
    department: "Computer Science",
    year: 3,
    registrationDate: ISODate("2026-09-12T14:30:00Z"),
    checkInStatus: false,
    paymentDetails: { method: "UPI", amountPaid: 150, status: "Completed" }
  },
  {
    ticketId: "TICK-2026-002",
    eventId: "EVT102",
    studentId: "STU8821",
    studentName: "Priya Verma",
    department: "Computer Science",
    year: 3,
    registrationDate: ISODate("2026-09-13T10:00:00Z"),
    checkInStatus: true,
    paymentDetails: { method: "Free", amountPaid: 0, status: "Completed" }
  },
  {
    ticketId: "TICK-2026-003",
    eventId: "EVT101",
    studentId: "STU4412",
    studentName: "Rohan Gupta",
    department: "Electrical Engineering",
    year: 2,
    registrationDate: ISODate("2026-09-14T11:20:00Z"),
    checkInStatus: true,
    paymentDetails: { method: "Card", amountPaid: 150, status: "Completed" }
  },
  {
    ticketId: "TICK-2026-004",
    eventId: "EVT103",
    studentId: "STU9903",
    studentName: "Ananya Roy",
    department: "Computer Science",
    year: 4,
    registrationDate: ISODate("2026-09-15T16:45:00Z"),
    checkInStatus: false,
    paymentDetails: { method: "UPI", amountPaid: 50, status: "Completed" }
  }
]);

print("\n--- Free events with more than 50 seats ---");
printjson(db.events.find({ entryFee: 0, seatsAvailable: { $gt: 50 } }).toArray());

print("\n--- Events tagged coding or hackathon ---");
printjson(db.events.find({ tags: { $in: ["coding", "hackathon"] } }).toArray());

print("\n--- Computer Science registrations ---");
printjson(db.registrations.find({ department: "Computer Science" }).toArray());

print("\n--- Atomic seat booking ---");
printjson(db.events.updateOne(
  { _id: "EVT101", seatsAvailable: { $gt: 0 } },
  { $inc: { seatsAvailable: -1 } }
));

print("\n--- Check in ticket TICK-2026-001 ---");
printjson(db.registrations.updateOne(
  { ticketId: "TICK-2026-001" },
  { $set: { checkInStatus: true } }
));

print("\n--- Add CloudInc sponsor without duplicates ---");
printjson(db.events.updateOne(
  { _id: "EVT101" },
  { $addToSet: { sponsors: "CloudInc" } }
));

print("\n--- Revenue per event and organizer club ---");
printjson(db.registrations.aggregate([
  {
    $group: {
      _id: "$eventId",
      totalRevenue: { $sum: "$paymentDetails.amountPaid" },
      totalTicketsSold: { $sum: 1 }
    }
  },
  {
    $lookup: {
      from: "events",
      localField: "_id",
      foreignField: "_id",
      as: "eventInfo"
    }
  },
  { $unwind: "$eventInfo" },
  {
    $project: {
      _id: 0,
      eventId: "$_id",
      eventTitle: "$eventInfo.title",
      organizerClub: "$eventInfo.organizerClub",
      totalRevenue: 1,
      totalTicketsSold: 1
    }
  }
]).toArray());

print("\n--- Department participation ---");
printjson(db.registrations.aggregate([
  { $group: { _id: "$department", totalRegistrations: { $sum: 1 } } },
  { $sort: { totalRegistrations: -1 } }
]).toArray());

print("\n--- Turnout rate by event ---");
printjson(db.registrations.aggregate([
  {
    $group: {
      _id: "$eventId",
      totalRegistrations: { $sum: 1 },
      checkedInCount: {
        $sum: { $cond: [{ $eq: ["$checkInStatus", true] }, 1, 0] }
      }
    }
  },
  {
    $project: {
      _id: 0,
      eventId: "$_id",
      totalRegistrations: 1,
      checkedInCount: 1,
      turnoutPercentage: {
        $multiply: [
          { $divide: ["$checkedInCount", "$totalRegistrations"] },
          100
        ]
      }
    }
  }
]).toArray());
