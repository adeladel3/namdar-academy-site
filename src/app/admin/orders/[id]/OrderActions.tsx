"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Field,
  Input,
  Modal,
  Textarea,
  toast,
  useConfirm,
} from "@/components/admin/ui";
import type { OrderRecord } from "@/lib/db";
import { formatToman } from "@/lib/formatting";

export default function OrderActions({ order }: { order: OrderRecord }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [refundOpen, setRefundOpen] = useState(false);

  async function markPaid() {
    const ok = await confirm({
      title: "ثبت پرداخت دستی",
      message: "آیا از ثبت این سفارش به‌عنوان «پرداخت موفق» مطمئن هستید؟ کاربر بلافاصله به دوره دسترسی پیدا می‌کند.",
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/orders/${order.id}/mark-paid`, {
      method: "POST",
    });
    if (res.ok) {
      toast("سفارش به‌عنوان پرداخت شده ثبت شد", "ok");
      router.refresh();
    } else {
      toast("خطا در عملیات", "err");
    }
  }

  async function cancelOrder() {
    const ok = await confirm({
      title: "لغو سفارش",
      message: "این سفارش به «ناموفق» تغییر می‌کند. ادامه می‌دهید؟",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/orders/${order.id}/cancel`, {
      method: "POST",
    });
    if (res.ok) {
      toast("سفارش لغو شد", "ok");
      router.refresh();
    }
  }

  return (
    <>
      {dialog}
      <div className="space-y-2">
        {order.status === "pending" && (
          <>
            <Button
              variant="success"
              className="w-full"
              onClick={markPaid}
            >
              ثبت به‌عنوان پرداخت شده
            </Button>
            <Button variant="secondary" className="w-full" onClick={cancelOrder}>
              لغو سفارش
            </Button>
          </>
        )}

        {order.status === "paid" && (
          <>
            <Button
              variant="danger"
              className="w-full"
              onClick={() => setRefundOpen(true)}
            >
              استرداد وجه
            </Button>
            <div className="text-[11px] text-[#010514]/55 mt-2 leading-5">
              در صورت استرداد، دسترسی کاربر به دوره حفظ می‌ماند — برای
              قطع دسترسی، از صفحه پروفایل کاربر ثبت‌نام را حذف کنید.
            </div>
          </>
        )}

        {order.status === "failed" && (
          <Button
            variant="success"
            className="w-full"
            onClick={markPaid}
          >
            ثبت دستی به‌عنوان پرداخت شده
          </Button>
        )}
      </div>

      <RefundModal
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        order={order}
        onDone={() => {
          setRefundOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}

function RefundModal({
  open,
  onClose,
  order,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  order: OrderRecord;
  onDone: () => void;
}) {
  const max = order.finalAmount - (order.refundAmount ?? 0);
  const [amount, setAmount] = useState(max);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (amount <= 0 || amount > max) {
      toast("مبلغ نامعتبر", "err");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reason }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast(d.error ?? "خطا در استرداد", "err");
        return;
      }
      toast("استرداد ثبت شد", "ok");
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="استرداد وجه"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            انصراف
          </Button>
          <Button variant="danger" onClick={submit} disabled={busy}>
            {busy ? "..." : "ثبت استرداد"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-yellow-50 text-yellow-900 text-xs leading-6">
          این عملیات فقط به‌صورت داخلی ثبت می‌شود. برای استرداد فیزیکی، از
          طریق پنل بانک سامان اقدام کنید.
          <br />
          حداکثر قابل استرداد: <b>{formatToman(max)}</b>
        </div>
        <Field label="مبلغ استرداد (تومان)">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            dir="ltr"
            className="font-mono"
          />
        </Field>
        <Field label="دلیل (اختیاری)">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="مثلاً درخواست کاربر، خطای سیستم، ..."
          />
        </Field>
      </div>
    </Modal>
  );
}
