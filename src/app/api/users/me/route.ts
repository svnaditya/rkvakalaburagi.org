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

    // Try to find existing user
    let user = await User.findOne({ email });

    // If user doesn't exist, create a new one with default values
    if (!user) {
      user = new User({
        email,
        vishnuSahasranama: 0,
        lalithaSahasranama: 0,
        durgaSaptashati: 0,
        navarnaCount: 0,
      });
      await user.save();
    }

    // Return only the necessary user data
    const userData = {
      email: user.email,
      vishnuSahasranama: user.vishnuSahasranama || 0,
      lalithaSahasranama: user.lalithaSahasranama || 0,
      durgaSaptashati: user.durgaSaptashati || 0,
      navarnaCount: user.navarnaCount || 0,
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error in /api/users/me:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
