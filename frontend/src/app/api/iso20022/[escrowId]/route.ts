import { NextRequest, NextResponse } from "next/server";
import { getEscrow } from "@/lib/server/wallet";
import { generatePacs008XML } from "@/lib/iso20022";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ escrowId: string }> }
) {
  try {
    const { escrowId: paramEscrowId } = await params;
    const escrowId = parseInt(paramEscrowId, 10);
    if (isNaN(escrowId)) {
      return NextResponse.json({ error: "Invalid escrow ID" }, { status: 400 });
    }

    const escrow = await getEscrow(escrowId);
    
    // Only generate XML if the escrow is completed (settled)
    if (!escrow.isCompleted) {
      return NextResponse.json(
        { error: "Escrow is not yet settled. ISO 20022 XML is generated upon settlement." },
        { status: 400 }
      );
    }

    const xml = generatePacs008XML(
      escrow.id,
      escrow.buyer,
      escrow.seller,
      escrow.amountRaw,
      escrow.taxBps,
      Date.now()
    );

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename="pacs.008.001.10_ESC-${escrowId}.xml"`,
      },
    });
  } catch (error) {
    console.error("ISO 20022 generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate ISO 20022 XML" },
      { status: 500 }
    );
  }
}
