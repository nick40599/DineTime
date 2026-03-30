import { redirect } from "react-router";
import prisma from "./db.server";

export const getAdminPosAccess = async (shop) => {
  const adminShift = await prisma.shift.findFirst({
    where: {
      shop,
      clockOut: null,
      employee: {
        adminAccess: true,
      },
    },
    include: {
      employee: true,
      position: true,
    },
    orderBy: [{ clockIn: "desc" }, { id: "desc" }],
  });

  if (!adminShift) {
    return null;
  }

  return {
    employeeId: adminShift.employee.id,
    employeeName: `${adminShift.employee.firstName} ${adminShift.employee.lastName}`,
    positionName: adminShift.position.name,
    shiftId: adminShift.id,
  };
};

export const requireAdminPosAccess = async (shop) => {
  const access = await getAdminPosAccess(shop);

  if (!access) {
    throw redirect("/app/pos");
  }

  return access;
};
