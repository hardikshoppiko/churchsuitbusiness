import OpenAI from "openai";
import * as cheerio from "cheerio";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function welcomeMessage() {
  return "Welcome to OpenAI API";
}

async function handleGenerateSmartContent(body) {
  try {
    const filter_data = body || {};

    console.log(filter_data);

    if (!filter_data.text) {
      return Response.json(
        { error: "Missing required 'text' parameter." },
        { status: 400 }
      );
    }

    let openAIResponse;
    let messages = [{ role: "user", content: filter_data.text }];

    // If an image URL is provided, use GPT-4 Turbo with vision capabilities
    if (filter_data.image_url) {
      messages[0].content = [
        { type: "text", text: filter_data.text },
        { type: "image_url", image_url: { url: filter_data.image_url } },
      ];

      openAIResponse = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages
      });
    } else {
      // Use GPT-4 Turbo for text-only requests
      openAIResponse = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages
      });
    }

    // Extract response content
    const htmlResponse = openAIResponse.choices[0]?.message?.content || "";

    // If format == 1, extract structured data
    if (filter_data.format !== undefined && filter_data.format === 1) {
      const $ = cheerio.load(htmlResponse);
      const responseObj = {
        brief: $(".brief").text(),
        description: $(".description").text(),
        meta_description: $(".meta_description").text(),
      };

      console.log(`Response Object: ${responseObj}`);

      return Response.json(responseObj);
    }
    
    console.log(`Html Response: ${htmlResponse}`);

    // Otherwise, return full response
    return new Response(htmlResponse, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error fetching response:", error);
    console.log("Error fetching response:", error);

    return Response.json(
      {
        error: "Failed to fetch response from OpenAI",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleReadImageFileText(body) {
  try {
    const imageUrl = body?.image_url || "https://designerchurchsuits.com/image/ss.jpeg";

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
You are an expert OCR parser for scanned invoices.

From the image, extract two things:

1. Invoice metadata as an object with the following keys:
- company_name
- company_address
- company_email
- company_phone
- company_fax
- billing_address
- shipping_address
- invoice_number
- invoice_date
- ship_date
- terms
- ship_via

2. The itemized product table as a JSON array. Each object should have these keys:
- item (string)
- qty (number or null)
- description (string)
- price (number)
- amount (number)

Keep row integrity. Do not merge rows. If any field is missing, return it as empty string or null.

Return a single JSON object with this structure:
{
  "invoice_details": { ... },
  "items": [ ... ]
}

Return only the JSON, no extra commentary or formatting.
              `.trim(),
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 1800,
    });

    const resultText = response?.choices?.[0]?.message?.content || "";
    console.log("Result Text >>>", resultText);

    let finalJson = {};
    try {
      const cleaned = resultText.trim().replace(/```json|```/g, "");
      finalJson = JSON.parse(cleaned);
    } catch (err) {
      return Response.json({
        status: false,
        raw: resultText,
        error: "Could not parse JSON cleanly.",
      });
    }

    return Response.json({
      status: true,
      data: finalJson,
    });
  } catch (error) {
    console.error("Error:", error);

    return Response.json(
      {
        status: false,
        error: "Something went wrong",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const action = String(searchParams.get("action") || "").trim();

    if (action === "welcome") {
      const message = await welcomeMessage();

      return new Response(message, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    return Response.json(
      {
        error: true,
        message: "Invalid GET action. Use ?action=welcome",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("GET /api/openai error:", error);

    return Response.json(
      {
        error: true,
        message: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "").trim();

    if (!action) {
      return Response.json(
        {
          error: true,
          message:
            "action is required. Use one of: generate_smart_content_for_shopify_product, read_image_file_text",
        },
        { status: 400 }
      );
    }

    if (action === "generate_smart_content_for_shopify_product") {
      return await handleGenerateSmartContent(body);
    }

    if (action === "read_image_file_text") {
      return await handleReadImageFileText(body);
    }

    return Response.json(
      {
        error: true,
        message: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/openai error:", error);

    return Response.json(
      {
        error: true,
        message: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}