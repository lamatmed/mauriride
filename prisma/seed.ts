import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Superviseur (propriétaire plateforme) ─────────────────────
  const superviseurPassword = await bcrypt.hash("superadmin@123", 12);
  await prisma.user.upsert({
    where: { email: "superadmin@rim.mr" },
    update: {},
    create: {
      email: "superadmin@rim.mr",
      name: "Superviseur Plateforme",
      role: "SUPERVISEUR",
      password: superviseurPassword,
      isActive: true,
      companyId: null,
      agencyId: null,
    },
  });
  console.log("✅ Superviseur: superadmin@rim.mr / superadmin@123");

  // ── Full reset (preserve superviseur) ────────────────────────
  await prisma.payment.deleteMany();
  await prisma.parcel.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.passenger.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.cashRegister.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.route.deleteMany();
  await prisma.user.deleteMany({ where: { role: { not: "SUPERVISEUR" } } });
  await prisma.agency.deleteMany();
  await prisma.company.deleteMany();
  console.log("🧹 Full reset done");

  // ── Company ─────────────────────────────────────────────────
  const company = await prisma.company.create({
    data: {
      name:    "Transport Mauritanie SARL",
      nameAr:  "شركة النقل الموريتانية",
      email:   "superadmin@demo.mr",
      phone:   "+222 45 25 00 00",
      address: "Avenue Gamal Abdel Nasser, Nouakchott",
    },
  });
  console.log("✅ Company:", company.name);

  // ── Agencies ──────────────────────────────────────────────────
  const cities = ["Nouakchott", "Nouadhibou", "Rosso", "Kaédi", "Kiffa", "Néma"];
  const agencyMap: Record<string, Awaited<ReturnType<typeof prisma.agency.upsert>>> = {};

  for (const city of cities) {
    const agency = await prisma.agency.upsert({
      where: { id: `agency-${city.toLowerCase().replace(/[éè]/g, "e")}` },
      update: {},
      create: {
        id: `agency-${city.toLowerCase().replace(/[éè]/g, "e")}`,
        companyId: company.id,
        name: `Agence ${city}`,
        city,
        address: `Gare Routière de ${city}`,
        phone: "+222 45 00 00 01",
        isActive: true,
      },
    });
    agencyMap[city] = agency;
  }
  console.log("✅ Agencies:", Object.keys(agencyMap).join(", "));

  // ── Users ──────────────────────────────────────────────────────
  const password = await bcrypt.hash("demo123", 12);

  const userDefs = [
    { email: "superadmin@demo.mr",  name: "Super Admin",             role: "SUPER_ADMIN"    as const, companyId: company.id, agencyId: null },
    { email: "directeur@demo.mr",   name: "Ahmed Ould Directeur",    role: "DIRECTOR"       as const, companyId: company.id, agencyId: null },
    { email: "manager@demo.mr",     name: "Fatima Mint Manager",     role: "AGENCY_MANAGER" as const, companyId: company.id, agencyId: agencyMap["Nouakchott"].id },
    { email: "agent@demo.mr",       name: "Mohamed Ould Agent",      role: "AGENT"          as const, companyId: company.id, agencyId: agencyMap["Nouakchott"].id },
    { email: "caissier@demo.mr",    name: "Aminetou Mint Caissier",  role: "CASHIER"        as const, companyId: company.id, agencyId: agencyMap["Nouakchott"].id },
    { email: "controleur@demo.mr",  name: "Sidi Ould Controleur",    role: "CONTROLLER"     as const, companyId: company.id, agencyId: agencyMap["Nouakchott"].id },
    { email: "chauffeur@demo.mr",   name: "Boubacar Ba Chauffeur",   role: "DRIVER"         as const, companyId: company.id, agencyId: agencyMap["Nouakchott"].id },
  ];

  const userMap: Record<string, Awaited<ReturnType<typeof prisma.user.upsert>>> = {};
  for (const u of userDefs) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password, isActive: true },
    });
    userMap[u.role] = user;
  }
  console.log("✅ Users created");

  // ── Buses ──────────────────────────────────────────────────────
  const busData = [
    { plate: "MR-001-NKT", brand: "Mercedes",  model: "Tourismo",  year: 2020, totalSeats: 50 },
    { plate: "MR-002-NKT", brand: "Volvo",     model: "9700",      year: 2019, totalSeats: 45 },
    { plate: "MR-003-NKT", brand: "Yutong",    model: "ZK6122",    year: 2021, totalSeats: 55 },
    { plate: "MR-004-NDB", brand: "Scania",    model: "Touring",   year: 2022, totalSeats: 48 },
    { plate: "MR-005-RSO", brand: "King Long", model: "XMQ6127",   year: 2020, totalSeats: 50 },
  ];

  const buses = [];
  for (const b of busData) {
    const bus = await prisma.bus.upsert({
      where: { plate: b.plate },
      update: {},
      create: { ...b, companyId: company.id, status: "ACTIVE", vipSeats: 10 },
    });
    buses.push(bus);
  }
  console.log("✅ Buses:", buses.length);

  // ── Routes ─────────────────────────────────────────────────────
  const routeData = [
    { origin: "Nouakchott", destin: "Nouadhibou", dist: 470,  hrs: 6.5, price: 4500 },
    { origin: "Nouakchott", destin: "Rosso",      dist: 200,  hrs: 3.0, price: 1800 },
    { origin: "Nouakchott", destin: "Kaédi",      dist: 370,  hrs: 5.0, price: 3500 },
    { origin: "Nouakchott", destin: "Kiffa",      dist: 600,  hrs: 8.0, price: 5500 },
    { origin: "Nouakchott", destin: "Néma",       dist: 1100, hrs: 14,  price: 9000 },
    { origin: "Nouadhibou", destin: "Nouakchott", dist: 470,  hrs: 6.5, price: 4500 },
    { origin: "Rosso",      destin: "Nouakchott", dist: 200,  hrs: 3.0, price: 1800 },
  ];

  const routeMap: Record<string, Awaited<ReturnType<typeof prisma.route.upsert>>> = {};
  for (const r of routeData) {
    const key = `${r.origin}-${r.destin}`;
    const route = await prisma.route.upsert({
      where: { companyId_originCity_destinCity: { companyId: company.id, originCity: r.origin, destinCity: r.destin } },
      update: {},
      create: {
        companyId: company.id,
        originCity: r.origin,
        destinCity: r.destin,
        distanceKm: r.dist,
        durationHours: r.hrs,
        basePrice: r.price,
        vipPrice: r.price * 1.5,
        isActive: true,
      },
    });
    routeMap[key] = route;
  }
  console.log("✅ Routes:", Object.keys(routeMap).length);

  // ── Trips: today + last 7 days ─────────────────────────────────
  const now = new Date();
  const agentId = userMap["AGENT"]?.id ?? userMap["SUPER_ADMIN"].id;
  const driverId = userMap["DRIVER"]?.id;

  // Today's trips
  const todayTripData = [
    { routeKey: "Nouakchott-Nouadhibou", busIdx: 0, depCity: "Nouakchott", arrCity: "Nouadhibou", hoursFromNow: 2,   status: "BOARDING"   as const },
    { routeKey: "Nouakchott-Rosso",      busIdx: 1, depCity: "Nouakchott", arrCity: "Rosso",      hoursFromNow: 5,   status: "SCHEDULED"  as const },
    { routeKey: "Nouakchott-Kaédi",      busIdx: 2, depCity: "Nouakchott", arrCity: "Kaédi",      hoursFromNow: -3,  status: "DEPARTED"   as const },
    { routeKey: "Nouakchott-Kiffa",      busIdx: 3, depCity: "Nouakchott", arrCity: "Kiffa",      hoursFromNow: 24,  status: "SCHEDULED"  as const },
    { routeKey: "Nouadhibou-Nouakchott", busIdx: 4, depCity: "Nouadhibou", arrCity: "Nouakchott", hoursFromNow: 1,   status: "BOARDING"   as const },
  ];

  const todayTrips: Awaited<ReturnType<typeof prisma.trip.create>>[] = [];
  for (const t of todayTripData) {
    const route = routeMap[t.routeKey];
    if (!route) continue;
    const depTime = new Date(now.getTime() + t.hoursFromNow * 3600_000);
    const trip = await prisma.trip.create({
      data: {
        routeId: route.id,
        busId: buses[t.busIdx]?.id ?? buses[0].id,
        driverId,
        departureAgencyId: agencyMap[t.depCity]?.id ?? agencyMap["Nouakchott"].id,
        arrivalAgencyId: agencyMap[t.arrCity]?.id ?? agencyMap["Nouadhibou"].id,
        departureTime: depTime,
        arrivalTime: new Date(depTime.getTime() + (route.durationHours ?? 6) * 3600_000),
        status: t.status,
      },
    });
    todayTrips.push(trip);
  }

  // Historical trips (last 7 days) — for revenue chart
  const historicTrips: Awaited<ReturnType<typeof prisma.trip.create>>[] = [];
  for (let daysAgo = 1; daysAgo <= 7; daysAgo++) {
    const depTime = new Date(now);
    depTime.setDate(depTime.getDate() - daysAgo);
    depTime.setHours(8, 0, 0, 0);

    const routeKeys = ["Nouakchott-Nouadhibou", "Nouakchott-Rosso", "Nouakchott-Kaédi"];
    for (let ri = 0; ri < routeKeys.length; ri++) {
      const route = routeMap[routeKeys[ri]];
      if (!route) continue;
      const t = depTime;
      t.setHours(8 + ri * 3, 0, 0, 0);
      const trip = await prisma.trip.create({
        data: {
          routeId: route.id,
          busId: buses[ri % buses.length].id,
          driverId,
          departureAgencyId: agencyMap["Nouakchott"].id,
          arrivalAgencyId: agencyMap[ri === 0 ? "Nouadhibou" : ri === 1 ? "Rosso" : "Kaédi"].id,
          departureTime: new Date(depTime),
          arrivalTime: new Date(depTime.getTime() + (route.durationHours ?? 6) * 3600_000),
          status: "ARRIVED",
        },
      });
      historicTrips.push(trip);
    }
  }
  console.log(`✅ Trips: ${todayTrips.length} today + ${historicTrips.length} historical`);

  // ── Passengers & Reservations (today) ─────────────────────────
  const passengerNames = [
    ["Mohamed Ould Ahmed",  "+222 36 00 00 01"],
    ["Fatima Mint Moussa",  "+222 36 00 00 02"],
    ["Abdallahi Ould Bah",  "+222 36 00 00 03"],
    ["Mariem Mint Cheikh",  "+222 36 00 00 04"],
    ["Sidi Ould Mohamed",   "+222 36 00 00 05"],
    ["Aminetou Mint Fall",  "+222 36 00 00 06"],
    ["Bocar Ba",            "+222 36 00 00 07"],
    ["Zeinab Mint Ahmed",   "+222 36 00 00 08"],
    ["Ismail Ould Hamza",   "+222 36 00 00 09"],
    ["Khadija Mint Ahmed",  "+222 36 00 00 10"],
    ["Omar Ould Sidi",      "+222 36 00 00 11"],
    ["Nana Mint Bah",       "+222 36 00 00 12"],
  ];

  for (let i = 0; i < passengerNames.length; i++) {
    const [fullName, phone] = passengerNames[i];
    const passenger = await prisma.passenger.create({ data: { fullName, phone } });

    const trip = todayTrips[i % todayTrips.length];
    const basePrice = routeData[i % routeData.length]?.price ?? 2000;

    const reservation = await prisma.reservation.create({
      data: {
        passengerId: passenger.id,
        tripId: trip.id,
        agentId,
        seatNumber: i + 1,
        seatClass: i % 5 === 0 ? "VIP" : "STANDARD",
        basePrice,
        totalPrice: basePrice,
        status: i % 4 === 0 ? "BOARDED" : "CONFIRMED",
      },
    });

    await prisma.payment.create({
      data: {
        reservationId: reservation.id,
        agentId,
        amount: basePrice,
        method: i % 3 === 0 ? "MOBILE_MONEY" : "CASH",
        status: "PAID",
        paidAt: now,
      },
    });
  }
  console.log("✅ Today's passengers & payments:", passengerNames.length);

  // ── Historical Reservations & Payments (last 7 days) ─────────
  const historicPassengerNames = [
    "Hassan Ould Brahim", "Aichetou Mint Vall", "Yahya Ould Sow",
    "Rokia Mint Cheikh",  "Ibrahima Ba",        "Safia Mint Mohamed",
    "Mokhtar Ould Hamd",  "Marieme Mint Diallo",
  ];

  let historicPassIdx = 0;
  for (const trip of historicTrips) {
    const reservationsPerTrip = 4 + (historicPassIdx % 3);
    for (let r = 0; r < reservationsPerTrip; r++) {
      const name = historicPassengerNames[historicPassIdx % historicPassengerNames.length];
      const phone = `+222 37 ${String(historicPassIdx).padStart(6, "0")}`;
      const passenger = await prisma.passenger.create({ data: { fullName: name, phone } });

      const routeIdx = historicPassIdx % routeData.length;
      const basePrice = routeData[routeIdx]?.price ?? 2000;

      const paidAt = new Date(trip.departureTime);

      const reservation = await prisma.reservation.create({
        data: {
          passengerId: passenger.id,
          tripId: trip.id,
          agentId,
          seatNumber: r + 1,
          seatClass: r === 0 ? "VIP" : "STANDARD",
          basePrice,
          totalPrice: basePrice,
          status: "BOARDED",
          createdAt: paidAt,
        },
      });

      await prisma.payment.create({
        data: {
          reservationId: reservation.id,
          agentId,
          amount: basePrice,
          method: r % 2 === 0 ? "CASH" : "MOBILE_MONEY",
          status: "PAID",
          paidAt,
          createdAt: paidAt,
        },
      });

      historicPassIdx++;
    }
  }
  console.log("✅ Historical reservations & payments");

  // ── Parcels ───────────────────────────────────────────────────
  const parcelData = [
    { sender: "Ahmed Ould",  sPhone: "+222 36 10 00 01", receiver: "Khadija Mint", rPhone: "+222 36 10 00 02", weight: 5,  price: 800,  status: "IN_TRANSIT" as const, daysAgo: 0 },
    { sender: "Sidi Ba",     sPhone: "+222 36 10 00 03", receiver: "Moussa Ould",  rPhone: "+222 36 10 00 04", weight: 12, price: 1500, status: "RECEIVED"   as const, daysAgo: 0 },
    { sender: "Aicha Mint",  sPhone: "+222 36 10 00 05", receiver: "Omar Ould",    rPhone: "+222 36 10 00 06", weight: 3,  price: 500,  status: "DELIVERED"  as const, daysAgo: 1 },
    { sender: "Binta Diallo",sPhone: "+222 36 10 00 07", receiver: "Nana Mint",    rPhone: "+222 36 10 00 08", weight: 8,  price: 1200, status: "DELIVERED"  as const, daysAgo: 2 },
    { sender: "Yero Ba",     sPhone: "+222 36 10 00 09", receiver: "Hawa Mint",    rPhone: "+222 36 10 00 10", weight: 6,  price: 900,  status: "DELIVERED"  as const, daysAgo: 3 },
  ];

  for (const p of parcelData) {
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - p.daysAgo);
    await prisma.parcel.create({
      data: {
        senderName: p.sender,
        senderPhone: p.sPhone,
        receiverName: p.receiver,
        receiverPhone: p.rPhone,
        weightKg: p.weight,
        price: p.price,
        status: p.status,
        senderAgencyId: agencyMap["Nouakchott"].id,
        receiverAgencyId: agencyMap["Nouadhibou"].id,
        tripId: todayTrips[0]?.id,
        createdAt,
      },
    });
  }
  console.log("✅ Parcels:", parcelData.length);

  // ── Cash register ──────────────────────────────────────────────
  await prisma.cashRegister.create({
    data: { agencyId: agencyMap["Nouakchott"].id, openAmount: 50000, isOpen: true },
  });

  // ── Expenses ───────────────────────────────────────────────────
  await prisma.expense.createMany({
    data: [
      { agencyId: agencyMap["Nouakchott"].id, category: "FUEL",        amount: 25000, description: "Carburant bus MR-001" },
      { agencyId: agencyMap["Nouakchott"].id, category: "MAINTENANCE",  amount: 45000, description: "Vidange MR-002" },
      { agencyId: agencyMap["Nouakchott"].id, category: "UTILITIES",    amount: 8000,  description: "Électricité agence" },
    ],
  });
  console.log("✅ Cash register & expenses");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Demo accounts (mot de passe: demo123)");
  console.log("  Super Admin  : superadmin@demo.mr");
  console.log("  Directeur    : directeur@demo.mr");
  console.log("  Manager      : manager@demo.mr");
  console.log("  Agent        : agent@demo.mr");
  console.log("  Caissier     : caissier@demo.mr");
  console.log("  Contrôleur   : controleur@demo.mr");
  console.log("  Chauffeur    : chauffeur@demo.mr");
}

main()
  .catch(console.error)
  .finally(async () => { await prisma.$disconnect(); });
