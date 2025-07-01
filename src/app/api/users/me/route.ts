import connect from "@/lib/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Ensure database is connected
    await connect();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Use findOneAndUpdate with upsert to handle concurrent requests
    const user = await User.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          email,
          name: "",
          mobile: "",
          vishnuSahasranama: 0,
          lalithaSahasranama: 0,
          durgaSaptashati: 0,
          navarnaCount: 0,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    // Explicitly get the values from the document
    const userData = user.toObject ? user.toObject() : user;

    // Return all user data with proper defaults
    return NextResponse.json({
      email: userData.email,
      name: userData.name || "",
      mobile: userData.mobile || "",
      vishnuSahasranama: userData.vishnuSahasranama || 0,
      lalithaSahasranama: userData.lalithaSahasranama || 0,
      durgaSaptashati: userData.durgaSaptashati || 0,
      navarnaCount: userData.navarnaCount || 0,
    });
  } catch (error) {
    console.error("Error in /api/users/me:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
