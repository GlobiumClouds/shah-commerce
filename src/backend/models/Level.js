import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true, uppercase: true },
    sessionYear: { type: Number, sparse: true }, // For sessions like 2025, 2026
    isActive: { type: Boolean, default: true }, // For session status
    order: { type: Number, default: 0 },
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

levelSchema.index({ name: 1 });
levelSchema.index({ code: 1 });
levelSchema.index({ sessionYear: 1 });
levelSchema.index({ isActive: 1 });

const Level = mongoose.models.Level || mongoose.model('Level', levelSchema);

export default Level;
