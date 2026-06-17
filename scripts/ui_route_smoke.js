#!/usr/bin/env node
const fs = require("fs");

async function getJson(url, method = "GET") {
  const res = await fetch(url, { method });
  return JSON.parse(await res.text());
}

async function connectPage() {
  const pageInfo = await getJson("http://127.0.0.1:9222/json/new?" + encodeURIComponent("about:blank"), "PUT");
  const ws = new WebSocket(pageInfo.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let id = 0;
  const pending = new Map();
  const events = {};

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data.toString());
    if (msg.id) {
      const item = pending.get(msg.id);
      if (!item) return;
      pending.delete(msg.id);
      if (msg.error) item.reject(new Error(JSON.stringify(msg.error)));
      else item.resolve(msg.result);
      return;
    }
    (events[msg.method] || []).forEach((fn) => fn(msg.params));
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = ++id;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

  const once = (method, timeout = 20000) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${method}`)), timeout);
      const fn = (params) => {
        clearTimeout(timer);
        events[method] = (events[method] || []).filter((item) => item !== fn);
        resolve(params);
      };
      (events[method] ||= []).push(fn);
    });

  await send("Page.enable");
  await send("Runtime.enable");
  return { ws, send, once };
}

async function evalValue(page, expression) {
  const res = await page.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  return res.result ? res.result.value : undefined;
}

async function navigate(page, url) {
  const loaded = page.once("Page.loadEventFired", 30000);
  await page.send("Page.navigate", { url });
  await loaded;
  await new Promise((resolve) => setTimeout(resolve, 1800));
}

async function waitFor(page, label, predicateExpr, timeout = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evalValue(page, predicateExpr)) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  const body = await evalValue(page, 'document.body ? document.body.innerText.slice(0, 2500) : ""');
  throw new Error(`Timeout waiting for ${label}. Body: ${String(body || "").replace(/\n+/g, " | ")}`);
}

async function setSession(page, role, token, username) {
  const tokenKey = role === "admin" ? "adminToken" : "userToken";
  await evalValue(
    page,
    `
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("token", ${JSON.stringify(token)});
      sessionStorage.setItem("token", ${JSON.stringify(token)});
      localStorage.setItem("role", ${JSON.stringify(role)});
      sessionStorage.setItem("role", ${JSON.stringify(role)});
      localStorage.setItem(${JSON.stringify(tokenKey)}, ${JSON.stringify(token)});
      sessionStorage.setItem(${JSON.stringify(tokenKey)}, ${JSON.stringify(token)});
      localStorage.setItem("username", ${JSON.stringify(username)});
      sessionStorage.setItem("username", ${JSON.stringify(username)});
      true;
    `,
  );
}

async function run() {
  const setupPath = process.argv[2] || "/tmp/full_api_smoke_setup.json";
  const baseUrl = process.argv[3] || "http://127.0.0.1:3000";
  const setup = JSON.parse(fs.readFileSync(setupPath, "utf8"));
  const page = await connectPage();
  const results = [];

  const check = async (name, fn) => {
    const started = Date.now();
    try {
      await fn();
      console.log(`PASS ${Date.now() - started}ms ${name}`);
      results.push({ name, ok: true });
    } catch (error) {
      console.log(`FAIL ${Date.now() - started}ms ${name} :: ${error.message}`);
      results.push({ name, ok: false, error: error.message });
    }
  };

  await check("Public /login", async () => {
    await navigate(page, `${baseUrl}/login`);
    await waitFor(page, "login", `document.body.innerText.includes("Đăng nhập") && document.body.innerText.includes("Tên đăng nhập")`);
  });

  await check("Public /", async () => {
    await navigate(page, `${baseUrl}/`);
    await waitFor(page, "landing", `document.body.innerText.length > 100`);
  });

  await check("Public /services", async () => {
    await navigate(page, `${baseUrl}/services`);
    await waitFor(page, "services", `document.body.innerText.length > 100`);
  });

  await check("Admin /home", async () => {
    await setSession(page, "admin", setup.admin_token, setup.admin_username);
    await navigate(page, `${baseUrl}/home`);
    await waitFor(page, "admin dashboard", `location.pathname === "/home" && document.body.innerText.includes("Đơn sắp tới hẹn")`);
  });

  for (const [route, label] of [
    ["/home/orders", "Đơn hàng"],
    ["/home/customers", "Khách hàng"],
    ["/home/services", "Dịch vụ"],
    ["/home/support", "Hỗ trợ"],
    ["/home/staff", "Kho vật tư"],
    ["/home/reports", "Báo cáo"],
    ["/home/delivery", "Chuyến đi"],
  ]) {
    await check(`Admin ${route}`, async () => {
      await navigate(page, `${baseUrl}${route}`);
      await waitFor(page, route, `location.pathname === ${JSON.stringify(route)} && document.body.innerText.includes(${JSON.stringify(label)})`);
    });
  }

  await check("User /user", async () => {
    await setSession(page, "customer", setup.user_token, setup.username);
    await navigate(page, `${baseUrl}/user`);
    await waitFor(page, "user dashboard", `location.pathname === "/user" && document.body.innerText.includes("Ưu đãi & điểm")`);
  });

  for (const [route, label] of [
    ["/user/orders", "Bảng đơn hàng"],
    ["/user/bookings", "Tạo lịch"],
    ["/user/loyalty", "Thêm mã"],
    ["/user/support", "Gửi yêu cầu"],
  ]) {
    await check(`User ${route}`, async () => {
      await navigate(page, `${baseUrl}${route}`);
      await waitFor(page, route, `location.pathname === ${JSON.stringify(route)} && document.body.innerText.includes(${JSON.stringify(label)})`);
    });
  }

  const failed = results.filter((item) => !item.ok);
  console.log(`SUMMARY total=${results.length} failed=${failed.length}`);
  page.ws.close();
  process.exitCode = failed.length ? 1 : 0;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
