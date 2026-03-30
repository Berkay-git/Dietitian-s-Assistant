// Change this IP when switching devices
// Android Emulator: 10.0.2.2
// iOS Simulator:    127.0.0.1
// Physical Device:  your local IP (e.g. 192.168.1.x)
const PORT = 5000;
const AndroidEmulatorIP = "10.0.2.2";
const iOSSimulatorIP = "127.0.0.1";
const CemHotstopIP = "172.20.10.2";
export const BASE_URL = `http://${AndroidEmulatorIP}:${PORT}`;
export const API_URL = `${BASE_URL}/api/dietitian`;