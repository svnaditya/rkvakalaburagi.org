import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  name: {
    type: String,
    required: false,
  },
  mobile: {
    type: String,
    required: false,
  },
  vishnuSahasranama: {
    type: Number,
    default: 0,
  },
  lalithaSahasranama: {
    type: Number,
    default: 0,
  },
  durgaSaptashati: {
    type: Number,
    default: 0,
  },
  navarnaCount: {
    type: Number,
    default: 0,
  },
});

const User = mongoose.models.users || mongoose.model("users", userSchema);

export default User;
