import { NextResponse } from "next/server";
import connect from "@/lib/dbConfig";
import User from "@/models/userModel";

export async function POST(request: Request) {
  try {
    const { email, name, mobile } = await request.json();
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 },
      );
    }

    await connect();
    // First, find the user to ensure they exist
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // Prepare update object
    const updateData: { name?: string; mobile?: string } = {};

    if (name) {
      updateData.name = name;
    }
    if (mobile) {
      updateData.mobile = mobile;
    }

    // Prepare the update operation to only set fields that don't exist
    interface IUpdateData {
      name?: string;
      mobile?: string;
    }
    const update: IUpdateData = {};

    if (name) {
      update["name"] = name;
    }
    if (mobile) {
      update["mobile"] = mobile;
    }

    // Update the user, only setting fields that don't exist
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: update },
      { new: true, runValidators: true },
    );

    return NextResponse.json({
      success: true,
      user: {
        name: updatedUser.name,
        mobile: updatedUser.mobile,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
