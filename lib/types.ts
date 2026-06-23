export type Role = "admin" | "approver" | "requester";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type SessionUser = Omit<User, "password">;

export type ProcurementStatus = "draft" | "pending" | "approved" | "rejected";

export type ProcurementRequest = {
  id: string;
  title: string;
  department: string;
  amount: number;
  requesterId: string;
  approverId?: string;
  costCenterId?: string;
  costCenterCode?: string;
  costCenterName?: string;
  status: ProcurementStatus;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  code: string;
  name: string;
  parentId?: string;
  parentCode?: string;
  parentName?: string;
  level: number;
  childCount: number;
  displayName: string;
  createdAt: string;
};

export type ProductStatus = "active" | "inactive" | "draft";

export type ProductImage = {
  url: string;
  publicId: string;
  order: number;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  unit: string;
  brand: string;
  weight?: number;
  tags: string[];
  status: ProductStatus;
  minOrderQty: number;
  soldCount: number;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

export type CartItem = {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
  lineTotal: number;
};

export type Cart = {
  id: string;
  costCenterId?: string;
  costCenterCode?: string;
  costCenterName?: string;
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  updatedAt: string;
};

export type OrderStatus = "pending" | "paid" | "cancelled";

export type OrderItem = {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
  lineTotal: number;
};

export type Order = {
  id: string;
  orderNo: string;
  requesterId: string;
  requesterName: string;
  costCenterId: string;
  costCenterCode: string;
  costCenterName: string;
  costCenterAddress: string;
  costCenterPhone: string;
  requesterEmail: string;
  approverEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  itemCount: number;
  totalAmount: number;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type CostCenter = {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  requesterName: string;
  requesterEmail: string;
  approverName: string;
  approverEmail: string;
  createdAt: string;
};

export type MenuItem = {
  label: string;
  href: string;
  roles: Role[];
};
