import connect from "@/lib/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Ensure database is connected before proceeding
  await connect();
  try {
    const body = await request.json();
    
    const { email, type, count } = body;
    
    if (!email || !type || typeof count !== 'number') {
      return NextResponse.json(
        { error: "Email, type, and count are required" },
        { status: 400 }
      );
    }

    // Validate the type is one of our expected fields
    const validTypes = ['vishnuSahasranama', 'lalithaSahasranama', 'durgaSaptashati', 'navarnaCount'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid count type" },
        { status: 400 }
      );
    }

    // Find the user and update the specific count
    
    // First, ensure the user exists with all required fields
    await User.updateOne(
      { email },
      {
        $setOnInsert: {
          email,
          vishnuSahasranama: 0,
          lalithaSahasranama: 0,
          durgaSaptashati: 0,
          navarnaCount: 0
        }
      },
      { upsert: true }
    );

    // Set the count to the exact value provided
    const updateOp = {
      $set: { [type]: count }
    };
    
    // Perform the update operation
    const updatedUser = await User.findOneAndUpdate(
      { email },
      updateOp,
      { 
        new: true,
        projection: {
          email: 1,
          vishnuSahasranama: { $ifNull: ['$vishnuSahasranama', 0] },
          lalithaSahasranama: { $ifNull: ['$lalithaSahasranama', 0] },
          durgaSaptashati: { $ifNull: ['$durgaSaptashati', 0] },
          navarnaCount: { $ifNull: ['$navarnaCount', 0] },
          updatedAt: 1
        }
      }
    );
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update count" },
        { status: 500 }
      );
    }

    // Return the updated counts
    const responseData = {
      email: updatedUser.email,
      vishnuSahasranama: updatedUser.vishnuSahasranama || 0,
      lalithaSahasranama: updatedUser.lalithaSahasranama || 0,
      durgaSaptashati: updatedUser.durgaSaptashati || 0,
      navarnaCount: updatedUser.navarnaCount || 0,
      _id: updatedUser._id,
      updatedAt: updatedUser.updatedAt
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Update error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
