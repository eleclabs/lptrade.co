import "server-only";

import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import type {
  Cart,
  CartItem,
  Order,
  OrderItem,
  OrderStatus,
  Role,
  SessionUser,
} from "@/lib/types";
import CartModel from "@/models/Cart";
import CostCenterModel from "@/models/CostCenter";
import OrderModel from "@/models/Order";
import ProductModel from "@/models/Product";
import { requireRole } from "@/services/auth-service";

type DbCartItem = {
  product: { toString(): string };
  sku: string;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
  imageUrl?: string;
};

type DbCostCenter = {
  _id: { toString(): string };
  code: string;
  name: string;
  address: string;
  phone: string;
  requesterEmail?: string;
  approverEmail?: string;
};

type DbCart = {
  _id: { toString(): string };
  costCenter?: DbCostCenter | { toString(): string } | null;
  items?: DbCartItem[];
  updatedAt?: Date;
};

type DbOrderItem = DbCartItem & {
  _id?: { toString(): string };
};

type DbRequester = {
  _id: { toString(): string };
  name?: string;
  email?: string;
};

type DbOrder = {
  _id: { toString(): string };
  orderNo: string;
  user: DbRequester | string;
  costCenter?: DbCostCenter | { toString(): string } | null;
  status?: "PENDING" | "PAID" | "CANCELLED";
  items?: DbOrderItem[];
  totalAmount?: number;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type DbProduct = {
  _id: { toString(): string };
  sku: string;
  name: string;
  price: number;
  stock: number;
  unit?: string;
  status?: string;
  images?: Array<{ url: string; order?: number }>;
};

function dateText(date?: Date) {
  return (date ?? new Date()).toISOString().slice(0, 10);
}

function lineTotal(item: { price: number; quantity: number }) {
  return item.price * item.quantity;
}

function dbCostCenter(costCenter?: DbOrder["costCenter"]) {
  if (!costCenter || typeof costCenter === "string" || !("code" in costCenter)) {
    return null;
  }

  return costCenter;
}

function toCartItemDto(item: DbCartItem): CartItem {
  return {
    id: item.product.toString(),
    productId: item.product.toString(),
    sku: item.sku,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    unit: item.unit ?? "",
    imageUrl: item.imageUrl || undefined,
    lineTotal: lineTotal(item),
  };
}

function emptyCart(): Cart {
  return {
    id: "",
    items: [],
    itemCount: 0,
    totalAmount: 0,
    updatedAt: dateText(),
  };
}

function toCartDto(cart: DbCart | null): Cart {
  if (!cart) {
    return emptyCart();
  }

  const costCenter = dbCostCenter(cart.costCenter);
  const items = (cart.items ?? []).map(toCartItemDto);

  return {
    id: cart._id.toString(),
    costCenterId: costCenter?._id.toString(),
    costCenterCode: costCenter?.code,
    costCenterName: costCenter?.name,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: items.reduce((sum, item) => sum + item.lineTotal, 0),
    updatedAt: dateText(cart.updatedAt),
  };
}

function normalizeOrderStatus(status?: DbOrder["status"]): OrderStatus {
  if (status === "PAID") return "paid";
  if (status === "CANCELLED") return "cancelled";
  return "pending";
}

function dbOrderStatus(status: string) {
  if (status === "paid") return "PAID";
  if (status === "cancelled") return "CANCELLED";
  return "PENDING";
}

function requesterId(user: DbOrder["user"]) {
  return typeof user === "string" ? user : user._id.toString();
}

function requesterName(user: DbOrder["user"]) {
  return typeof user === "string" ? "" : user.name ?? user.email ?? "";
}

function toOrderItemDto(item: DbOrderItem): OrderItem {
  return {
    id: item._id?.toString() ?? item.product.toString(),
    productId: item.product.toString(),
    sku: item.sku,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    unit: item.unit ?? "",
    imageUrl: item.imageUrl || undefined,
    lineTotal: lineTotal(item),
  };
}

function toOrderDto(order: DbOrder): Order {
  const items = (order.items ?? []).map(toOrderItemDto);
  const costCenter = dbCostCenter(order.costCenter);

  return {
    id: order._id.toString(),
    orderNo: order.orderNo,
    requesterId: requesterId(order.user),
    requesterName: requesterName(order.user),
    costCenterId: costCenter?._id.toString() ?? "",
    costCenterCode: costCenter?.code ?? "",
    costCenterName: costCenter?.name ?? "",
    costCenterAddress: costCenter?.address ?? "",
    costCenterPhone: costCenter?.phone ?? "",
    requesterEmail: costCenter?.requesterEmail ?? "",
    approverEmail: costCenter?.approverEmail ?? "",
    status: normalizeOrderStatus(order.status),
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount:
      order.totalAmount ?? items.reduce((sum, item) => sum + item.lineTotal, 0),
    note: order.note ?? "",
    createdAt: dateText(order.createdAt),
    updatedAt: dateText(order.updatedAt),
  };
}

function quantityFromForm(formData: FormData) {
  const quantity = Number(formData.get("quantity") ?? 1);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  return quantity;
}

function productImageUrl(product: DbProduct) {
  return (product.images ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]?.url;
}

function costCenterScopeFilter(role: Role, email: string) {
  if (role === "admin") return {};
  if (role === "approver") return { approverEmail: email };
  return { requesterEmail: email };
}

async function findAccessibleCostCenter(
  session: SessionUser,
  costCenterId: string,
) {
  if (!mongoose.isValidObjectId(costCenterId)) {
    throw new Error("Cost center is invalid");
  }

  const costCenter = await CostCenterModel.findOne({
    _id: costCenterId,
    ...costCenterScopeFilter(session.role, session.email),
  }).lean<DbCostCenter | null>();

  if (!costCenter) {
    throw new Error("Cost center is invalid");
  }

  return costCenter;
}

async function findActiveProduct(productId: string) {
  if (!mongoose.isValidObjectId(productId)) {
    throw new Error("Product id is invalid");
  }

  const product = await ProductModel.findOne({
    _id: productId,
    status: "active",
  }).lean<DbProduct | null>();

  if (!product) {
    throw new Error("Product was not found");
  }

  return product;
}

function orderAccessFilter(session: SessionUser) {
  if (session.role === "admin") {
    return {};
  }

  if (session.role === "approver") {
    return {};
  }

  return { user: session.id };
}

async function ensureApproverOrderAccess(session: SessionUser, order: DbOrder) {
  if (session.role !== "approver") {
    return;
  }

  const costCenter = dbCostCenter(order.costCenter);

  if (!costCenter || costCenter.approverEmail !== session.email) {
    throw new Error("Order was not found");
  }
}

export async function getCart() {
  const session = await requireRole(["admin", "requester"]);
  await connectDB();

  const cart = await CartModel.findOne({ user: session.id })
    .populate("costCenter", "code name address phone requesterEmail approverEmail")
    .lean<DbCart | null>();

  return toCartDto(cart);
}

export async function addToCart(formData: FormData) {
  const session = await requireRole(["admin", "requester"]);
  await connectDB();

  const productId = String(formData.get("productId") ?? "");
  const costCenterId = String(formData.get("costCenterId") ?? "");
  const quantity = quantityFromForm(formData);
  await findAccessibleCostCenter(session, costCenterId);
  const product = await findActiveProduct(productId);

  if (product.stock < quantity) {
    throw new Error("Product stock is not enough");
  }

  const cart = await CartModel.findOne({ user: session.id });
  const nextItem = {
    product: product._id,
    sku: product.sku,
    name: product.name,
    price: product.price,
    quantity,
    unit: product.unit ?? "",
    imageUrl: productImageUrl(product) ?? "",
  };

  if (!cart) {
    await CartModel.create({
      user: session.id,
      costCenter: costCenterId,
      items: [nextItem],
    });
    return;
  }

  if (cart.costCenter?.toString() !== costCenterId) {
    cart.costCenter = costCenterId;
    cart.items = [];
  }

  const item = cart.items.find(
    (cartItem: DbCartItem) => cartItem.product.toString() === productId,
  );

  if (item) {
    item.quantity = Math.min(item.quantity + quantity, product.stock);
    item.sku = product.sku;
    item.name = product.name;
    item.price = product.price;
    item.unit = product.unit ?? "";
    item.imageUrl = productImageUrl(product) ?? "";
  } else {
    cart.items.push(nextItem);
  }

  await cart.save();
}

export async function updateCartItem(formData: FormData) {
  const session = await requireRole(["admin", "requester"]);
  await connectDB();

  const productId = String(formData.get("productId") ?? "");
  const quantity = quantityFromForm(formData);
  const product = await findActiveProduct(productId);

  if (product.stock < quantity) {
    throw new Error("Product stock is not enough");
  }

  await CartModel.updateOne(
    { user: session.id, "items.product": productId },
    {
      $set: {
        "items.$.sku": product.sku,
        "items.$.name": product.name,
        "items.$.price": product.price,
        "items.$.quantity": quantity,
        "items.$.unit": product.unit ?? "",
        "items.$.imageUrl": productImageUrl(product) ?? "",
      },
    },
  );
}

export async function removeCartItem(formData: FormData) {
  const session = await requireRole(["admin", "requester"]);
  await connectDB();

  const productId = String(formData.get("productId") ?? "");

  if (!mongoose.isValidObjectId(productId)) {
    throw new Error("Product id is invalid");
  }

  await CartModel.updateOne(
    { user: session.id },
    { $pull: { items: { product: productId } } },
  );
}

export async function clearCart() {
  const session = await requireRole(["admin", "requester"]);
  await connectDB();

  await CartModel.updateOne(
    { user: session.id },
    { $set: { items: [], costCenter: null } },
  );
}

export async function checkoutCart(formData: FormData) {
  const session = await requireRole(["admin", "requester"]);
  await connectDB();

  const cart = await CartModel.findOne({ user: session.id }).lean<DbCart | null>();
  const items = cart?.items ?? [];
  const costCenterId = cart?.costCenter?.toString() ?? "";
  const costCenter = await findAccessibleCostCenter(session, costCenterId);

  if (items.length === 0) {
    throw new Error("Cart is empty");
  }

  const productIds = items.map((item) => item.product.toString());
  const products = await ProductModel.find({
    _id: { $in: productIds },
    status: "active",
  }).lean<DbProduct[]>();
  const productById = new Map(products.map((product) => [product._id.toString(), product]));

  const orderItems = items.map((item) => {
    const product = productById.get(item.product.toString());

    if (!product) {
      throw new Error(`${item.name} is not available`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`${item.name} stock is not enough`);
    }

    return {
      product: product._id,
      sku: product.sku,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      unit: product.unit ?? "",
      imageUrl: productImageUrl(product) ?? "",
    };
  });

  const totalAmount = orderItems.reduce((sum, item) => sum + lineTotal(item), 0);
  const note = String(formData.get("note") ?? "").trim();

  await OrderModel.create({
    orderNo: `OD-${Date.now()}`,
    user: session.id,
    costCenter: costCenter._id,
    status: "PENDING",
    items: orderItems,
    totalAmount,
    note,
  });

  await ProductModel.bulkWrite(
    orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: {
            stock: -item.quantity,
            soldCount: item.quantity,
          },
        },
      },
    })),
  );

  await CartModel.updateOne(
    { user: session.id },
    { $set: { items: [], costCenter: null } },
  );
}

export async function listOrders() {
  const session = await requireRole(["admin", "approver", "requester"]);
  await connectDB();

  const orders = await OrderModel.find(orderAccessFilter(session))
    .populate("user", "name email")
    .populate("costCenter", "code name address phone requesterEmail approverEmail")
    .sort({ createdAt: -1 })
    .lean<DbOrder[]>();

  const visibleOrders =
    session.role === "approver"
      ? orders.filter((order) => dbCostCenter(order.costCenter)?.approverEmail === session.email)
      : orders;

  return visibleOrders.map(toOrderDto);
}

export async function getOrder(id: string) {
  const session = await requireRole(["admin", "approver", "requester"]);
  await connectDB();

  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  const order = await OrderModel.findOne({
    _id: id,
    ...orderAccessFilter(session),
  })
    .populate("user", "name email")
    .populate("costCenter", "code name address phone requesterEmail approverEmail")
    .lean<DbOrder | null>();

  if (!order) {
    return null;
  }

  await ensureApproverOrderAccess(session, order);

  return toOrderDto(order);
}

export async function updateOrder(formData: FormData) {
  const session = await requireRole(["admin", "requester"]);
  await connectDB();

  const id = String(formData.get("id") ?? "");

  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Order id is invalid");
  }

  const order = await OrderModel.findOne({
    _id: id,
    ...orderAccessFilter(session),
  });

  if (!order || order.status === "PAID") {
    throw new Error("Order cannot be updated");
  }

  const bulkUpdates = [];

  for (const item of order.items as DbOrderItem[]) {
    const itemId = item._id?.toString() ?? "";
    const nextQuantity = Number(formData.get(`quantity-${itemId}`) ?? item.quantity);

    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
      throw new Error("Order quantity is invalid");
    }

    const product = await ProductModel.findById(item.product).lean<DbProduct | null>();

    if (!product) {
      throw new Error("Product was not found");
    }

    const availableQuantity = product.stock + item.quantity;

    if (nextQuantity > availableQuantity) {
      throw new Error(`${item.name} stock is not enough`);
    }

    const delta = nextQuantity - item.quantity;

    if (delta !== 0) {
      bulkUpdates.push({
        updateOne: {
          filter: { _id: item.product },
          update: {
            $inc: {
              stock: -delta,
              soldCount: delta,
            },
          },
        },
      });
    }

    item.quantity = nextQuantity;
  }

  if (bulkUpdates.length > 0) {
    await ProductModel.bulkWrite(bulkUpdates);
  }

  order.note = String(formData.get("note") ?? "").trim();
  order.status = dbOrderStatus(String(formData.get("status") ?? "pending"));
  order.totalAmount = (order.items as DbOrderItem[]).reduce(
    (sum, item) => sum + lineTotal(item),
    0,
  );
  await order.save();
}

export async function deleteOrder(formData: FormData) {
  const session = await requireRole(["admin", "requester"]);
  await connectDB();

  const id = String(formData.get("id") ?? "");

  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Order id is invalid");
  }

  const order = await OrderModel.findOne({
    _id: id,
    ...orderAccessFilter(session),
  });

  if (!order || order.status === "PAID") {
    throw new Error("Order cannot be deleted");
  }

  await ProductModel.bulkWrite(
    (order.items as DbOrderItem[]).map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: {
            stock: item.quantity,
            soldCount: -item.quantity,
          },
        },
      },
    })),
  );

  await OrderModel.findByIdAndDelete(id);
}
