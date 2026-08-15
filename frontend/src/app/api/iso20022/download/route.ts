/**
 * @module ISO20022DownloadRoute
 * @description API endpoint to generate and download ISO 20022 pacs.008.001.08
 * XML files from transaction data. Generates banking-grade compliance artifacts
 * that can be imported into ERP systems.
 *
 * GET /api/iso20022/download?txHash=0x...
 * Returns: application/xml file download
 */

import { NextRequest, NextResponse } from "next/server";
import { getTransactions } from "@/lib/server/transactions";

/**
 * Converts an ISO 20022 JSON message object to valid XML.
 * Handles nested objects and arrays recursively.
 */
function jsonToXml(obj: Record<string, unknown>, indent: string = ""): string {
  let xml = "";

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;

    if (typeof value === "object" && !Array.isArray(value)) {
      // Handle special case for IntrBkSttlmAmt which has attributes
      if (key === "IntrBkSttlmAmt" && typeof value === "object") {
        const amt = value as Record<string, unknown>;
        xml += `${indent}<${key} Ccy="${amt.Ccy}">${amt.value}</${key}>\n`;
      } else {
        xml += `${indent}<${key}>\n`;
        xml += jsonToXml(value as Record<string, unknown>, indent + "  ");
        xml += `${indent}</${key}>\n`;
      }
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "object") {
          xml += `${indent}<${key}>\n`;
          xml += jsonToXml(item as Record<string, unknown>, indent + "  ");
          xml += `${indent}</${key}>\n`;
        } else {
          xml += `${indent}<${key}>${escapeXml(String(item))}</${key}>\n`;
        }
      }
    } else {
      xml += `${indent}<${key}>${escapeXml(String(value))}</${key}>\n`;
    }
  }

  return xml;
}

/** Escapes special XML characters. */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const txHash = searchParams.get("txHash");

    if (!txHash) {
      return NextResponse.json(
        { error: "Missing required parameter: txHash" },
        { status: 400 }
      );
    }

    // Find the transaction in our stored list
    const allTx = getTransactions();
    const tx = allTx.find((t) => t.txHash === txHash);

    if (!tx || !tx.iso20022) {
      return NextResponse.json(
        { error: "Transaction not found or has no ISO 20022 data" },
        { status: 404 }
      );
    }

    // Generate the XML document
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    const xmlNamespace = `<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n`;
    const xmlBody = jsonToXml(tx.iso20022 as unknown as Record<string, unknown>, "  ");
    const xmlFooter = `</Document>\n`;

    const fullXml = xmlHeader + xmlNamespace + xmlBody + xmlFooter;

    // Generate a filename from the message ID or tx hash
    const msgId = (tx.iso20022 as any)?.FIToFICstmrCdtTrf?.GrpHdr?.MsgId || txHash.slice(0, 10);
    const filename = `pacs008_${msgId}.xml`;

    return new NextResponse(fullXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[ISO 20022 Download] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate ISO 20022 XML" },
      { status: 500 }
    );
  }
}
