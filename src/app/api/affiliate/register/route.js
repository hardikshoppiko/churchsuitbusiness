import crypto from "node:crypto";

import { db } from "@/lib/db";
import {
  generateSalt,
  ocHashPassword,
  dbEscape,
  stripWebsite,
  isEmail,
  isTenDigitPhone,
  ocSerialize,
  isTruthy,
  getClientIp,
} from "@/lib/db-utils";

function stableStringify(obj) {
  const allKeys = [];
  JSON.stringify(obj, (k, v) => (allKeys.push(k), v));
  allKeys.sort();
  return JSON.stringify(obj, allKeys);
}

function hashPayload(obj) {
  const s = stableStringify(obj);
  return crypto.createHash("sha1").update(s).digest("hex");
}

export async function recordAffiliateActivity({
  affiliate_id,
  key,
  data = {},
  ip = "",
}) {
  const aid = Number(affiliate_id || 0);
  if (!aid || !key) return false;

  const payload = { ...data, _hash: hashPayload(data) };
  const json = JSON.stringify(payload);

  const sql = `
    INSERT INTO affiliate_activity
      (affiliate_id, \`key\`, data, ip, date_added)
    VALUES
      ('${aid}', '${String(key).replaceAll("'", "''")}', '${json.replaceAll("'", "''")}', '${String(ip).replaceAll("'", "''")}', NOW())
    ON DUPLICATE KEY UPDATE
      data = VALUES(data),
      ip = VALUES(ip),
      date_added = NOW()
  `;

  await db.query(sql);
  return true;
}

async function installModule(type, code, affiliate_id) {
  const sql = `
    INSERT INTO affiliate_extension SET
      affiliate_id='${Number(affiliate_id)}',
      \`type\`='${dbEscape(type)}',
      \`code\`='${dbEscape(code)}'
  `;
  const [res] = await db.query(sql);
  return res.insertId;
}

async function addAffiliateSettings(code, data, affiliate_id = 0) {
  await db.query(`
    DELETE FROM affiliate_setting
    WHERE affiliate_id='${Number(affiliate_id)}'
      AND \`code\`='${dbEscape(code)}'
  `);

  for (const [key, value] of Object.entries(data || {})) {
    if (!String(key).startsWith(code)) continue;

    if (value === null || value === undefined || typeof value !== "object") {
      await db.query(`
        INSERT INTO affiliate_setting SET
          affiliate_id='${Number(affiliate_id)}',
          \`code\`='${dbEscape(code)}',
          \`key\`='${dbEscape(key)}',
          \`value\`='${dbEscape(value)}',
          serialized='0'
      `);
    } else {
      const serialized = ocSerialize(value);

      await db.query(`
        INSERT INTO affiliate_setting SET
          affiliate_id='${Number(affiliate_id)}',
          \`code\`='${dbEscape(code)}',
          \`key\`='${dbEscape(key)}',
          \`value\`='${dbEscape(serialized)}',
          serialized='1'
      `);
    }
  }
}

async function getAffiliateBasicSettings() {
  const sql = `SELECT \`key\`, \`value\` FROM affiliate_basic_setting WHERE \`code\`='affiliate_basic'`;
  const [rows] = await db.query(sql);

  if (!rows || rows.length === 0) return {};

  const settings = {};
  for (const row of rows) settings[row.key] = row.value;
  return settings;
}

async function addAffiliateCategory(affiliate_id) {
  const categories = [];

  for (let i = 0; i < 2; i++) {
    const name = `Category ${i + 1}`;

    const sql = `
      INSERT INTO category SET
      category_old_id=0,
      category_child_old_id=0,
      affiliate_id='${Number(affiliate_id)}',
      name='${dbEscape(name)}',
      name_affiliate='',
      description='Category',
      meta_title='Category',
      meta_description='Category',
      meta_keyword='Category',
      shopify_tag='',
      export_product_to_shopify=0,
      is_shopify_product_update_forcefully=0,
      dcs_brief='',
      dcs_detail='',
      dcs_short='',
      is_description_mobile=0,
      is_not_for_wholesale=0,
      is_not_for_affiliate=0,
      image='',
      image_path='',
      image_affiliate='',
      folder_name='',
      parent_id=0,
      top=1,
      is_catalog=0,
      is_special=0,
      is_women=0,
      is_men=0,
      is_accessories=0,
      \`column\`=0,
      sort_order='${i + 1}',
      status=1,
      date_added=NOW(),
      date_modified=NOW()
    `;

    const [res] = await db.query(sql);
    const category_id = res.insertId;

    categories.push(category_id);

    await db.query(`
      INSERT INTO category_path SET
        category_id='${Number(category_id)}',
        path_id='${Number(category_id)}',
        level='0'
    `);
  }

  return categories;
}

async function addAffiliateProducts(affiliate_id, categories = []) {
  const products = [];

  for (let i = 0; i < 4; i++) {
    const name = `Product ${i + 1}`;

    const sql = `
      INSERT INTO product SET
        product_old_id=0,
        affiliate_id='${Number(affiliate_id)}',
        name='${dbEscape(name)}',
        description='${dbEscape(name)}',
        meta_title='${dbEscape(name)}',
        meta_description='${dbEscape(name)}',
        meta_keyword='${dbEscape(name)}',
        model='',
        sku='',
        upc='',
        ean='',
        jan='',
        isbn='',
        mpn='',
        location='',
        quantity='1000',
        stock_status_id=0,
        image='affiliate_images/demo-product.jpg',
        image_path='',
        file_name='',
        is_large_image_found=0,
        is_image_background_is_white=0,
        video='',
        manufacturer_id=0,
        brand_id=0,
        shipping=1,
        price='100',
        price_retail='125',
        price_original='150',
        is_men=0,
        points=0,
        tax_class_id=0,
        date_available=NOW(),
        weight='0.000',
        weight_class_id=0,
        length='0.000',
        width='0.000',
        height='0.000',
        length_class_id=0,
        subtract=0,
        minimum='1',
        sort_order='${i + 1}',
        status='1',
        viewed=0,
        is_product_modified=0,
        is_web_scrape_product_verify=0,
        date_added=NOW(),
        date_modified=NOW()
    `;

    const [res] = await db.query(sql);
    const product_id = res.insertId;

    products.push(product_id);

    if (categories && categories.length) {
      for (const category_id of categories) {
        await db.query(`
          INSERT INTO product_to_category SET
            product_id='${Number(product_id)}',
            category_id='${Number(category_id)}'
        `);
      }
    }
  }

  return products;
}

async function addAffiliatePages(affiliate_id, pages = []) {
  for (const page of pages) {
    const sql = `
      INSERT INTO information SET
        affiliate_id='${Number(affiliate_id)}',
        title='${dbEscape(page.name)}',
        description='${dbEscape(page.description)}',
        description_top='',
        short='',
        meta_title='${dbEscape(page.meta_title)}',
        meta_description='${dbEscape(page.meta_description)}',
        meta_keyword='',
        image='',
        image_mobile='',
        top='0',
        bottom='1',
        affiliate=0,
        catalog='',
        trending_product_title='',
        trending_product_status=0,
        trending_categories='',
        sort_order='${Number(page.sort_order || 0)}',
        status='${Number(page.status || 0)}'
    `;
    await db.query(sql);
  }
}

async function addLargeBanners(affiliate_id) {
  const sliders = {
    code: "slideshow",
    module_name: "Home Page Slideshow",
    width: "1900",
    height: "700",
    sort_order: "1",
    status: "1",
    slideshow_images: [
      { title: "First", link: "index.php?route=product/catalog", image: "catalog/banner/1.jpg", sort_order: 1 },
      { title: "Second", link: "index.php?route=product/catalog", image: "catalog/banner/2.jpg", sort_order: 2 },
    ],
  };

  const settings = ocSerialize(sliders);

  const sql = `
    INSERT INTO page_builder SET
      affiliate_id='${Number(affiliate_id)}',
      page_id=0,
      module_name='${dbEscape(sliders.module_name)}',
      \`code\`='${dbEscape(sliders.code)}',
      \`setting\`='${dbEscape(settings)}',
      location_type=0,
      sort_order='${Number(sliders.sort_order)}',
      status='${Number(sliders.status)}',
      date_added=NOW(),
      date_modified=NOW(),
      user_added=0,
      user_modified=0,
      is_delete=0
  `;
  await db.query(sql);
}

async function addSmallBanners(affiliate_id) {
  const banners = {
    code: "banner",
    module_name: "Home Page Banners",
    width: "380",
    height: "270",
    sort_order: "2",
    status: "1",
    banner_images: [
      { title: "Womens", link: "index.php?route=product/womens", image: "catalog/banner-small/1.jpg", sort_order: 1 },
      { title: "Mens", link: "index.php?route=product/mens", image: "catalog/banner-small/2.jpg", sort_order: 2 },
      { title: "Accessories", link: "index.php?route=product/accessories", image: "catalog/banner-small/3.jpg", sort_order: 3 },
    ],
  };

  const settings = ocSerialize(banners);

  const sql = `
    INSERT INTO page_builder SET
      affiliate_id='${Number(affiliate_id)}',
      page_id=0,
      module_name='${dbEscape(banners.module_name)}',
      \`code\`='${dbEscape(banners.code)}',
      \`setting\`='${dbEscape(settings)}',
      location_type=0,
      sort_order='${Number(banners.sort_order)}',
      status='${Number(banners.status)}',
      date_added=NOW(),
      date_modified=NOW(),
      user_added=0,
      user_modified=0,
      is_delete=0
  `;
  await db.query(sql);
}

async function getChildCategories(parent_id) {
  const sql = `
    SELECT category_id
    FROM category
    WHERE parent_id='${Number(parent_id)}' AND status=1
    ORDER BY sort_order ASC, category_id ASC
  `;
  const [rows] = await db.query(sql);
  return (rows || []).map((r) => Number(r.category_id));
}

function pickRandom(arr = []) {
  if (!arr.length) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

async function addCategoryProductsModule(affiliate_id) {
  const women_categories = await getChildCategories(1);
  const accessaries_category = await getChildCategories(434);
  const men_categories = await getChildCategories(493);

  const selectedWomen = pickRandom(women_categories);
  const selectedAccessories = pickRandom(accessaries_category);
  const selectedMen = pickRandom(men_categories);

  const category_product_module = {
    code: "category_product_module",
    module_name: "Latest Category Products",
    category: "",
    categories: [],
    limit: 4,
    width: 200,
    height: 200,
    sort_order: 3,
    status: 1,
  };

  if (selectedWomen) category_product_module.categories.push(selectedWomen);
  if (selectedAccessories) category_product_module.categories.push(selectedAccessories);
  if (selectedMen) category_product_module.categories.push(selectedMen);

  const setting = ocSerialize(category_product_module);

  const sql = `
    INSERT INTO page_builder SET
      affiliate_id='${Number(affiliate_id)}',
      page_id=0,
      module_name='${dbEscape(category_product_module.module_name)}',
      \`code\`='${dbEscape(category_product_module.code)}',
      \`setting\`='${dbEscape(setting)}',
      location_type=0,
      sort_order='${Number(category_product_module.sort_order)}',
      status='${Number(category_product_module.status)}',
      date_added=NOW(),
      date_modified=NOW(),
      user_added=0,
      user_modified=0,
      is_delete=0
  `;
  await db.query(sql);
}

async function getAffiliateById(affiliate_id) {
  const affId = Number(affiliate_id);
  if (!affId) return null;
  const [rows] = await db.query(`SELECT * FROM affiliate WHERE affiliate_id=${affId} LIMIT 1`);
  return rows?.[0] || null;
}

function makeTempStoreName() {
  return `TEMP-${Date.now()}`;
}

/* =========================
   New draft/completed helpers
========================= */
async function getCompletedAffiliateByEmail(email, excludeAffiliateId = 0) {
  const excludeSql = excludeAffiliateId
    ? `AND affiliate_id <> ${Number(excludeAffiliateId)}`
    : "";

  const [rows] = await db.query(`
    SELECT affiliate_id
    FROM affiliate
    WHERE LOWER(email)=LOWER('${dbEscape(email)}')
      AND IFNULL(is_registration_completed, 0) = 1
      ${excludeSql}
    LIMIT 1
  `);

  return rows?.[0] || null;
}

async function getCompletedAffiliateByTelephone(telephone, excludeAffiliateId = 0) {
  const excludeSql = excludeAffiliateId
    ? `AND affiliate_id <> ${Number(excludeAffiliateId)}`
    : "";

  const [rows] = await db.query(`
    SELECT affiliate_id
    FROM affiliate
    WHERE telephone='${dbEscape(telephone)}'
      AND IFNULL(is_registration_completed, 0) = 1
      ${excludeSql}
    LIMIT 1
  `);

  return rows?.[0] || null;
}

async function getDraftAffiliateByEmailAndTelephone(email, telephone) {
  const [rows] = await db.query(`
    SELECT *
    FROM affiliate
    WHERE LOWER(email)=LOWER('${dbEscape(email)}')
      AND telephone='${dbEscape(telephone)}'
      AND IFNULL(is_registration_completed, 0) = 0
    ORDER BY affiliate_id DESC
    LIMIT 1
  `);

  return rows?.[0] || null;
}

async function completeAutomationConversion({
  affiliate_id,
  affiliate_status_id = 0,
  automation_source = "",
  send_log_id = 0,
}) {
  const affiliateId = Number(affiliate_id || 0);
  const affiliateStatusId = Number(affiliate_status_id || 0);
  const sendLogId = Number(send_log_id || 0);
  const automationSource = String(automation_source || "").trim();

  if (!affiliateId || !sendLogId || !automationSource) {
    return false;
  }

  await db.query(`
    UPDATE affiliate
    SET stop_automation = 1
    WHERE affiliate_id = '${affiliateId}'
    LIMIT 1
  `);

  if (automationSource === "affiliate") {
    await db.query(`
      UPDATE affiliate_automation_send_log
      SET
        converted = 1,
        converted_at = NOW(),
        converted_affiliate_id = '${affiliateId}',
        converted_status_id = ${affiliateStatusId || "NULL"},
        conversion_source_send_log_id = '${sendLogId}'
      WHERE send_log_id = '${sendLogId}'
      LIMIT 1
    `);

    return true;
  }

  if (automationSource === "newsletter") {
    const [rows] = await db.query(`
      SELECT affiliate_newsletter_id
      FROM affiliate_automation_newsletter_send_log
      WHERE send_log_id = '${sendLogId}'
      LIMIT 1
    `);

    const newsletter = rows?.[0] || null;

    if (newsletter?.affiliate_newsletter_id) {
      await db.query(`
        UPDATE affiliate_newsletter
        SET
          is_registered = 1,
          converted_affiliate_id = '${affiliateId}',
          converted_at = NOW()
        WHERE affiliate_newsletter_id = '${Number(newsletter.affiliate_newsletter_id)}'
        LIMIT 1
      `);
    }

    await db.query(`
      UPDATE affiliate_automation_newsletter_send_log
      SET
        converted = 1,
        converted_at = NOW(),
        converted_affiliate_id = '${affiliateId}',
        converted_status_id = ${affiliateStatusId || "NULL"},
        conversion_source_send_log_id = '${sendLogId}'
      WHERE send_log_id = '${sendLogId}'
      LIMIT 1
    `);

    return true;
  }

  return false;
}

async function godaddyCheckDomain(domainRaw) {
  const json = {};

  const domain_name = String(domainRaw || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "");

  const domainOk = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain_name);
  if (!domainOk) {
    json.error = "Warning: Please enter valid URL!";
    return json;
  }

  const API_KEY = process.env.GODADDY_API_KEY;
  const API_SECRET = process.env.GODADDY_API_SECRET;
  const BASE_URL = process.env.GODADDY_BASE_URL || "https://api.godaddy.com";

  if (!API_KEY || !API_SECRET) {
    json.error = "GoDaddy API credentials missing";
    return json;
  }

  const header = {
    Authorization: `sso-key ${API_KEY}:${API_SECRET}`,
    "Content-Type": "application/json",
  };

  const url = `${BASE_URL}/v1/domains/available?domain=${encodeURIComponent(domain_name)}&checkType=FAST&forTransfer=false`;

  const res = await fetch(url, { method: "GET", headers: header, cache: "no-store" });
  const final_result = await res.json().catch(() => ({}));

  if (final_result?.code === "ACCESS_DENIED") {
    json.error = "GoDaddy ACCESS_DENIED";
    return json;
  }

  if (final_result?.available === true) {
    json.success = true;
    json.domain_found = "Congratulation, domain available!";
    return json;
  }

  json.error = "Warning: Domain not available!";
  json.domain_not_available = true;

  const base = domain_name.replace(/^www\./i, "");
  const parts = base.split(".");
  const keyword = parts[0] || base;

  const suggestUrl =
    `${BASE_URL}/v1/domains/suggest?query=${encodeURIComponent(keyword)}` +
    `&sources=keywordspin&waitMs=1000`;

  const sres = await fetch(suggestUrl, { method: "GET", headers: header, cache: "no-store" });
  const suggestions = await sres.json().catch(() => []);

  if (Array.isArray(suggestions) && suggestions.length > 0) {
    const list = [];
    for (const item of suggestions) {
      const d = item?.domain;
      if (typeof d === "string" && d.toLowerCase().endsWith(".com")) {
        list.push(d);
      }
    }
    if (list.length) json.domain_suggestions = list;
  }

  return json;
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));

  const automation_source = String(body.automation_source || "").trim();
  const send_log_id = Number(body.send_log_id || 0);

  if (String(body?.action || "") === "check_domain") {
    const domain_name = body?.domain_name || "";
    const result = await godaddyCheckDomain(domain_name);
    return Response.json(result);
  }

  const step = Number(body.step || 0);

  if (![1, 2, 3].includes(step)) {
    return Response.json({ message: "step is required (1,2,3)" }, { status: 400 });
  }

  const ip = getClientIp(req);

  /* =========================
     STEP 1
  ========================= */
  if (step === 1) {
    const firstname = dbEscape(body.firstname);
    const lastname = dbEscape(body.lastname);
    const email = dbEscape(body.email).toLowerCase();
    const telephone = dbEscape(body.telephone);

    const incomingAffiliateId = Number(body?.affiliate_id || 0) || 0;

    if (!firstname) return Response.json({ message: "firstname is required" }, { status: 400 });
    if (firstname.length < 1 || firstname.length > 32) {
      return Response.json({ message: "First name must be between 1 to 32 characters" }, { status: 400 });
    }

    if (!lastname) return Response.json({ message: "lastname is required" }, { status: 400 });
    if (lastname.length < 1 || lastname.length > 32) {
      return Response.json({ message: "Last name must be between 1 to 32 characters" }, { status: 400 });
    }

    if (!email) return Response.json({ message: "email is required" }, { status: 400 });
    if (!isEmail(email)) {
      return Response.json({ message: "Please enter a valid email address" }, { status: 400 });
    }

    if (!telephone) return Response.json({ message: "telephone is required" }, { status: 400 });
    if (!isTenDigitPhone(telephone)) {
      return Response.json({ message: "Phone/Mobile must be exactly 10 digits (numbers only)" }, { status: 400 });
    }

    // Existing draft row from browser/local storage
    if (incomingAffiliateId) {
      const existing = await getAffiliateById(incomingAffiliateId);

      if (existing && Number(existing.is_registration_completed || 0) === 0) {
        const completedEmail = await getCompletedAffiliateByEmail(email, incomingAffiliateId);
        if (completedEmail) {
          return Response.json({ message: "Email already exists" }, { status: 409 });
        }

        const completedTel = await getCompletedAffiliateByTelephone(telephone, incomingAffiliateId);
        if (completedTel) {
          return Response.json({ message: "Phone/Mobile already exists" }, { status: 409 });
        }

        await db.query(`
          UPDATE affiliate SET
            firstname='${firstname}',
            lastname='${lastname}',
            email='${email}',
            telephone='${telephone}',
            registration_step='1',
            is_registration_completed='0',
            ip='${dbEscape(ip)}',
            date_modified=NOW()
          WHERE affiliate_id=${incomingAffiliateId}
          LIMIT 1
        `);

        await recordAffiliateActivity({
          affiliate_id: incomingAffiliateId,
          key: "register_step1_submit",
          data: {
            step: 1,
            firstname: body.firstname,
            lastname: body.lastname,
            email: body.email,
            telephone: body.telephone,
            mode: "updated_existing_draft_by_affiliate_id",
          },
          ip,
        });

        return Response.json({
          success: true,
          step: 1,
          affiliate_id: incomingAffiliateId,
          mode: "updated",
        });
      }
    }

    // Block only if completed affiliate exists
    const completedEmail = await getCompletedAffiliateByEmail(email);
    if (completedEmail) {
      return Response.json({ message: "Email already exists" }, { status: 409 });
    }

    const completedTel = await getCompletedAffiliateByTelephone(telephone);
    if (completedTel) {
      return Response.json({ message: "Phone/Mobile already exists" }, { status: 409 });
    }

    // Resume only if BOTH email + telephone match an incomplete draft
    const draft = await getDraftAffiliateByEmailAndTelephone(email, telephone);

    if (draft?.affiliate_id) {
      await db.query(`
        UPDATE affiliate SET
          firstname='${firstname}',
          lastname='${lastname}',
          email='${email}',
          telephone='${telephone}',
          registration_step='1',
          is_registration_completed='0',
          ip='${dbEscape(ip)}',
          date_modified=NOW()
        WHERE affiliate_id='${Number(draft.affiliate_id)}'
        LIMIT 1
      `);

      await recordAffiliateActivity({
        affiliate_id: Number(draft.affiliate_id),
        key: "register_step1_submit",
        data: {
          step: 1,
          firstname: body.firstname,
          lastname: body.lastname,
          email: body.email,
          telephone: body.telephone,
          mode: "resumed_existing_draft",
        },
        ip,
      });

      return Response.json({
        success: true,
        step: 1,
        affiliate_id: Number(draft.affiliate_id),
        mode: "resumed",
      });
    }

    // Otherwise create new draft
    const tempStore = makeTempStoreName();

    const salt = generateSalt();
    const tmpPwd = `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const hashPassword = ocHashPassword(tmpPwd, salt);

    const affiliateSql = `
      INSERT INTO affiliate SET
        affiliate_type='0',
        fees='0',
        store_name='${dbEscape(tempStore)}',
        firstname='${firstname}',
        lastname='${lastname}',
        email='${email}',
        from_email='',
        telephone='${telephone}',
        fax='',
        password='${dbEscape(hashPassword)}',
        salt='${dbEscape(salt)}',
        company='',
        website='',
        address_1='',
        address_2='',
        city='',
        postcode='',
        country_id='0',
        zone_id='0',
        code='',
        is_customer_own_domain='0',
        is_domain_available='0',
        stripe_token='',
        stripe_customer_id='',
        stripe_plan_id='',
        recurring_billing='0',
        recurring_billing_id='0',
        start_date=NOW(),
        end_date=NOW(),
        store_category_type='0',
        commission='0',
        tax='',
        payment='',
        cheque='',
        paypal='',
        bank_name='',
        bank_branch_number='',
        bank_swift_code='',
        bank_account_name='',
        bank_account_number='',
        ip='${dbEscape(ip)}',
        status='0',
        newsletter='1',
        newsletter_text='0',
        affiliate_status_id='15',
        registration_step='1',
        is_registration_completed='0',
        approved='0',
        stop_automation='0',
        user_added='0',
        user_modified='0',
        date_added=NOW(),
        date_modified=NOW(),
        date_update=NOW(),
        is_delete='0'
    `;

    const [result] = await db.query(affiliateSql);
    const affiliate_id = result.insertId;

    await recordAffiliateActivity({
      affiliate_id: affiliate_id,
      key: "register_step1_submit",
      data: {
        step: 1,
        firstname: body.firstname,
        lastname: body.lastname,
        email: body.email,
        telephone: body.telephone,
        mode: "inserted_new_draft",
      },
      ip,
    });

    return Response.json({ success: true, step: 1, affiliate_id, mode: "inserted" });
  }

  /* =========================
     STEP 2
  ========================= */
  if (step === 2) {
    const affiliate_id = Number(body.affiliate_id || 0);
    if (!affiliate_id) {
      return Response.json({ message: "affiliate_id is required" }, { status: 400 });
    }

    const affiliate = await getAffiliateById(affiliate_id);
    if (!affiliate) {
      return Response.json({ message: "Affiliate not found" }, { status: 404 });
    }

    const affiliate_plan_id = Number(body.affiliate_plan_id || 0);
    const fees = Number(body.fees || 0);
    const business_name = dbEscape(body.business_name);
    const website_domain = stripWebsite(body.website || "");
    const website = dbEscape(website_domain);

    const stripe_plan_id = dbEscape(body.stripe_plan_id || "");

    if (!affiliate_plan_id) {
      return Response.json({ message: "affiliate_plan_id is required" }, { status: 400 });
    }

    if (!business_name) {
      return Response.json({ message: "business_name is required" }, { status: 400 });
    }
    if (business_name.length < 3 || business_name.length > 32) {
      return Response.json({ message: "Business name must be between 3 to 32 characters" }, { status: 400 });
    }

    if (website_domain) {
      const domainOk = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(website_domain);
      if (!domainOk) {
        return Response.json({ message: "Website must be a valid domain like example.com" }, { status: 400 });
      }
    }

    // Block only against completed registrations
    const [bizRows] = await db.query(`
      SELECT affiliate_id
      FROM affiliate
      WHERE LOWER(store_name)=LOWER('${dbEscape(business_name)}')
        AND affiliate_id<>${affiliate_id}
        AND IFNULL(is_registration_completed, 0) = 1
      LIMIT 1
    `);
    if (bizRows?.length) {
      return Response.json({ message: "Business name already exists" }, { status: 409 });
    }

    if (website_domain) {
      const [webRows] = await db.query(`
        SELECT affiliate_id
        FROM affiliate
        WHERE LOWER(website)=LOWER('${dbEscape(website_domain)}')
          AND affiliate_id<>${affiliate_id}
          AND IFNULL(is_registration_completed, 0) = 1
        LIMIT 1
      `);
      if (webRows?.length) {
        return Response.json({ message: "Website already exists" }, { status: 409 });
      }
    }

    await db.query(`
      UPDATE affiliate SET
        affiliate_type='${affiliate_plan_id}',
        fees='${fees}',
        store_name='${business_name}',
        website='${website}',
        stripe_plan_id='${stripe_plan_id}',
        registration_step='2',
        is_registration_completed='0',
        date_modified=NOW(),
        ip='${dbEscape(ip)}'
      WHERE affiliate_id=${affiliate_id}
    `);

    await recordAffiliateActivity({
      affiliate_id: affiliate_id,
      key: "register_step2_submit",
      data: {
        step: 2,
        affiliate_plan_id: affiliate_plan_id,
        business_name: body.business_name,
        website: website_domain || "",
      },
      ip,
    });

    return Response.json({ success: true, step: 2, affiliate_id });
  }

  /* =========================
     STEP 3
  ========================= */
  if (step === 3) {
    const affiliate_id = Number(body.affiliate_id || 0);
    if (!affiliate_id) {
      return Response.json({ message: "affiliate_id is required" }, { status: 400 });
    }

    const affiliate = await getAffiliateById(affiliate_id);
    if (!affiliate) {
      return Response.json({ message: "Affiliate not found" }, { status: 404 });
    }

    const address_1 = dbEscape(body.address_1);
    const address_2 = dbEscape(body.address_2 || "");
    const city = dbEscape(body.city);
    const postcode = dbEscape(body.postcode);
    const country_id = Number(body.country_id || 0);
    const zone_id = Number(body.zone_id || 0);

    const password = dbEscape(body.password ?? "");
    const confirm = dbEscape(body.confirm ?? "");

    const agree =
      body.agree_terms === true ||
      body.agree_terms === "true" ||
      body.agree_terms === "1" ||
      body.agree_terms === 1;

    if (!address_1) return Response.json({ message: "address_1 is required" }, { status: 400 });
    if (!city) return Response.json({ message: "city is required" }, { status: 400 });
    if (!country_id) return Response.json({ message: "country_id is required" }, { status: 400 });
    if (!zone_id) return Response.json({ message: "zone_id is required" }, { status: 400 });

    if (!password) return Response.json({ message: "password is required" }, { status: 400 });
    if (password.length < 6 || password.length > 20) {
      return Response.json({ message: "Password must be between 6 to 20 characters" }, { status: 400 });
    }
    if (password !== confirm) {
      return Response.json({ message: "Passwords do not match" }, { status: 400 });
    }
    if (!agree) {
      return Response.json({ message: "You must agree to the Terms & Conditions" }, { status: 400 });
    }

    const price_schema = Number(body.price_schema || 0);
    const default_markup = Number(body.default_markup || 0);
    const retail_price_commission = Number(body.retail_price_commission || 0);
    const is_catalog_access = body.is_catalog_access;

    const salt = generateSalt();
    const hashPassword = ocHashPassword(password, salt);

    await db.query(`
      UPDATE affiliate SET
        affiliate_status_id='1',
        registration_step='3',
        is_registration_completed='1',
        address_1='${address_1}',
        address_2='${address_2}',
        city='${city}',
        postcode='${postcode}',
        country_id='${country_id}',
        zone_id='${zone_id}',
        password='${dbEscape(hashPassword)}',
        salt='${dbEscape(salt)}',
        date_modified=NOW(),
        ip='${dbEscape(ip)}'
      WHERE affiliate_id=${affiliate_id}
    `);

    await recordAffiliateActivity({
      affiliate_id: affiliate_id,
      key: "register_step3_submit",
      data: { step: 3, city: body.city, country_id, zone_id },
      ip,
    });

    await recordAffiliateActivity({
      affiliate_id: affiliate_id,
      key: "register_step3_submit",
      data: {
        step: 3,
        address_1: address_1,
        address_2: address_2,
        city: body.city,
        postcode: postcode,
        country_id,
        zone_id,
      },
      ip,
    });

    await recordAffiliateActivity({
      affiliate_id: affiliate_id,
      key: "redirect_to_payment",
      data: { step: 4, affiliate_id: affiliate_id, url: `/register/payment/${affiliate_id}` },
      ip,
    });

    const firstname = dbEscape(affiliate.firstname || "");
    const lastname = dbEscape(affiliate.lastname || "");
    const email = dbEscape(String(affiliate.email || "")).toLowerCase();
    const telephone = dbEscape(affiliate.telephone || "");
    const business_name = dbEscape(affiliate.store_name || "");
    const website = dbEscape(affiliate.website || "");

    const username = email;

    const [affiliateUserRows] = await db.query(`
      SELECT affiliate_user_id
      FROM affiliate_user
      WHERE affiliate_id='${affiliate_id}'
      LIMIT 1
    `);

    if (affiliateUserRows?.length) {
      await db.query(`
        UPDATE affiliate_user SET
          username='${username}',
          password='${dbEscape(hashPassword)}',
          salt='${dbEscape(salt)}',
          firstname='${firstname}',
          lastname='${lastname}',
          email='${email}',
          telephone='${telephone}',
          ip='${dbEscape(ip)}',
          status='0',
          is_delete=0,
          date_modified=NOW()
        WHERE affiliate_id='${affiliate_id}'
        LIMIT 1
      `);
    } else {
      await db.query(`
        INSERT INTO affiliate_user SET
          affiliate_id='${affiliate_id}',
          username='${username}',
          password='${dbEscape(hashPassword)}',
          salt='${dbEscape(salt)}',
          firstname='${firstname}',
          lastname='${lastname}',
          email='${email}',
          telephone='${telephone}',
          image='',
          code='',
          ip='${dbEscape(ip)}',
          status='0',
          user_added='0',
          date_added=NOW(),
          date_modified=NOW(),
          is_delete=0
      `);
    }

    await installModule("total", "sub_total", affiliate_id);
    await addAffiliateSettings(
      "affiliate_sub_total",
      { affiliate_sub_total_status: "1", affiliate_sub_total_sort_order: "1" },
      affiliate_id
    );

    await installModule("total", "shipping", affiliate_id);
    await addAffiliateSettings(
      "affiliate_shipping",
      { affiliate_shipping_status: "2", affiliate_shipping_sort_order: "10" },
      affiliate_id
    );

    await installModule("total", "coupon", affiliate_id);
    await addAffiliateSettings(
      "affiliate_coupon",
      { affiliate_coupon_status: "1", affiliate_coupon_sort_order: "3" },
      affiliate_id
    );

    await installModule("total", "credit", affiliate_id);
    await addAffiliateSettings(
      "affiliate_credit",
      { affiliate_credit_status: "1", affiliate_credit_sort_order: "4" },
      affiliate_id
    );

    await installModule("total", "reward", affiliate_id);
    await addAffiliateSettings(
      "affiliate_reward",
      { affiliate_reward_status: "1", affiliate_reward_sort_order: "5" },
      affiliate_id
    );

    await installModule("total", "total", affiliate_id);
    await addAffiliateSettings(
      "affiliate_total",
      { affiliate_total_status: "1", affiliate_total_sort_order: "100" },
      affiliate_id
    );

    const affiliate_basic_settings = await getAffiliateBasicSettings();

    const affiliate_setting = {};

    if (price_schema === 1 || price_schema === 3) {
      affiliate_setting["affiliate_config_markup"] = default_markup ? default_markup : 30;
    } else {
      affiliate_setting["affiliate_config_markup"] = 0;
    }

    affiliate_setting["affiliate_config_name"] = business_name;
    affiliate_setting["affiliate_config_url"] = website;
    affiliate_setting["affiliate_config_owner"] = `${firstname} ${lastname}`.trim();

    let fullAddress = address_1;
    if (address_2 && address_2.trim() !== "") fullAddress += `, ${address_2}`;
    fullAddress += `, ${city}`;
    fullAddress += ` - ${postcode}`;

    affiliate_setting["affiliate_config_address"] = fullAddress;

    affiliate_setting["affiliate_config_email"] = email;
    affiliate_setting["affiliate_config_telephone"] = telephone;
    affiliate_setting["affiliate_config_visible_telephone"] = 1;
    affiliate_setting["affiliate_config_meta_title"] = business_name;

    affiliate_setting["affiliate_config_country_id"] = country_id;
    affiliate_setting["affiliate_config_zone_id"] = zone_id;

    affiliate_setting["affiliate_config_currency"] = "USD";
    affiliate_setting["affiliate_config_order_status_id"] = 2;
    affiliate_setting["affiliate_config_processing_status"] = [2];
    affiliate_setting["affiliate_config_complete_status"] = [5, 15];

    affiliate_setting["affiliate_config_image_category_width"] = 1200;
    affiliate_setting["affiliate_config_image_category_height"] = 300;
    affiliate_setting["affiliate_config_image_product_width"] = 370;
    affiliate_setting["affiliate_config_image_product_height"] = 370;
    affiliate_setting["affiliate_config_image_popup_width"] = 1000;
    affiliate_setting["affiliate_config_image_popup_height"] = 1000;
    affiliate_setting["affiliate_config_image_thumb_width"] = 370;
    affiliate_setting["affiliate_config_image_thumb_height"] = 370;
    affiliate_setting["affiliate_config_image_additional_width"] = 475;
    affiliate_setting["affiliate_config_image_additional_height"] = 475;
    affiliate_setting["affiliate_config_image_catalog_width"] = 600;
    affiliate_setting["affiliate_config_image_catalog_height"] = 482;

    affiliate_setting["affiliate_config_template"] = "default";
    affiliate_setting["affiliate_config_checkout_guest"] = 1;
    affiliate_setting["affiliate_config_apply_store_coupons"] = 1;

    affiliate_setting["affiliate_config_subscribe_status"] = 1;
    affiliate_setting["affiliate_config_subscribe_heading"] = "Subscribe to our Newsletter";
    affiliate_setting["affiliate_config_subscribe_top_text"] = `<p style="margin-top:15px; line-height: 22px;">Enter your email address to get the hottest deals Online. </p>
<p style="margin-top:15px; line-height: 22px;"><span style="font-weight: bold;">You will be the first </span>to know about our offers, new arrivals, and more!<br></p>`;
    affiliate_setting["affiliate_config_subscribe_bottom_text"] = `<p style="line-height: 22px;">We value our customers and will not share your email address to any third party. You will not be spammed.<br></p>`;
    affiliate_setting["affiliate_config_subscribe_button_text"] = "";
    affiliate_setting["affiliate_config_subscribe_image_position"] = "left";
    affiliate_setting["affiliate_config_subscribe_success"] =
      "Success: Your email address subscribed successfully!";

    const footer_description =
      "We are carrying the biggest collection for church fashions which includes all the designer church suits, church dresses and church hats.";

    affiliate_setting["affiliate_config_footer_description"] =
      affiliate_basic_settings?.["affiliate_basic_footer_description"]
        ? String(affiliate_basic_settings["affiliate_basic_footer_description"])
        : footer_description;

    affiliate_setting["affiliate_config_catalog_column"] = 3;

    affiliate_setting["affiliate_config_pp_standard_email"] = email;
    affiliate_setting["affiliate_config_pp_standard_status"] = 1;
    affiliate_setting["affiliate_config_pp_standard_test"] = 0;
    affiliate_setting["affiliate_config_pp_standard_debug"] = 0;
    affiliate_setting["affiliate_config_pp_standard_transaction"] = 1;

    const header_tag_line = "Leading Church Fashion Brand";
    affiliate_setting["affiliate_config_tagline"] =
      affiliate_basic_settings?.["affiliate_basic_tagline"]
        ? affiliate_basic_settings["affiliate_basic_tagline"]
        : header_tag_line;

    affiliate_setting["affiliate_config_display_address"] = 0;

    await addAffiliateSettings("affiliate_config", affiliate_setting, affiliate_id);

    if (isTruthy(is_catalog_access)) {
      const categories = await addAffiliateCategory(affiliate_id);
      await addAffiliateProducts(affiliate_id, categories);
    }

    await addAffiliatePages(affiliate_id, [
      { name: "About Us", description: "About Us", meta_title: "About Us", meta_description: "About Us", sort_order: "1", status: "1" },
    ]);

    await addLargeBanners(affiliate_id);
    await addSmallBanners(affiliate_id);
    await addCategoryProductsModule(affiliate_id);

    await completeAutomationConversion({
      affiliate_id,
      affiliate_status_id: 1,
      automation_source,
      send_log_id,
    });

    return Response.json({ success: true, step: 3, affiliate_id });
  }

  return Response.json({ message: "Invalid step" }, { status: 400 });
}