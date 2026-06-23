import "server-only";

import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import type {
  CostCenter,
  ProcurementRequest,
  ProcurementStatus,
  Role,
} from "@/lib/types";
import CostCenterModel from "@/models/CostCenter";
import PurchaseRequest from "@/models/PurchaseRequest";
import User from "@/models/User";
import { requireRole, requireSession } from "@/services/auth-service";

type DbApprover = {
  _id: { toString(): string };
  role?: "Admin" | "Approver" | "Requester" | Role;
};

type DbUserEmail = {
  name?: string;
  email: string;
};

type DbRequest = {
  _id: { toString(): string };
  requestNo?: string;
  title: string;
  department?: string;
  requester?: { toString(): string };
  approver?: { toString(): string };
  status?: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PURCHASED" | "CANCELLED";
  totalAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

type DbCostCenter = {
  _id: { toString(): string };
  code: string;
  name: string;
  address: string;
  phone: string;
  requesterEmail?: string;
  approverEmail?: string;
  createdAt?: Date;
};

function dateText(date?: Date) {
  return (date ?? new Date()).toISOString().slice(0, 10);
}

function dbRole(role: Role) {
  if (role === "admin") return "Admin";
  if (role === "approver") return "Approver";
  return "Requester";
}

function normalizeStatus(status?: DbRequest["status"]): ProcurementStatus {
  if (status === "APPROVED") return "approved";
  if (status === "REJECTED" || status === "CANCELLED") return "rejected";
  if (status === "DRAFT") return "draft";
  return "pending";
}

function toRequestDto(request: DbRequest): ProcurementRequest {
  return {
    id: request.requestNo ?? request._id.toString(),
    title: request.title,
    department: request.department ?? "-",
    amount: request.totalAmount ?? 0,
    requesterId: request.requester?.toString() ?? "",
    approverId: request.approver?.toString(),
    status: normalizeStatus(request.status),
    createdAt: dateText(request.createdAt),
    updatedAt: dateText(request.updatedAt),
  };
}

function toCostCenterDto(
  costCenter: DbCostCenter,
  userNameByEmail = new Map<string, string>(),
): CostCenter {
  const requesterEmail = costCenter.requesterEmail ?? "";
  const approverEmail = costCenter.approverEmail ?? "";

  return {
    id: costCenter._id.toString(),
    code: costCenter.code,
    name: costCenter.name,
    address: costCenter.address,
    phone: costCenter.phone,
    requesterName: userNameByEmail.get(requesterEmail) ?? "",
    requesterEmail,
    approverName: userNameByEmail.get(approverEmail) ?? "",
    approverEmail,
    createdAt: dateText(costCenter.createdAt),
  };
}

function requestFilter(role: Role, userId: string) {
  if (role === "admin" || role === "approver") {
    return {};
  }

  return { requester: userId };
}

export async function getDashboardSummary() {
  const session = await requireSession();
  await connectDB();

  const filter = requestFilter(session.role, session.id);
  const requests = await PurchaseRequest.find(filter).lean<DbRequest[]>();
  const visibleRequests = requests.map(toRequestDto);

  return {
    user: session,
    total: visibleRequests.length,
    pending: visibleRequests.filter((request) => request.status === "pending").length,
    approved: visibleRequests.filter((request) => request.status === "approved").length,
    rejected: visibleRequests.filter((request) => request.status === "rejected").length,
  };
}

export async function listRequests(options?: { query?: string }) {
  const session = await requireSession();
  await connectDB();

  const query = options?.query?.trim() ?? "";
  const filter = {
    ...requestFilter(session.role, session.id),
    ...(query
      ? {
          $or: [
            { requestNo: { $regex: query, $options: "i" } },
            { title: { $regex: query, $options: "i" } },
            { department: { $regex: query, $options: "i" } },
          ],
        }
      : {}),
  };

  const requests = await PurchaseRequest.find(filter)
    .sort({ updatedAt: -1 })
    .lean<DbRequest[]>();

  return requests.map(toRequestDto);
}

export async function listPendingApprovals() {
  await requireRole(["admin", "approver"]);
  await connectDB();

  const requests = await PurchaseRequest.find({ status: "SUBMITTED" })
    .sort({ updatedAt: -1 })
    .lean<DbRequest[]>();

  return requests.map(toRequestDto);
}

export async function listCostCenters(options?: { query?: string }) {
  await requireRole(["admin"]);
  await connectDB();

  const query = options?.query?.trim() ?? "";
  const filter = query
    ? {
        $or: [
          { code: { $regex: query, $options: "i" } },
          { name: { $regex: query, $options: "i" } },
          { address: { $regex: query, $options: "i" } },
          { phone: { $regex: query, $options: "i" } },
          { requesterEmail: { $regex: query, $options: "i" } },
          { approverEmail: { $regex: query, $options: "i" } },
        ],
      }
    : {};

  const costCenters = await CostCenterModel.find(filter)
    .sort({ code: 1 })
    .lean<DbCostCenter[]>();

  const emails = Array.from(
    new Set(
      costCenters.flatMap((costCenter) => [
        costCenter.requesterEmail,
        costCenter.approverEmail,
      ]),
    ),
  ).filter((email): email is string => Boolean(email));

  const users = await User.find({ email: { $in: emails } }).lean<DbUserEmail[]>();
  const userNameByEmail = new Map(
    users.map((user) => [user.email, user.name ?? user.email]),
  );

  return costCenters.map((costCenter) =>
    toCostCenterDto(costCenter, userNameByEmail),
  );
}

export async function getCostCenter(id: string) {
  await requireRole(["admin"]);
  await connectDB();

  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  const costCenter = await CostCenterModel.findById(id).lean<DbCostCenter | null>();

  if (!costCenter) {
    return null;
  }

  const emails = [costCenter.requesterEmail, costCenter.approverEmail].filter(
    (email): email is string => Boolean(email),
  );
  const users = await User.find({ email: { $in: emails } }).lean<DbUserEmail[]>();
  const userNameByEmail = new Map(
    users.map((user) => [user.email, user.name ?? user.email]),
  );

  return toCostCenterDto(costCenter, userNameByEmail);
}

export async function createCostCenter(formData: FormData) {
  await requireRole(["admin"]);
  await connectDB();

  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const requesterEmail = String(formData.get("requesterEmail") ?? "")
    .trim()
    .toLowerCase();
  const approverEmail = String(formData.get("approverEmail") ?? "")
    .trim()
    .toLowerCase();

  if (!code || !name || !address || !phone || !requesterEmail || !approverEmail) {
    throw new Error("Cost center data is incomplete");
  }

  const [requester, approver] = await Promise.all([
    User.findOne({
      email: requesterEmail,
      role: dbRole("requester"),
      active: { $ne: false },
    }).lean<DbUserEmail | null>(),
    User.findOne({
      email: approverEmail,
      role: dbRole("approver"),
      active: { $ne: false },
    }).lean<DbUserEmail | null>(),
  ]);

  if (!requester || !approver) {
    throw new Error("Requester or approver email is invalid");
  }

  await CostCenterModel.create({
    code,
    name,
    address,
    phone,
    requesterEmail,
    approverEmail,
  });
}

export async function updateCostCenter(formData: FormData) {
  await requireRole(["admin"]);
  await connectDB();

  const id = String(formData.get("id") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const requesterEmail = String(formData.get("requesterEmail") ?? "")
    .trim()
    .toLowerCase();
  const approverEmail = String(formData.get("approverEmail") ?? "")
    .trim()
    .toLowerCase();

  if (
    !mongoose.isValidObjectId(id) ||
    !code ||
    !name ||
    !address ||
    !phone ||
    !requesterEmail ||
    !approverEmail
  ) {
    throw new Error("Cost center data is incomplete");
  }

  const [requester, approver] = await Promise.all([
    User.findOne({
      email: requesterEmail,
      role: dbRole("requester"),
      active: { $ne: false },
    }).lean<DbUserEmail | null>(),
    User.findOne({
      email: approverEmail,
      role: dbRole("approver"),
      active: { $ne: false },
    }).lean<DbUserEmail | null>(),
  ]);

  if (!requester || !approver) {
    throw new Error("Requester or approver email is invalid");
  }

  await CostCenterModel.findByIdAndUpdate(
    id,
    {
      code,
      name,
      address,
      phone,
      requesterEmail,
      approverEmail,
    },
    { runValidators: true },
  );
}

export async function deleteCostCenter(formData: FormData) {
  await requireRole(["admin"]);
  await connectDB();

  const id = String(formData.get("id") ?? "");

  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Cost center id is invalid");
  }

  await CostCenterModel.findByIdAndDelete(id);
}

export async function createRequest(formData: FormData) {
  const session = await requireRole(["admin", "requester"]);
  await connectDB();

  const title = String(formData.get("title") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);

  if (!title || !department || Number.isNaN(amount) || amount <= 0) {
    throw new Error("Purchase request data is incomplete");
  }

  const approver = await User.findOne({
    role: dbRole("approver"),
    active: { $ne: false },
  }).lean<DbApprover | null>();

  await PurchaseRequest.create({
    requestNo: `PR-${Date.now()}`,
    title,
    department,
    requester: session.id,
    approver: approver?._id,
    status: "SUBMITTED",
    totalAmount: amount,
  });
}

export async function approveRequest(formData: FormData) {
  const session = await requireRole(["admin", "approver"]);
  await connectDB();

  const requestNo = String(formData.get("requestId") ?? "");
  const request = await PurchaseRequest.findOne({ requestNo, status: "SUBMITTED" });

  if (!request) {
    throw new Error("Pending purchase request was not found");
  }

  request.status = "APPROVED";
  request.approver = session.id;
  request.approvedAt = new Date();
  await request.save();
}

export async function rejectRequest(formData: FormData) {
  const session = await requireRole(["admin", "approver"]);
  await connectDB();

  const requestNo = String(formData.get("requestId") ?? "");
  const request = await PurchaseRequest.findOne({ requestNo, status: "SUBMITTED" });

  if (!request) {
    throw new Error("Pending purchase request was not found");
  }

  request.status = "REJECTED";
  request.approver = session.id;
  await request.save();
}
