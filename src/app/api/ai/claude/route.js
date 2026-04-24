import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";

export const runtime = "nodejs";

function getAnthropicClient() {
  return new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
  });
}

async function welcomeMessage() {
  return "Welcome to Claude API";
}

// Helper function to parse Claude's response
async function extractComponents(claudeResponse) {
  const components = {};
  const lines = claudeResponse.split('\n');
  
  for (const line of lines) {
    if (line.includes(':')) {
      const [key, value] = line.split(':', 2);
      const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
      const cleanValue = value.trim();
      
      if (cleanKey.includes('brand')) {
        components.brand_name = cleanValue;
      } else if (cleanKey.includes('style')) {
        components.style_id = cleanValue;
      } else if (cleanKey.includes('gender')) {
        components.gender = cleanValue;
      } else if (cleanKey.includes('type')) {
        components.type = cleanValue;
      } else if (cleanKey.includes('color')) {
        components.color = cleanValue;
      } else if (cleanKey.includes('size')) {
        components.size = cleanValue;
      } else if (cleanKey.includes('material')) {
        components.material = cleanValue;
      } else if (cleanKey.includes('season')) {
        components.season = cleanValue;
      } else if (cleanKey.includes('collection')) {
        components.collection = cleanValue;
      }
    }
  }
  
  return components;
}

async function fallbackParse(productName) {
  const parts = productName.trim().split(/\s+/).filter(Boolean);

  const components = {
    brand_name: '',
    style_id: '',
    gender: '',
    type: '',
    color: '',
    size: '',
    material: '',
    season: '',
    collection: ''
  };

  const fullText = productName.toLowerCase();

  // 🔹 1. Detect common multi-word types
  const multiWordTypes = [
    { pattern: /church\s+suit/i, value: 'Church Suit' },
    { pattern: /church\s+dress/i, value: 'Church Dress' },
    { pattern: /dress\s+suit/i, value: 'Dress Suit' },
    { pattern: /pant\s+suit/i, value: 'Pant Suit' },
    { pattern: /skirt\s+suit/i, value: 'Skirt Suit' },
    { pattern: /designer\s+suit/i, value: 'Designer Suit' },
    { pattern: /business\s+suit/i, value: 'Business Suit' }
  ];
  for (const typeObj of multiWordTypes) {
    if (typeObj.pattern.test(fullText)) {
      components.type = typeObj.value;
      break;
    }
  }

  // 🔹 2. Extract likely brand name (first capitalized word)
  if (!components.brand_name && /^[A-Z][a-zA-Z]+/.test(parts[0])) {
    components.brand_name = parts[0];
  }

  // 🔹 3. Extract style ID (strong detection)
  // Priority 1: Digit-based with hyphens - captures leading letters too (e.g., 508-3-DARK-GRY, 13370-IH, VL-100-ROYAL-2PC)
  const digitHyphenPattern = /\b([A-Z]{0,5}-(?:[A-Z0-9]+-)*[A-Z0-9]*\d[A-Z0-9]*|[A-Z0-9]*\d[A-Z0-9]*(?:-[A-Z0-9]+)+)\b/g;
  let styleCandidates = productName.match(digitHyphenPattern);
  if (styleCandidates && styleCandidates.length > 0) {
    // Pick longest match that has a digit (longest = most complete style ID)
    const filtered = styleCandidates.filter(id => 
      /\d/.test(id) && 
      !/^(mens?|womens?|female|male|ladies)$/i.test(id)
    );
    components.style_id = filtered.sort((a, b) => b.length - a.length)[0] || '';
  }

  // Priority 2: ALL-CAPS hyphenated words, no digit needed (e.g., GENOVA-ROYAL, DARK-GRY)
  if (!components.style_id) {
    const allCapsHyphenPattern = /\b([A-Z]{2,}(?:-[A-Z0-9]+)+)\b/g;
    const allCapsHyphen = productName.match(allCapsHyphenPattern);
    if (allCapsHyphen && allCapsHyphen.length > 0) {
      components.style_id = allCapsHyphen[0];
    }
  }

  // Priority 3: Standalone digit-containing code, no hyphen (e.g., 13370, S508, 1376)
  if (!components.style_id) {
    const standaloneCodePattern = /\b([A-Z]{0,3}\d{2,}[A-Z0-9]*)\b/g;
    const standaloneCandidates = productName.match(standaloneCodePattern);
    if (standaloneCandidates && standaloneCandidates.length > 0) {
      // Filter out size-like values (XL, 32, 34, etc.)
      const filtered = standaloneCandidates.filter(id => 
        !/^(XS|SM|MD|LG|XL|XXL|XXXL)$/i.test(id) &&
        !/^\d{1,2}$/.test(id) // exclude 1-2 digit numbers (sizes like 32, 34)
      );
      components.style_id = filtered[0] || '';
    }
  }

  // 🔹 4. Detect color
  const colorPattern = /(BLACK|WHITE|RED|BLUE|NAVY|GRAY|GREY|BROWN|PINK|PURPLE|GREEN|SILVER|GOLD|BEIGE|TAUPE|BURGUNDY|DARK|LIGHT)/i;
  const colorMatch = productName.match(colorPattern);
  if (colorMatch) components.color = colorMatch[0];

  // 🔹 5. Detect gender
  if (/mens?|male/i.test(productName)) components.gender = 'Mens';
  else if (/womens?|female|ladies/i.test(productName)) components.gender = 'Womens';

  // 🔹 6. Detect single-word type if not already found
  if (!components.type) {
    const singleTypes = /(vest|dress|suit|skirt|blouse|pant|jacket|jeans|robe|coat)/i;
    const singleMatch = productName.match(singleTypes);
    if (singleMatch) {
      components.type = singleMatch[0].charAt(0).toUpperCase() + singleMatch[0].slice(1).toLowerCase();
    }
  }

  // 🔹 Special handling: Preserve "Church" prefix if present
  if (/church/i.test(productName) && components.type && !/church/i.test(components.type)) {
    components.type = 'Church ' + components.type;
  }

  // 🔹 7. Detect simple size patterns (if mentioned)
  const sizePattern = /\b(\d{2}|XS|S|M|L|XL|XXL|XXXL)\b/i;
  const sizeMatch = productName.match(sizePattern);
  if (sizeMatch) components.size = sizeMatch[0].toUpperCase();

  return components;
}

// Function to apply dynamic formatting - STRICTLY uses only format template
async function applyDynamicFormat(components, format, prefix = null) {
  // Default format if none provided
  if (!format) {
    format = '{brand_name} {style_id} {gender} {type}';
  }
  
  // 🔹 NEW: If prefix is provided, prepend it to the type
  let typeValue = components.type || '';
  if (prefix) {
    typeValue = prefix + ' ' + typeValue;
    typeValue = typeValue.trim(); // Clean up any extra spaces
  }
  
  // Replace placeholders with actual values
  let formattedName = format;
  
  // Define available placeholders
  const placeholders = {
    '{brand_name}': components.brand_name || '',
    '{style_id}': components.style_id || '',
    '{gender}': components.gender || '',
    '{type}': typeValue, // Use the modified type with prefix
    '{color}': components.color || '',
    '{size}': components.size || '',
    '{material}': components.material || '',
    '{season}': components.season || '',
    '{collection}': components.collection || ''
  };
  
  // Replace all placeholders
  for (const [placeholder, value] of Object.entries(placeholders)) {
    formattedName = formattedName.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  }
  
  // Clean up extra spaces
  formattedName = formattedName.replace(/\s+/g, ' ').trim();
  
  return formattedName;
}

// Function to get available format options
async function getAvailableFormats() {
  return {
    placeholders: [
      '{brand_name}',
      '{style_id}',
      '{gender}',
      '{type}',
      '{color}',
      '{size}',
      '{material}',
      '{season}',
      '{collection}'
    ],
    examples: [
      '{brand_name} {style_id} {gender} {type}',
      '{brand_name}-{style_id}-{color}',
      '{gender} {type} by {brand_name} ({style_id})',
      '{brand_name} {collection} {type} {style_id} {color} {size}',
      '{type}-{brand_name}-{style_id}',
      '{brand_name}_{style_id}_{gender}_{type}_{color}'
    ]
  };
}

async function downloadFileAsBase64(url, timeout = 30000) {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  const buffer = Buffer.from(response.data);

  return {
    buffer,
    base64: buffer.toString("base64"),
    contentType: response.headers["content-type"] || "",
  };
}

function detectImageMediaType(contentType = "", url = "") {
  if (contentType.includes("png")) return "image/png";
  if (contentType.includes("gif")) return "image/gif";
  if (contentType.includes("webp")) return "image/webp";

  const lower = url.toLowerCase();
  if (lower.includes(".png")) return "image/png";
  if (lower.includes(".gif")) return "image/gif";
  if (lower.includes(".webp")) return "image/webp";

  return "image/jpeg";
}

function extractJsonObject(text) {
  let cleanResponse = text.trim();
  cleanResponse = cleanResponse.replace(/```json\s*/g, "");
  cleanResponse = cleanResponse.replace(/```\s*$/g, "");

  const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON object found in response");
  }

  return JSON.parse(jsonMatch[0]);
}

function validateAndStructureInvoiceData(data) {
  return {
    company: {
      name: data.company?.name || null,
      address: data.company?.address || null,
      city: data.company?.city || null,
      state: data.company?.state || null,
      country: data.company?.country || null,
      zip_code: data.company?.zip_code || null,
      phone: data.company?.phone || null,
      fax: data.company?.fax || null,
      email: data.company?.email || null,
    },
    invoice: {
      number: data.invoice?.number || null,
      date: data.invoice?.date || null,
      terms: data.invoice?.terms || null,
      po_number: data.invoice?.po_number || null,
    },
    customer: {
      billing_address: {
        company_name: data.customer?.billing_address?.company_name || null,
        contact_person: data.customer?.billing_address?.contact_person || null,
        address: data.customer?.billing_address?.address || null,
        city: data.customer?.billing_address?.city || null,
        state: data.customer?.billing_address?.state || null,
        country: data.customer?.billing_address?.country || null,
        zip_code: data.customer?.billing_address?.zip_code || null,
        phone: data.customer?.billing_address?.phone || null,
        email: data.customer?.billing_address?.email || null,
      },
      shipping_address: {
        company_name: data.customer?.shipping_address?.company_name || null,
        contact_person: data.customer?.shipping_address?.contact_person || null,
        address: data.customer?.shipping_address?.address || null,
        city: data.customer?.shipping_address?.city || null,
        state: data.customer?.shipping_address?.state || null,
        country: data.customer?.shipping_address?.country || null,
        zip_code: data.customer?.shipping_address?.zip_code || null,
        phone: data.customer?.shipping_address?.phone || null,
        email: data.customer?.shipping_address?.email || null,
      },
    },
    items: Array.isArray(data.items)
      ? data.items.map((item) => ({
          item_code: item.item_code || null,
          quantity:
            typeof item.quantity === "number"
              ? item.quantity
              : parseFloat(item.quantity) || 0,
          description: item.description || null,
          price:
            typeof item.price === "number"
              ? item.price
              : parseFloat(item.price) || 0,
          amount:
            typeof item.amount === "number"
              ? item.amount
              : parseFloat(item.amount) || 0,
        }))
      : [],
    shipping: {
      method: data.shipping?.method || null,
      tracking_number: data.shipping?.tracking_number || null,
      ship_date: data.shipping?.ship_date || null,
      ship_via: data.shipping?.ship_via || null,
      cost:
        typeof data.shipping?.cost === "number"
          ? data.shipping.cost
          : parseFloat(data.shipping?.cost) || 0,
    },
    totals: {
      subtotal:
        typeof data.totals?.subtotal === "number"
          ? data.totals.subtotal
          : parseFloat(data.totals?.subtotal) || 0,
      tax:
        typeof data.totals?.tax === "number"
          ? data.totals.tax
          : parseFloat(data.totals?.tax) || 0,
      shipping:
        typeof data.totals?.shipping === "number"
          ? data.totals.shipping
          : parseFloat(data.totals?.shipping) || 0,
      total:
        typeof data.totals?.total === "number"
          ? data.totals.total
          : parseFloat(data.totals?.total) || 0,
    },
    notes: data.notes || null,
  };
}

async function handleProductNameFormator(body) {
  const { product_name, format, brand, type, color, size, gender, prefix } = body || {};

  console.log('Product Name:', product_name);
  console.log('Format:', format);
  console.log('User Provided - Brand:', brand, 'Type:', type, 'Color:', color, 'Size:', size, 'Gender:', gender, 'Prefix:', prefix);

  if (!product_name) {
    return Response.json(
      {
        error: true,
        message: "product_name parameter is required",
      },
      { status: 400 }
    );
  }

  const original_product_name = product_name;
  const finalFormat = format || "{brand_name} {style_id} {gender} {type}";

  // Create enhanced prompt for Claude
  const prompt = `
Parse this product name and extract ALL possible components:
Product name: "${product_name}"

Please identify and return in this exact format:
Brand: [brand_name]
Style ID: [style_id] 
Gender: [gender]
Type: [product_type]
Color: [color]
Size: [size]
Material: [material]
Season: [season]
Collection: [collection]

IMPORTANT RULES:
- Brand is usually the first word or last word(s)
- Style ID should be treated as a COMPLETE unit including all numbers, letters, and dashes (e.g., "508-3-DARK-GRY" is ONE style ID, not separate parts)
- Gender should be: Womens or Mens
- Type is the product category and can be multi-word (Church Dress, Church Suit, Pant Suit, Skirt Suit, etc.) - ALWAYS preserve "Church" if it appears before the type
- Color can be extracted from the style ID or mentioned separately
- Size should be size indicators (S, M, L, XL, 32, 34, etc.)
- Material should be fabric type if mentioned (Cotton, Polyester, etc.)
- Season should be seasonal indicators (Summer, Winter, etc.)
- Collection should be collection name if mentioned
- If any component is not found, leave it blank

Example: "Renoir Mens Vest 508-3-DARK-GRY" should be:
Brand: Renoir
Style ID: 508-3-DARK-GRY
Gender: Male
Type: Vest
Color: DARK-GRY
Size: 
Material: 
Season: 
Collection: 

Example: "Church Dress 13370-IH Donna Vinci" should be:
Brand: Donna Vinci
Style ID: 13370-IH
Gender: Womens
Type: Church Dress
Color: 
Size: 
Material: 
Season: 
Collection: 
`;

  let components;

  try {
    const anthropic = getAnthropicClient();

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = message?.content?.[0]?.text || "";
    components = await extractComponents(text);

    console.log('Components:', components);

    if (!components.brand_name || !components.style_id) {
      console.log('Claude parsing incomplete, using fallback...');
      const fallbackComponents = await fallbackParse(product_name);
      components = { ...fallbackComponents, ...components };
    }
  } catch (claudeError) {
    console.log('Claude API error, using fallback parser:', claudeError.message);
    components = await fallbackParse(product_name);
  }

  // 🔹 PRIORITY OVERRIDE: Use user-provided values if present
  if (brand) {
    components.brand_name = brand;
    console.log('Overriding brand_name with user-provided value:', brand);
  }
  if (type) {
    components.type = type;
    console.log('Overriding type with user-provided value:', type);
  }
  if (color) {
    components.color = color;
    console.log('Overriding color with user-provided value:', color);
  }
  if (size) {
    components.size = size;
    console.log('Overriding size with user-provided value:', size);
  }
  if (gender) {
    components.gender = gender;
    console.log('Overriding gender with user-provided value:', gender);
  }

  // 🔹 STRICTLY apply formatter - now with prefix support
  let formattedName = await applyDynamicFormat(components, finalFormat, prefix);

  const final_response = {
    success: 1,
    product_original_name: original_product_name,
    product_new_name: formattedName,
    format_used: finalFormat,
    components: components,
    user_provided: {
      brand: brand || null,
      type: type || null,
      color: color || null,
      size: size || null,
      gender: gender || null,
      prefix: prefix || null
    },
    available_formats: await getAvailableFormats(),
    message: 'Product name formatted successfully'
  };

  console.log('Final Response:', final_response);

  return Response.json(final_response);
}

// Validation function to ensure consistent structure
async function validateAndStructureData(data) {
  // console.log('Raw Data:', data);
  const structuredData = {
    company: {
      name: data.company?.name || null,
      address: data.company?.address || null,
      city: data.company?.city || null,
      state: data.company?.state || null,
      country: data.company?.country || null,
      zip_code: data.company?.zip_code || null,
      phone: data.company?.phone || null,
      fax: data.company?.fax || null,
      email: data.company?.email || null
    },
    invoice: {
      number: data.invoice?.number || null,
      date: data.invoice?.date || null,
      terms: data.invoice?.terms || null,
      po_number: data.invoice?.po_number || null
    },
    customer: {
      billing_address: {
        company_name: data.customer?.billing_address?.company_name || null,
        contact_person: data.customer?.billing_address?.contact_person || null,
        address: data.customer?.billing_address?.address || null,
        city: data.customer?.billing_address?.city || null,
        state: data.customer?.billing_address?.state || null,
        country: data.customer?.billing_address?.country || null,
        zip_code: data.customer?.billing_address?.zip_code || null,
        phone: data.customer?.billing_address?.phone || null,
        email: data.customer?.billing_address?.email || null
      },
      shipping_address: {
        company_name: data.customer?.shipping_address?.company_name || null,
        contact_person: data.customer?.shipping_address?.contact_person || null,
        address: data.customer?.shipping_address?.address || null,
        city: data.customer?.shipping_address?.city || null,
        state: data.customer?.shipping_address?.state || null,
        country: data.customer?.shipping_address?.country || null,
        zip_code: data.customer?.shipping_address?.zip_code || null,
        phone: data.customer?.shipping_address?.phone || null,
        email: data.customer?.shipping_address?.email || null
      }
    },
    items: Array.isArray(data.items) ? data.items.map(item => ({
      item_code: item.item_code || null,
      quantity: typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity) || 0,
      description: item.description || null,
      color: item.color || null,
      size: item.size || null,
      price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
      amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0
    })) : [],
    shipping: {
      method: data.shipping?.method || null,
      tracking_number: data.shipping?.tracking_number || null,
      ship_date: data.shipping?.ship_date || null,
      ship_via: data.shipping?.ship_via || null,
      cost: typeof data.shipping?.cost === 'number' ? data.shipping.cost : parseFloat(data.shipping?.cost) || 0
    },
    totals: {
      subtotal: typeof data.totals?.subtotal === 'number' ? data.totals.subtotal : parseFloat(data.totals?.subtotal) || 0,
      tax: typeof data.totals?.tax === 'number' ? data.totals.tax : parseFloat(data.totals?.tax) || 0,
      shipping: typeof data.totals?.shipping === 'number' ? data.totals.shipping : parseFloat(data.totals?.shipping) || 0,
      total: typeof data.totals?.total === 'number' ? data.totals.total : parseFloat(data.totals?.total) || 0
    },
    notes: data.notes || null
  };
  
  return structuredData;
}

async function handleReadImageFileText(body) {
  try {
    // Get image URL from query parameter
    // const imageUrl = `https://designerchurchsuits.com/image/invoices/tally_taylor_inc.jpeg`;
    const imageUrl = body?.image_url;

    if (!imageUrl) {
      return Response.json(
        {
          error: "Image URL is required",
          success: false,
        },
        { status: 400 }
      );
    }

    console.log('console Received image URL:', imageUrl);

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch (urlError) {
      return Response.json(
        {
          error: "Invalid URL format",
          success: false,
          provided_url: imageUrl
        },
        { status: 400 }
      );
    }

    const anthropic = getAnthropicClient();

    // Download the image
    let imageResponse;

    try {
      imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
    } catch (downloadError) {
      return Response.json(
        {
          error: "Failed to download image from URL",
          details: downloadError.message,
          success: false,
          url: imageUrl
        },
        { status: 400 }
      );
    }

    // Convert to base64
    const imageBuffer = Buffer.from(imageResponse.data);
    const base64Image = imageBuffer.toString('base64');

    // Determine media type from content-type header or URL extension
    let mediaType = 'image/jpeg'; // default
    const contentType = imageResponse.headers['content-type'];
    
    if (contentType) {
      if (contentType.includes('png')) {
        mediaType = 'image/png';
      } else if (contentType.includes('gif')) {
        mediaType = 'image/gif';
      } else if (contentType.includes('webp')) {
        mediaType = 'image/webp';
      }
    } else {
      // Fallback to URL extension
      const urlLower = imageUrl.toLowerCase();
      if (urlLower.includes('.png')) {
        mediaType = 'image/png';
      } else if (urlLower.includes('.gif')) {
        mediaType = 'image/gif';
      } else if (urlLower.includes('.webp')) {
        mediaType = 'image/webp';
      }
    }

    // Create the message for Claude
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      // model: "claude-3-5-haiku-20241022",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `Please analyze this invoice image and extract all the data into a structured JavaScript object format.

              IMPORTANT: Be very careful and consistent when extracting address information and line items. Always follow the exact structure provided below.

              Extract the following information:
              1. Company/Vendor details (name, address, contact info)
              2. Invoice details (number, date, terms, PO number if any)
              3. Customer information with consistent address structure
              4. All line items — follow the item extraction rules below carefully
              5. Shipping information (method, tracking, dates)
              6. Total amounts and any taxes
              7. Any additional notes or special instructions

              --- ITEM EXTRACTION RULES ---

              RULE 1 — Color column:
                - Look at the invoice table headers carefully
                - If a dedicated "Color" column exists, read the color value from that column for each line item
                - If the color value is an abbreviation or code (e.g. WHT, BLK, SIL, NAV, YEL, MUL), resolve it to the full color name
                - Common abbreviations to resolve:
                    WHT / WHHT = White
                    BLK = Black
                    SIL = Silver
                    NAV = Navy
                    GLD = Gold
                    YEL = Yellow
                    RED = Red
                    BLU = Blue
                    GRN = Green
                    BRN = Brown
                    GRY / GRA = Gray
                    PUR / PRP = Purple
                    PNK = Pink
                    ORG = Orange
                    TAN = Tan
                    CHA / CHAR = Charcoal
                    BUR / BURG = Burgundy
                    MUL / MULT = Multicolor
                    CRM = Cream
                    IVR / IVY = Ivory
                    CAM = Camel
                    WNE / WIN = Wine
                - For compound colors separated by / (e.g. NAV/GLD, CHPP, WGP, CHPB), resolve each part and join with /
                    NAV/GLD = Navy/Gold
                    CHPP = Champagne/Purple
                    WGP = White/Gold/Purple
                    CHPB = Champagne/Purple/Blue
                - Put the resolved full color name in "color" in lowercase (e.g. "white", "black", "navy/gold")
                - If the color cannot be resolved from the abbreviation, keep the original value as-is
                - If no Color column exists in the table, set color to null for all items

              RULE 2 — Size column:
                - Look at the invoice table headers carefully
                - If a dedicated "Size" column exists, read the size value from that column for each line item
                - Put that value in "size" exactly as written (e.g. "48R", "46R", "42R", "38R", "44L")
                - If no Size column exists in the table, set size to null for all items

              RULE 3 — Item Code:
                - Use the Item Code column value exactly as it appears on the invoice (do not modify or parse it)

              RULE 4 — If a row has no value in Color or Size column (blank cell), set that field to null for that row

              --- END ITEM RULES ---

              Please return ONLY a valid JSON object with this EXACT structure. Make sure all numeric values are numbers, not strings:

              {
                "company": {
                  "name": "Company Name",
                  "address": "Street Address",
                  "city": "City",
                  "state": "State",
                  "country": "Country",
                  "zip_code": "ZIP Code",
                  "phone": "Phone Number",
                  "fax": "Fax Number",
                  "email": "Email Address"
                },
                "invoice": {
                  "number": "Invoice Number",
                  "date": "Invoice Date",
                  "terms": "Payment Terms",
                  "po_number": "PO Number if available"
                },
                "customer": {
                  "billing_address": {
                    "company_name": "Customer Company Name",
                    "contact_person": "Contact Person Name",
                    "address": "Street Address",
                    "city": "City",
                    "state": "State",
                    "country": "Country",
                    "zip_code": "ZIP Code",
                    "phone": "Phone Number if available",
                    "email": "Email if available"
                  },
                  "shipping_address": {
                    "company_name": "Shipping Company Name",
                    "contact_person": "Contact Person Name",
                    "address": "Street Address",
                    "city": "City",
                    "state": "State",
                    "country": "Country",
                    "zip_code": "ZIP Code",
                    "phone": "Phone Number if available",
                    "email": "Email if available"
                  }
                },
                "items": [
                  {
                    "item_code": "Item code exactly as printed on invoice",
                    "quantity": 0,
                    "description": "Full item description as written on invoice",
                    "color": "Value from Color column if column exists, else null",
                    "size": "Value from Size column if column exists, else null",
                    "price": 0.00,
                    "amount": 0.00
                  }
                ],
                "shipping": {
                  "method": "Shipping Method",
                  "tracking_number": "Tracking Number",
                  "ship_date": "Shipping Date",
                  "ship_via": "Shipping Via",
                  "cost": 0.00
                },
                "totals": {
                  "subtotal": 0.00,
                  "tax": 0.00,
                  "shipping": 0.00,
                  "total": 0.00
                },
                "notes": "Additional notes or special instructions"
              }

              CRITICAL RULES:
              1. Extract addresses exactly as they appear on the invoice
              2. Split full addresses into separate components (address, city, state, country, zip_code)
              3. If Bill To and Ship To are the same, duplicate the information in both sections
              4. If any field is not available, use null (not empty string)
              5. Ensure all numbers are numeric values, not strings
              6. Return ONLY the JSON object, no additional text or explanation
              7. If country is not explicitly mentioned, infer from state/zip code format (US format = "US")
              8. Be consistent with field names and structure every time
              9. Never try to guess or parse color/size from item codes — only read from dedicated columns`
            }
          ],
        },
      ],
    });

    // Extract the response text
    const responseText = message.content[0].text;

    // Try to extract JSON from the response
    let extractedData = {};

    try {
      // Clean the response text
      let cleanResponse = responseText.trim();
      
      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```json\s*/g, '');
      cleanResponse = cleanResponse.replace(/```\s*$/g, '');
      
      // Find JSON object in the response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let jsonString = jsonMatch[0];
        
        // Parse the JSON
        extractedData = JSON.parse(jsonString);
        
        // Validate and ensure consistent structure
        extractedData = await validateAndStructureData(extractedData);
        
      } else {
        throw new Error('No JSON object found in response');
      }
    } catch (parseError) {
      console.log('JSON Parse Error:', parseError.message);
      console.log('Raw Response:', responseText);
      
      // Try to extract data manually if JSON parsing fails
      extractedData = {
        error: 'Failed to parse JSON response',
        raw_response: responseText,
        parse_error: parseError.message,
        extracted_at: new Date().toISOString(),
        source_url: imageUrl
      };
    }

    // Add metadata to the response
    const responseData = {
      success: true,
      data: extractedData,
      metadata: {
        source_url: imageUrl,
        image_size: imageBuffer.length,
        media_type: mediaType,
        processed_at: new Date().toISOString()
      },
      message: 'Invoice data extracted successfully'
    };

    // console.log('Response Data Items:', responseData.data.items);
    console.log('Response Data:', responseData);

    return Response.json(responseData);
  } catch(error) {
    console.error('Error processing image:', error);

    return Response.json(
      {
        error: 'Failed to process image',
        details: error.message,
        success: false,
        url: imageUrl
      },
      { status: 500 }
    );
  }
}

async function validatePDFFileAndStructureData(data) {
  const structuredData = {
    company: {
      name: data.company?.name || null,
      address: data.company?.address || null,
      city: data.company?.city || null,
      state: data.company?.state || null,
      country: data.company?.country || null,
      zip_code: data.company?.zip_code || null,
      phone: data.company?.phone || null,
      fax: data.company?.fax || null,
      email: data.company?.email || null
    },
    invoice: {
      number: data.invoice?.number || null,
      date: data.invoice?.date || null,
      terms: data.invoice?.terms || null,
      po_number: data.invoice?.po_number || null
    },
    customer: {
      billing_address: {
        company_name: data.customer?.billing_address?.company_name || null,
        contact_person: data.customer?.billing_address?.contact_person || null,
        address: data.customer?.billing_address?.address || null,
        city: data.customer?.billing_address?.city || null,
        state: data.customer?.billing_address?.state || null,
        country: data.customer?.billing_address?.country || null,
        zip_code: data.customer?.billing_address?.zip_code || null,
        phone: data.customer?.billing_address?.phone || null,
        email: data.customer?.billing_address?.email || null
      },
      shipping_address: {
        company_name: data.customer?.shipping_address?.company_name || null,
        contact_person: data.customer?.shipping_address?.contact_person || null,
        address: data.customer?.shipping_address?.address || null,
        city: data.customer?.shipping_address?.city || null,
        state: data.customer?.shipping_address?.state || null,
        country: data.customer?.shipping_address?.country || null,
        zip_code: data.customer?.shipping_address?.zip_code || null,
        phone: data.customer?.shipping_address?.phone || null,
        email: data.customer?.shipping_address?.email || null
      }
    },
    items: Array.isArray(data.items) ? data.items.map(item => ({
      item_code: item.item_code || null,
      quantity: typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity) || 0,
      description: item.description || null,
      color: item.color || null,
      size: item.size || null,         
      price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
      amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0
    })) : [],
    shipping: {
      method: data.shipping?.method || null,
      tracking_number: data.shipping?.tracking_number || null,
      ship_date: data.shipping?.ship_date || null,
      ship_via: data.shipping?.ship_via || null,
      cost: typeof data.shipping?.cost === 'number' ? data.shipping.cost : parseFloat(data.shipping?.cost) || 0
    },
    totals: {
      subtotal: typeof data.totals?.subtotal === 'number' ? data.totals.subtotal : parseFloat(data.totals?.subtotal) || 0,
      tax: typeof data.totals?.tax === 'number' ? data.totals.tax : parseFloat(data.totals?.tax) || 0,
      shipping: typeof data.totals?.shipping === 'number' ? data.totals.shipping : parseFloat(data.totals?.shipping) || 0,
      total: typeof data.totals?.total === 'number' ? data.totals.total : parseFloat(data.totals?.total) || 0
    },
    notes: data.notes || null
  };

  return structuredData;
}

// Read PDF File
async function handleReadPdfFileText(body) {
  let pdfUrl

  try {
    pdfUrl = body?.pdf_url;

    console.log('Received PDF URL:', pdfUrl);

    if (!pdfUrl) {
      return Response.json(
        {
          error: "PDF URL is required",
          success: false,
        },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(pdfUrl);
    } catch (urlError) {
      return Response.json(
        {
          error: "Invalid URL format",
          success: false,
          provided_url: pdfUrl
        },
        { status: 400 }
      );
    }

    const anthropic = getAnthropicClient();

    // Download the PDF
    let pdfResponse;

    try {
      pdfResponse = await axios.get(pdfUrl, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout (PDFs can be larger)
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
    } catch (downloadError) {
      return Response.json(
        {
          error: "Failed to download PDF from URL",
          success: false,
          details: downloadError.message,
          url: pdfUrl
        },
        { status: 400 }
      );
    }

    // Validate it's actually a PDF
    const contentType = pdfResponse.headers['content-type'] || '';
    const isPdf =
      contentType.includes('pdf') ||
      pdfUrl.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      return res.status(400).send({
        error: 'URL does not appear to point to a PDF file',
        success: false,
        content_type: contentType,
        url: pdfUrl
      });
    }

    // Convert to base64
    const pdfBuffer = Buffer.from(pdfResponse.data);
    const base64Pdf = pdfBuffer.toString('base64');

    // Create the message for Claude — PDFs are sent as "document" type
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64Pdf,
              },
            },
            {
              type: "text",
              text: `Please analyze this invoice PDF and extract all the data into a structured JavaScript object format.

              IMPORTANT: Be very careful and consistent when extracting address information and line items. Always follow the exact structure provided below.

              Extract the following information:
              1. Company/Vendor details (name, address, contact info)
              2. Invoice details (number, date, terms, PO number if any)
              3. Customer information with consistent address structure
              4. All line items — follow the item extraction rules below carefully
              5. Shipping information (method, tracking, dates)
              6. Total amounts and any taxes
              7. Any additional notes or special instructions

              --- ITEM EXTRACTION RULES ---

              RULE 1 — Color column:
                - Look at the invoice table headers carefully
                - If a dedicated "Color" column exists, read the color value from that column for each line item
                - If the color value is an abbreviation or code (e.g. WHT, BLK, SIL, NAV, YEL, MUL), resolve it to the full color name
                - Common abbreviations to resolve:
                    WHT / WHHT = White
                    BLK = Black
                    SIL = Silver
                    NAV = Navy
                    GLD = Gold
                    YEL = Yellow
                    RED = Red
                    BLU = Blue
                    GRN = Green
                    BRN = Brown
                    GRY / GRA = Gray
                    PUR / PRP = Purple
                    PNK = Pink
                    ORG = Orange
                    TAN = Tan
                    CHA / CHAR = Charcoal
                    BUR / BURG = Burgundy
                    MUL / MULT = Multicolor
                    CRM = Cream
                    IVR / IVY = Ivory
                    CAM = Camel
                    WNE / WIN = Wine
                - For compound colors separated by / (e.g. NAV/GLD, CHPP, WGP, CHPB), resolve each part and join with /
                    NAV/GLD = Navy/Gold
                    CHPP = Champagne/Purple
                    WGP = White/Gold/Purple
                    CHPB = Champagne/Purple/Blue
                - Put the resolved full color name in "color" in lowercase (e.g. "white", "black", "navy/gold")
                - If the color cannot be resolved from the abbreviation, keep the original value as-is
                - If no Color column exists in the table, set color to null for all items

              RULE 2 — Size column:
                - Look at the invoice table headers carefully
                - If a dedicated "Size" column exists, read the size value from that column for each line item
                - Put that value in "size" exactly as written (e.g. "48R", "46R", "42R", "38R", "44L")
                - If no Size column exists in the table, set size to null for all items

              RULE 3 — Item Code:
                - Use the Item Code column value exactly as it appears on the invoice (do not modify or parse it)

              RULE 4 — If a row has no value in Color or Size column (blank cell), set that field to null for that row

              --- END ITEM RULES ---

              Please return ONLY a valid JSON object with this EXACT structure. Make sure all numeric values are numbers, not strings:

              {
                "company": {
                  "name": "Company Name",
                  "address": "Street Address",
                  "city": "City",
                  "state": "State",
                  "country": "Country",
                  "zip_code": "ZIP Code",
                  "phone": "Phone Number",
                  "fax": "Fax Number",
                  "email": "Email Address"
                },
                "invoice": {
                  "number": "Invoice Number",
                  "date": "Invoice Date",
                  "terms": "Payment Terms",
                  "po_number": "PO Number if available"
                },
                "customer": {
                  "billing_address": {
                    "company_name": "Customer Company Name",
                    "contact_person": "Contact Person Name",
                    "address": "Street Address",
                    "city": "City",
                    "state": "State",
                    "country": "Country",
                    "zip_code": "ZIP Code",
                    "phone": "Phone Number if available",
                    "email": "Email if available"
                  },
                  "shipping_address": {
                    "company_name": "Shipping Company Name",
                    "contact_person": "Contact Person Name",
                    "address": "Street Address",
                    "city": "City",
                    "state": "State",
                    "country": "Country",
                    "zip_code": "ZIP Code",
                    "phone": "Phone Number if available",
                    "email": "Email if available"
                  }
                },
                "items": [
                  {
                    "item_code": "Item code exactly as printed on invoice",
                    "quantity": 0,
                    "description": "Full item description as written on invoice",
                    "color": "Value from Color column if column exists, else null",
                    "size": "Value from Size column if column exists, else null",
                    "price": 0.00,
                    "amount": 0.00
                  }
                ],
                "shipping": {
                  "method": "Shipping Method",
                  "tracking_number": "Tracking Number",
                  "ship_date": "Shipping Date",
                  "ship_via": "Shipping Via",
                  "cost": 0.00
                },
                "totals": {
                  "subtotal": 0.00,
                  "tax": 0.00,
                  "shipping": 0.00,
                  "total": 0.00
                },
                "notes": "Additional notes or special instructions"
              }

              CRITICAL RULES:
              1. Extract addresses exactly as they appear on the invoice
              2. Split full addresses into separate components (address, city, state, country, zip_code)
              3. If Bill To and Ship To are the same, duplicate the information in both sections
              4. If any field is not available, use null (not empty string)
              5. Ensure all numbers are numeric values, not strings
              6. Return ONLY the JSON object, no additional text or explanation
              7. If country is not explicitly mentioned, infer from state/zip code format (US format = "US")
              8. Be consistent with field names and structure every time
              9. Never try to guess or parse color/size from item codes — only read from dedicated columns`
            }
          ],
        },
      ],
    });

    // Extract the response text
    const responseText = message.content[0].text;

    // Try to extract JSON from the response
    let extractedData = {};

    try {
      // Clean the response text
      let cleanResponse = responseText.trim();

      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```json\s*/g, '');
      cleanResponse = cleanResponse.replace(/```\s*$/g, '');

      // Find JSON object in the response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let jsonString = jsonMatch[0];

        // Parse the JSON
        extractedData = JSON.parse(jsonString);

        // Validate and ensure consistent structure
        extractedData = await validatePDFFileAndStructureData(extractedData);

      } else {
        throw new Error('No JSON object found in response');
      }
    } catch (parseError) {
      console.log('JSON Parse Error:', parseError.message);
      console.log('Raw Response:', responseText);

      extractedData = {
        error: 'Failed to parse JSON response',
        raw_response: responseText,
        parse_error: parseError.message,
        extracted_at: new Date().toISOString(),
        source_url: pdfUrl
      };
    }

    // Add metadata to the response
    const responseData = {
      success: true,
      data: extractedData,
      metadata: {
        source_url: pdfUrl,
        file_size: pdfBuffer.length,
        media_type: 'application/pdf',
        processed_at: new Date().toISOString()
      },
      message: 'Invoice data extracted successfully'
    };

    console.log('Response Data:', responseData);

    return Response.json(responseData);

  } catch (error) {
    console.error('Error processing pdf file:', error);

    return Response.json(
      {
        error: 'Failed to process pdf file',
        details: error.message,
        success: false,
        url: pdfUrl
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
      return Response.json({
        success: true,
        message,
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
    console.error("GET /api/claude error:", error);
    return Response.json(
      {
        error: true,
        message: error.message || "Internal server error",
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
            "action is required. Use one of: product_name_formator, read_image_file_text, read_pdf_file_text",
        },
        { status: 400 }
      );
    }

    if (action === "product_name_formator") {
      return await handleProductNameFormator(body);
    }

    if (action === "read_image_file_text") {
      return await handleReadImageFileText(body);
    }

    if (action === "read_pdf_file_text") {
      return await handleReadPdfFileText(body);
    }

    return Response.json(
      {
        error: true,
        message: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/claude error:", error);
    return Response.json(
      {
        error: true,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}