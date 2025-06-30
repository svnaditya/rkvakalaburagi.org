import connect from "@/lib/dbConfig";
import User from "@/models/userModel";
import { NextResponse } from "next/server";

// Enable caching for 1 hour
export const revalidate = 3600;

connect();

export async function GET() {
  try {
    // Get total metrics across all users
    const result = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          navarnaCount: { $sum: "$navarnaCount" },
          vishnuSahasranama: { $sum: "$vishnuSahasranama" },
          lalithaSahasranama: { $sum: "$lalithaSahasranama" },
          durgaSaptashati: { $sum: "$durgaSaptashati" },
        },
      },
    ]);

    const metrics = result[0] || {
      totalUsers: 0,
      navarnaCount: 0,
      vishnuSahasranama: 0,
      lalithaSahasranama: 0,
      durgaSaptashati: 0,
    };

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers: metrics.totalUsers,
        byPractice: {
          navarna: metrics.navarnaCount,
          vishnuSahasranama: metrics.vishnuSahasranama,
          lalithaSahasranama: metrics.lalithaSahasranama,
          durgaSaptashati: metrics.durgaSaptashati,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
