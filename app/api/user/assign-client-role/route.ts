
import { NextRequest, NextResponse } from "next/server";
import { assignClientRoleToUser } from "@/lib/keycloakAdminOperations";

export async function POST(request: NextRequest) {
  try {
    const { userId, clientUUID, roles } = await request.json();
    const response = await assignClientRoleToUser({ userId, clientUUID, roles });

    // If the inner call failed, reflect that in your main response
    if (!response.success) {
      return NextResponse.json({
        success: false,
        message: response.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Role assigned successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
