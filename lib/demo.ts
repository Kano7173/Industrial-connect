export const DEMO_ORDER_ID = "demo";

export function isDemoOrder(orderId: string) {
  return orderId === "demo" || orderId === DEMO_ORDER_ID;
}

export function getMockDeadline() {
  // 48 hours from now, rolling
  return new Date(Date.now() + 47 * 60 * 60 * 1000 + 32 * 60 * 1000);
}

export function getDemoOrder(role: "buyer" | "supplier" | "admin" = "buyer") {
  const deadline = getMockDeadline();
  return {
    id: "demo",
    orderNumber: "IC-2026-DEMO-4871",
    amount: { toNumber: () => 187500 } as any,
    currency: "INR",
    status: "DISPATCHED" as const,
    buyerId: "buyer-demo-id",
    supplierId: "supplier-demo-id",
    inspectionDeadlineAt: deadline,
    escrowLockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    completedAt: null,
    disputedAt: null,
    refundedAt: null,
    razorpayOrderId: "order_demo_razorpay_001",
    razorpayPaymentId: "pay_demo_001",
    bankReference: null as any,
    supplier: {
      id: "supplier-demo-id",
      name: "Ahmedabad Precision Works",
      email: "ops@ahmedabad-precision.in",
      role: "SUPPLIER" as const,
    },
    buyer: {
      id: "buyer-demo-id",
      name: "Gujarat Auto Components Pvt Ltd",
      email: "purchase@gujarat-auto.in",
      role: "BUYER" as const,
    },
    milestones: [
      {
        id: "m1",
        orderId: "demo",
        stepName: "RAW_MATERIAL_BILL",
        fileUrl: "https://via.placeholder.com/800x400?text=Raw+Material+Bill+PDF",
        uploadedBy: "SUPPLIER" as const,
        uploadedByUserId: "supplier-demo-id",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: "m2",
        orderId: "demo",
        stepName: "FACTORY_VIDEO",
        fileUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        uploadedBy: "SUPPLIER" as const,
        uploadedByUserId: "supplier-demo-id",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: "m3",
        orderId: "demo",
        stepName: "LR_COPY",
        fileUrl: "https://via.placeholder.com/800x400?text=LR+Dispatch+Copy",
        uploadedBy: "SUPPLIER" as const,
        uploadedByUserId: "supplier-demo-id",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    ],
    disputes: [] as any[],
    payout: null as any,
    payments: [
      {
        id: "pay1",
        orderId: "demo",
        provider: "RAZORPAY",
        amount: { toNumber: () => 187500 } as any,
        status: "CAPTURED",
        method: "UPI",
        providerPaymentId: "pay_demo_001",
      },
    ],
  };
}

export const DEMO_USER_BUYER = {
  id: "buyer-demo-id",
  name: "Demo Buyer",
  email: "buyer@demo.industrialconnect.in",
  role: "BUYER" as const,
  razorpayLinkedAccountId: null,
  createdAt: new Date(),
};

export const DEMO_USER_SUPPLIER = {
  id: "supplier-demo-id",
  name: "Demo Supplier",
  email: "supplier@demo.industrialconnect.in",
  role: "SUPPLIER" as const,
  razorpayLinkedAccountId: null,
  createdAt: new Date(),
};

export const DEMO_USER_ADMIN = {
  id: "admin-demo-id",
  name: "Demo Admin",
  email: "admin@demo.industrialconnect.in",
  role: "ADMIN" as const,
  razorpayLinkedAccountId: null,
  createdAt: new Date(),
};
