import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import util from 'util';
import Device from './models/Device.js'; 

dotenv.config();
const execPromise = util.promisify(exec);
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to push notifications via Telegram
const sendTelegramMessage = async (messageText) => {
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        
        if (!token || !chatId) return;

        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: chatId, 
                text: messageText, 
                parse_mode: 'Markdown' 
            })
        });
    } catch (error) {
        console.error('Telegram API Error:', error.message);
    }
};

// Windows-compatible ARP scanner
async function getActiveMacAddresses() {
    try {
        const { stdout } = await execPromise('arp -a');
        const macRegex = /([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/g;
        const matches = stdout.match(macRegex) || [];
        return matches.map(mac => mac.replace(/-/g, ':').toLowerCase());
    } catch (error) {
        return [];
    }
}

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Error:', err));

// API Routes
app.post('/api/devices', async (req, res) => {
    try {
        const { deviceName, macAddress } = req.body;
        const newDevice = new Device({ deviceName, macAddress: macAddress.trim() });
        await newDevice.save();
        res.status(201).json(newDevice);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/devices', async (req, res) => {
    try {
        const devices = await Device.find();
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch devices' });
    }
});

// Background Network Scanner Loop
setInterval(async () => {
    try {
        const devicesToTrack = await Device.find({ isTracking: true });
        if (devicesToTrack.length === 0) return;

        // Sweeps both standard Airtel subnets to ensure the 4G network is caught 
        // If your 4G network uses a different IP (like 192.168.2.x), add it to this array.
        const subnetsToSweep = ['192.168.1', '192.168.0']; 
        
        for (let baseIp of subnetsToSweep) {
            for (let i = 1; i <= 254; i++) {
                exec(`ping -n 1 -w 200 ${baseIp}.${i}`, () => {});
            }
        }

        // Wait for devices to reply and Windows to log the MAC
        await wait(3500);

        const activeMacs = await getActiveMacAddresses();

        for (let device of devicesToTrack) {
            const targetMac = device.macAddress.replace(/-/g, ':').toLowerCase();
            const currentlyConnected = activeMacs.includes(targetMac);

            if (currentlyConnected && !device.isConnected) {
                device.isConnected = true;
                await device.save();
                await sendTelegramMessage(`🟢 *${device.deviceName}* has connected to the Wi-Fi.`);
            } 
            else if (!currentlyConnected && device.isConnected) {
                device.isConnected = false;
                await device.save();
                await sendTelegramMessage(`🔴 *${device.deviceName}* has disconnected.`);
            }
        }
    } catch (error) {
        console.error('Scanner Error:', error.message);
    }
}, 15000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));