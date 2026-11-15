# 📡 Local Wi-Fi Network Monitor & Telegram Bot

A full-stack MERN (MongoDB, Express, React, Node.js) application that continuously monitors your local Wi-Fi network and sends real-time Telegram notifications whenever specific devices (like a personal phone) connect or disconnect from the network.

## ✨ Features

- **Real-Time Telegram Alerts:** Get instant `🟢 Connected` and `🔴 Disconnected` push notifications via a custom Telegram bot.
- **Native Network Sweeping:** Bypasses router admin restrictions by using native Node.js ping sweeps and Windows/Linux ARP table scanning.
- **React Management Dashboard:** A clean UI to add, track, and monitor the real-time status of devices by their MAC addresses.
- **Smart State Management:** Uses MongoDB to remember device states, ensuring you only get notified when a device's connection status *changes* (no notification spam).
- **Dual-Band Support:** Capable of scanning both `192.168.1.x` and `192.168.0.x` subnets to catch devices regardless of whether they connect to the 5G or 4G bands.

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Local)
- **Integrations:** Telegram Bot API (Native HTTP `fetch`)
- **System Tools:** `child_process` (arp -a, ping)

## ⚠️ Crucial Requirements

1. **Local Hosting Only:** Because this app relies on scanning physical network ARP tables, the backend **cannot** be deployed to cloud services like Vercel or Render. It must run on a local machine (Windows PC, Mac, or Raspberry Pi) connected to the same Wi-Fi router.
2. **Device MAC Address:** Modern smartphones use "Randomized MAC Addresses" for privacy. To track a phone reliably, you must go to the phone's Wi-Fi settings and change the Privacy setting for your home network to **"Use Device MAC"** (Hardware MAC).

---

## 🚀 Installation & Setup

### 1. Provision the Telegram Bot
1. Open Telegram and search for `@BotFather`.
2. Send `/newbot` and follow the prompts to get your **HTTP API Token**.
3. Start a chat with your new bot and send a test message.
4. Visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in your browser to find your **Chat ID**.

### 2. Clone the Repository
```bash
git clone <your-repository-url>
cd wifi-monitor

### 3. Backend Setup
Open a terminal and navigate to the backend folder:

cd backend
npm install express mongoose cors dotenv

Create a .env file in the backend directory:

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/wifi-monitor
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Make sure your local MongoDB server is running first!
npm start

4. Frontend Setup
Open a second terminal window and navigate to the frontend folder:

cd frontend
npm install
npm run dev

The React dashboard will be available at http://localhost:5173.

💻 Usage Instructions
Ensure your phone's Wi-Fi Privacy setting is set to "Use Device MAC".

Find your phone's Hardware MAC address in its settings (e.g., 68:62:8A:42:C2:23).

Open the React dashboard, type in a device name (e.g., "My iQOO Phone") and the MAC address.

Click Track Device.

Turn your phone's Wi-Fi off and wait ~15 seconds. You will receive a Disconnected alert. Turn it back on to receive a Connected alert.

🕰️ Running 24/7 in the Background (Windows)
To keep the monitor running even if you close the terminal, use PM2:

Bash
# Install PM2 globally
npm install -g pm2

# Start the backend process
cd backend
pm2 start server.js --name "wifi-monitor-bot"

# (Optional) Set it to start automatically if the PC restarts
npm install -g pm2-windows-startup
pm2-startup install
pm2 save
Note: Make sure to adjust your Windows Power Settings so the PC never goes to sleep while plugged in.

Author: Jatin Kumar