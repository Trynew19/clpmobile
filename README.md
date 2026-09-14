# clp Mobile — Expo SDK 57

React Native / Expo mobile version of the clp appointment app.

## Requirements
- Node.js 22.13.x or newer
- Android phone with Expo Go SDK 57, or Android emulator
- Existing clp Node/Express backend running on port 5000

## Clean install
From this folder:

```powershell
node -v
npm install
npx expo-doctor
npx expo start -c
```

Do NOT use `npm install --force` or `npm install --legacy-peer-deps`. The package versions are intentionally aligned for Expo SDK 57.

## Backend URL
Create `.env` in the project root:

```env
EXPO_PUBLIC_API_URL=http://YOUR_PC_LAN_IP:5000/api
```

For an Android emulator, use:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
```

For a physical Android phone, replace `YOUR_PC_LAN_IP` with the computer's LAN IPv4 address, for example `http://192.168.1.7:5000/api`. The phone and PC must be on the same Wi-Fi network.

## Main features
- Patient registration/login
- Doctor registration/login
- Find/search doctors
- Doctor profile
- Date/time appointment booking
- AI-assisted reason suggestion
- My appointments
- Appointment status
- Doctor dashboard
- Admin dashboard
- Admin doctor management
- Daily/weekly/monthly/yearly appointment statistics

The backend API remains the same as the supplied clp backend.
