export function jsonOK(data = {}, status = 200) {
  return new Response(
    JSON.stringify({ ok: true, ...data }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export function jsonErr(message, status = 400, details = null) {
  return new Response(
    JSON.stringify({
      ok: false,
      message,
      status,
      details,
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export function getServerPrefix(apiKey = "") {
  const m = String(apiKey || "").trim().match(/-([a-z0-9]+)$/i);
  return m ? m[1] : "";
}

export function getAuthHeader(apiKey) {
  const token = Buffer.from(`anystring:${apiKey}`, "utf8").toString("base64");
  return `Basic ${token}`;
}

export function getMailchimpConfig() {
  const apiKey = String(process.env.MAILCHIMP_API_KEY || "").trim();

  const serverPrefix = String(process.env.MAILCHIMP_SERVER_PREFIX || "").trim() || getServerPrefix(apiKey);

  if (!apiKey) {
    throw new Error("MAILCHIMP_API_KEY missing in .env.local");
  }

  if (!serverPrefix) {
    throw new Error("Invalid Mailchimp server prefix. Ensure key ends with -usXX or set MAILCHIMP_SERVER_PREFIX." );
  }

  const baseUrl = `https://${serverPrefix}.api.mailchimp.com/3.0`;

  return {
    apiKey,
    serverPrefix,
    baseUrl,
    authHeader: getAuthHeader(apiKey),
  };
}

export async function mailchimpFetch(path, { method = "GET", body = null } = {}) {
  const { baseUrl, authHeader } = getMailchimpConfig();

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      details: data,
    };
  }

  return {
    ok: true,
    status: 200,
    data,
  };
}

export async function mailchimpFetchAll(path, pageSize = 1000) {
  const allItems = [];
  let offset = 0;
  let total = null;

  while (true) {
    const joiner = path.includes("?") ? "&" : "?";

    const r = await mailchimpFetch(`${path}${joiner}count=${pageSize}&offset=${offset}`);

    if (!r.ok) {
      return r;
    }

    const items =
      r.data.templates ||
      r.data.lists ||
      r.data.members ||
      r.data.campaigns ||      // NEW
      r.data.segments ||       // optional future
      r.data.automations ||    // optional future
      [];

    allItems.push(...items);

    total = r.data.total_items ?? allItems.length;

    if (allItems.length >= total) break;

    offset += pageSize;
  }

  return {
    ok: true,
    status: 200,
    data: allItems,
    total_items: total,
  };
}