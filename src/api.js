import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = (
  process.env.EXPO_PUBLIC_API_URL ||
  'https://server-fawn-eta.vercel.app/api'
).replace(/\/$/, '');

async function request(path, options = {}) {
  const token = await AsyncStorage.getItem('token');

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw {
      ...data,
      status: res.status,
    };
  }

  return data;
}

export const auth = {
  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const api = {
  doctors: {
    list: () => request('/doctors'),
    get: (id) => request(`/doctors/${id}`),
  },

  appointments: {
    list: () => request('/appointments'),

    create: (payload) =>
      request('/appointments', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    updateStatus: (id, status) =>
      request(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    remove: (id) =>
      request(`/appointments/${id}`, {
        method: 'DELETE',
      }),
  },

  admin: {
    listDoctors: () => request('/admin/doctors'),

    addDoctor: (payload) =>
      request('/admin/doctors', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    updateDoctor: (id, payload) =>
      request(`/admin/doctors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),

    removeDoctor: (id) =>
      request(`/admin/doctors/${id}`, {
        method: 'DELETE',
      }),

    stats: () => request('/admin/stats'),

    listAppointments: () =>
      request('/admin/appointments'),
  },

  suggestReason: (symptoms) =>
    request('/suggest-reason', {
      method: 'POST',
      body: JSON.stringify({ text: symptoms }),
    }),
};

export { API_BASE };