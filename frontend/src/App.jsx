import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // You can add custom CSS or configure Tailwind here

function App() {
  const [devices, setDevices] = useState([]);
  const [deviceName, setDeviceName] = useState('');
  const [macAddress, setMacAddress] = useState('');

  const fetchDevices = async () => {
    const res = await axios.get('http://localhost:5000/api/devices');
    setDevices(res.data);
  };

  useEffect(() => {
    fetchDevices();
    // Auto-refresh the list every 15 seconds to sync with backend scans
    const interval = setInterval(fetchDevices, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/devices', { deviceName, macAddress });
      setDeviceName('');
      setMacAddress('');
      fetchDevices();
    } catch (error) {
      alert('Error adding device. Ensure MAC is unique and formatted correctly (e.g., 00:11:22:33:44:55).');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Local Wi-Fi Monitor</h1>
      
      <form onSubmit={handleAddDevice} style={{ marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Device Name (e.g. My Phone)" 
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          required
          style={{ marginRight: '1rem', padding: '0.5rem' }}
        />
        <input 
          type="text" 
          placeholder="MAC Address (00:11:22...)" 
          value={macAddress}
          onChange={(e) => setMacAddress(e.target.value)}
          required
          style={{ marginRight: '1rem', padding: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Track Device</button>
      </form>

      <h2>Tracked Devices</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {devices.map(device => (
          <li key={device._id} style={{ 
            padding: '1rem', 
            marginBottom: '0.5rem',
            border: `2px solid ${device.isConnected ? 'green' : 'red'}`,
            borderRadius: '8px'
          }}>
            <strong>{device.deviceName}</strong> ({device.macAddress}) <br/>
            Status: {device.isConnected ? '🟢 Online' : '🔴 Offline'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;