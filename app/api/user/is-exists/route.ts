import { NextRequest, NextResponse } from "next/server";
import { getUserFromKeycloak } from "@/lib/keycloakAdminOperations";
import { getAccessToken } from "@/lib/keycloakTokenManager";


export async function POST(request: NextRequest) {
    const body = await request.json();
    const email = body.email;
    const token = await getAccessToken();
    const user = await getUserFromKeycloak(token, email);
    if (user.length > 0) {
        return NextResponse.json({ success: true, message: "User exists" });
    } else {
        return NextResponse.json({ success: false, message: "User does not exist" });
    }
}