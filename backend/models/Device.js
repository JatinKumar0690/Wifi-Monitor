import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
    deviceName: { type: String, required: true },
    macAddress: { type: String, required: true, unique: true },
    isConnected: { type: Boolean, default: false },
    isTracking: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Device', deviceSchema);