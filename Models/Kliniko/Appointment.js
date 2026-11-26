import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    department: { type: String, required: true, maxlength: 100 },
    doctorId: { type: String, required: true, maxlength: 200 },
    doctorName: { type: String, required: true, maxlength: 200 },
    date: { type: String, required: true },
    message: { type: String, default: "", maxlength: 2000 },
  },
  { timestamps: true },
);

export default mongoose.models.KlinikoAppointment ||
  mongoose.model("KlinikoAppointment", appointmentSchema);
