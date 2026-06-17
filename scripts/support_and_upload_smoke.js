#!/usr/bin/env node
const fs = require("fs");

const BASE_API = "http://127.0.0.1:8000/api";
const BASE_WS = "ws://127.0.0.1:8000/api/home/ws/support-chat";

async function api(token, method, path, body, extraHeaders = {}) {
  const headers = {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
  const init = { method, headers };
  if (body !== undefined) {
    if (body instanceof FormData) {
      init.body = body;
    } else {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }
  }
  const res = await fetch(`${BASE_API}${path}`, init);
  const text = await res.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  return { ok: res.ok, status: res.status, data: parsed };
}

function connectWs(token) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${BASE_WS}?token=${encodeURIComponent(token)}`);
    ws.onopen = () => resolve(ws);
    ws.onerror = reject;
  });
}

function waitForEvent(ws, matcher, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeEventListener("message", onMessage);
      reject(new Error("Timeout waiting websocket event"));
    }, timeout);
    const onMessage = (event) => {
      const payload = JSON.parse(event.data.toString());
      if (!matcher(payload)) return;
      clearTimeout(timer);
      ws.removeEventListener("message", onMessage);
      resolve(payload);
    };
    ws.addEventListener("message", onMessage);
  });
}

function log(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " " + detail : ""}`);
}

async function main() {
  const setupPath = process.argv[2] || "/tmp/full_api_smoke_setup.json";
  const setup = JSON.parse(fs.readFileSync(setupPath, "utf8"));
  const suffix = Date.now().toString().slice(-6);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const state = {};

  let failed = false;
  const mark = (name, ok, detail = "") => {
    log(name, ok, detail);
    if (!ok) failed = true;
  };

  const serviceRes = await api(setup.admin_token, "POST", "/home/services", {
    name: `Support Smoke ${suffix}`,
    category: "Test",
    description: "support smoke",
    unit: "kg",
    price: 10000,
    turnaround_hours: 24,
    status: "active",
    promotion_enabled: false,
    inventory_items: [],
  });
  mark("create service", serviceRes.ok, JSON.stringify(serviceRes.data));
  if (!serviceRes.ok) return process.exit(1);
  state.service_id = serviceRes.data.service_id;
  state.service_code = serviceRes.data.service_code;

  const orderRes = await api(setup.admin_token, "POST", "/home/orders", {
    customer_id: setup.customer_id,
    customer_code: setup.customer_code,
    customer_name: setup.full_name,
    customer_phone: setup.phone,
    pickup_address: "Support pickup",
    delivery_address: "Support delivery",
    service_id: state.service_id,
    service_code: state.service_code,
    service_name: `Support Smoke ${suffix}`,
    quantity: "1",
    total_amount: 10000,
    status: "Đã nhận",
    wash_date: tomorrow,
    due_at: `${tomorrow}T10:00:00`,
    assigned_staff: "Admin User",
    payment_method: "Tiền mặt",
    note: "support smoke order",
    extra_fields: {
      serviceUnit: "kg",
      unitPrice: "10000",
      originalAmount: "10000",
      discountValue: "",
      discountAmount: "0",
    },
  });
  mark("create order", orderRes.ok, JSON.stringify(orderRes.data));
  if (!orderRes.ok) return process.exit(1);
  state.order_id = orderRes.data.order_id;
  state.order_code = orderRes.data.order_code;

  const ticketRes = await api(setup.user_token, "POST", "/home/support-tickets", {
    type: "Hỏng đồ",
    subject: `Ticket ${suffix}`,
    note: "Initial support note",
    order_code: state.order_code,
    priority: "Trung bình",
  });
  mark("create support ticket", ticketRes.ok, JSON.stringify(ticketRes.data));
  if (!ticketRes.ok) return process.exit(1);
  state.ticket_id = ticketRes.data.ticket_id;

  const adminWs = await connectWs(setup.admin_token);
  const userWs = await connectWs(setup.user_token);

  userWs.send(JSON.stringify({
    type: "send_support_message",
    ticket_id: state.ticket_id,
    content: "Websocket hello from user",
  }));
  const createdFromUser = await waitForEvent(adminWs, (event) => event.type === "support_message_created" && event.ticket_id === state.ticket_id);
  mark("ws user->admin message", !!createdFromUser?.message?.content, createdFromUser?.message?.content || "");
  state.user_message_id = createdFromUser.message.message_id;

  adminWs.send(JSON.stringify({
    type: "send_support_message",
    ticket_id: state.ticket_id,
    content: "Admin reply message",
    reply_to: {
      id: state.user_message_id,
      sender: "customer",
      content: "Websocket hello from user",
    },
  }));
  const createdFromAdmin = await waitForEvent(userWs, (event) => event.type === "support_message_created" && event.message?.content === "Admin reply message");
  mark("ws admin reply", createdFromAdmin?.message?.reply_to?.id === state.user_message_id, JSON.stringify(createdFromAdmin?.message?.reply_to || null));
  state.admin_message_id = createdFromAdmin.message.message_id;

  adminWs.send(JSON.stringify({
    type: "update_support_message",
    message_id: state.user_message_id,
    action: "react",
    reaction: "👍",
  }));
  const reacted = await waitForEvent(userWs, (event) => event.type === "support_message_updated" && event.message?.message_id === state.user_message_id);
  mark("ws reaction", reacted?.message?.reaction === "👍", JSON.stringify(reacted?.message || null));

  adminWs.send(JSON.stringify({
    type: "update_support_message",
    message_id: state.admin_message_id,
    action: "revoke",
  }));
  const revoked = await waitForEvent(userWs, (event) => event.type === "support_message_updated" && event.message?.message_id === state.admin_message_id);
  mark("ws revoke", revoked?.message?.revoked === true, JSON.stringify(revoked?.message || null));

  const imageRes = await api(setup.admin_token, "POST", `/home/support-tickets/${state.ticket_id}/messages`, {
    content: "",
    image_url: "https://pub-mockup-r2.r2.dev/test/support-image.png",
  });
  mark("support image_url message", imageRes.ok, JSON.stringify(imageRes.data));

  await new Promise((resolve) => setTimeout(resolve, 250));
  const ticketsRes = await api(setup.admin_token, "GET", "/home/support-tickets/full");
  const ticket = ticketsRes.data.find((item) => item.ticket_id === state.ticket_id);
  const hasReply = (ticket?.messages || []).some((message) => message.reply_to?.id === state.user_message_id);
  const hasReaction = (ticket?.messages || []).some((message) => message.message_id === state.user_message_id && message.reaction === "👍");
  const hasRevoked = (ticket?.messages || []).some((message) => message.message_id === state.admin_message_id && message.revoked === true);
  const hasImage = (ticket?.messages || []).some((message) => message.image_url);
  mark("support full contains reply", hasReply);
  mark("support full contains reaction", hasReaction);
  mark("support full contains revoked", hasRevoked);
  mark("support full contains image", hasImage);

  const pngBytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8B8mQAAAAASUVORK5CYII=",
    "base64",
  );
  const form = new FormData();
  form.append("file", new File([pngBytes], "smoke.png", { type: "image/png" }));
  const avatarRes = await api(setup.user_token, "POST", "/auth/upload-avatar", form);
  const avatarUrl = avatarRes.data?.image_url || "";
  const looksLikeCloud = typeof avatarUrl === "string" && (avatarUrl.includes(".r2.dev/") || avatarUrl.includes("cloudflarestorage.com"));
  mark("avatar upload", avatarRes.ok, avatarUrl);
  mark("avatar URL cloud/mock", looksLikeCloud, avatarUrl);

  userWs.close();
  adminWs.close();

  if (state.ticket_id) await api(setup.admin_token, "DELETE", `/home/support-tickets/${state.ticket_id}`);
  if (state.order_id) await api(setup.admin_token, "DELETE", `/home/orders/${state.order_id}`);
  if (state.service_id) await api(setup.admin_token, "DELETE", `/home/services/${state.service_id}`);

  if (failed) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
