export const runtime = "nodejs";

import { db } from "@/lib/db";

const DELETE_AFTER_HOURS = Number(process.env.AFFILIATE_INCOMPLETE_DELETE_AFTER_HOURS || 24);

const CRON_TOKEN = String(process.env.AFFILIATE_CLEANUP_CRON_TOKEN || "").trim();

function num(v) {
  return Number(v || 0);
}

async function getIncompleteAffiliateIds() {
  const [rows] = await db.query(`
    SELECT affiliate_id
    FROM affiliate
    WHERE IFNULL(is_registration_completed, 0) = 0
      AND IFNULL(registration_step, 0) < 3
      AND affiliate_status_id = 15
      AND date_added < DATE_SUB(NOW(), INTERVAL ${num(DELETE_AFTER_HOURS)} HOUR)
    ORDER BY affiliate_id ASC
  `);

  return (rows || []).map((r) => Number(r.affiliate_id)).filter(Boolean);
}

async function countRows(table, whereSql) {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS total
    FROM ${table}
    WHERE ${whereSql}
  `);
  return Number(rows?.[0]?.total || 0);
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const token = String(url.searchParams.get("token") || "").trim();
    const dryRun =
      String(url.searchParams.get("dry_run") || "").trim() === "1";

    if (CRON_TOKEN && token !== CRON_TOKEN) {
      return Response.json(
        { ok: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const affiliateIds = await getIncompleteAffiliateIds();

    if (!affiliateIds.length) {
      return Response.json({
        ok: true,
        dry_run: dryRun,
        delete_after_hours: DELETE_AFTER_HOURS,
        message: "No incomplete affiliates found",
        totals: {
          affiliates: 0,
          affiliate_activity: 0,
          affiliate_user: 0,
          affiliate_extension: 0,
          affiliate_setting: 0,
          category: 0,
          category_path: 0,
          product: 0,
          product_to_category: 0,
          information: 0,
          page_builder: 0,
        },
      });
    }

    const idsCsv = affiliateIds.join(",");

    const categoryWhere = `affiliate_id IN (${idsCsv})`;
    const productWhere = `affiliate_id IN (${idsCsv})`;

    const [categoryRows] = await db.query(`
      SELECT category_id
      FROM category
      WHERE ${categoryWhere}
    `);
    const categoryIds = (categoryRows || [])
      .map((r) => Number(r.category_id))
      .filter(Boolean);

    const [productRows] = await db.query(`
      SELECT product_id
      FROM product
      WHERE ${productWhere}
    `);
    const productIds = (productRows || [])
      .map((r) => Number(r.product_id))
      .filter(Boolean);

    const categoryIdsCsv = categoryIds.length ? categoryIds.join(",") : "";
    const productIdsCsv = productIds.length ? productIds.join(",") : "";

    const totals = {
      affiliates: affiliateIds.length,
      affiliate_activity: await countRows(
        "affiliate_activity",
        `affiliate_id IN (${idsCsv})`
      ),
      affiliate_user: await countRows(
        "affiliate_user",
        `affiliate_id IN (${idsCsv})`
      ),
      affiliate_extension: await countRows(
        "affiliate_extension",
        `affiliate_id IN (${idsCsv})`
      ),
      affiliate_setting: await countRows(
        "affiliate_setting",
        `affiliate_id IN (${idsCsv})`
      ),
      category: await countRows("category", `affiliate_id IN (${idsCsv})`),
      category_path: categoryIdsCsv
        ? await countRows("category_path", `category_id IN (${categoryIdsCsv})`)
        : 0,
      product: await countRows("product", `affiliate_id IN (${idsCsv})`),
      product_to_category:
        productIdsCsv || categoryIdsCsv
          ? await countRows(
              "product_to_category",
              [
                productIdsCsv ? `product_id IN (${productIdsCsv})` : null,
                categoryIdsCsv ? `category_id IN (${categoryIdsCsv})` : null,
              ]
                .filter(Boolean)
                .join(" OR ")
            )
          : 0,
      information: await countRows(
        "information",
        `affiliate_id IN (${idsCsv})`
      ),
      page_builder: await countRows(
        "page_builder",
        `affiliate_id IN (${idsCsv})`
      ),
    };

    if (dryRun) {
      return Response.json({
        ok: true,
        dry_run: true,
        delete_after_hours: DELETE_AFTER_HOURS,
        affiliate_ids: affiliateIds,
        totals,
      });
    }

    await db.query("START TRANSACTION");

    try {
      if (productIdsCsv || categoryIdsCsv) {
        const ptcWhere = [
          productIdsCsv ? `product_id IN (${productIdsCsv})` : null,
          categoryIdsCsv ? `category_id IN (${categoryIdsCsv})` : null,
        ]
          .filter(Boolean)
          .join(" OR ");

        if (ptcWhere) {
          await db.query(`
            DELETE FROM product_to_category
            WHERE ${ptcWhere}
          `);
        }
      }

      if (categoryIdsCsv) {
        await db.query(`
          DELETE FROM category_path
          WHERE category_id IN (${categoryIdsCsv})
        `);
      }

      await db.query(`
        DELETE FROM affiliate_activity
        WHERE affiliate_id IN (${idsCsv})
      `);

      await db.query(`
        DELETE FROM affiliate_user
        WHERE affiliate_id IN (${idsCsv})
      `);

      await db.query(`
        DELETE FROM affiliate_extension
        WHERE affiliate_id IN (${idsCsv})
      `);

      await db.query(`
        DELETE FROM affiliate_setting
        WHERE affiliate_id IN (${idsCsv})
      `);

      await db.query(`
        DELETE FROM page_builder
        WHERE affiliate_id IN (${idsCsv})
      `);

      await db.query(`
        DELETE FROM information
        WHERE affiliate_id IN (${idsCsv})
      `);

      await db.query(`
        DELETE FROM product
        WHERE affiliate_id IN (${idsCsv})
      `);

      await db.query(`
        DELETE FROM category
        WHERE affiliate_id IN (${idsCsv})
      `);

      await db.query(`
        DELETE FROM affiliate
        WHERE affiliate_id IN (${idsCsv})
          AND IFNULL(is_registration_completed, 0) = 0
          AND IFNULL(registration_step, 0) < 3
      `);

      await db.query("COMMIT");
    } catch (e) {
      await db.query("ROLLBACK");
      throw e;
    }

    return Response.json({
      ok: true,
      dry_run: false,
      delete_after_hours: DELETE_AFTER_HOURS,
      affiliate_ids: affiliateIds,
      deleted: totals,
    });
  } catch (e) {
    return Response.json(
      {
        ok: false,
        message: e?.message || "Cleanup failed",
      },
      { status: 500 }
    );
  }
}