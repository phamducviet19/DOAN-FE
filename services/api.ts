export const API_HOST = 'http://localhost:5000';
const API_BASE_URL = `${API_HOST}/api`;

const getAuthToken = () => localStorage.getItem('authToken');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type') && options.body) {
    headers.append('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });

  const responseText = await response.text();
  let responseData;
  try {
    responseData = responseText ? JSON.parse(responseText) : {};
  } catch (e) {
    responseData = { message: 'An unexpected non-JSON response was received.' };
  }

  if (!response.ok) {
    throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204 || !responseText) {
    return {} as T;
  }
  
  return responseData as T;
}

const api = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint:string, body: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, { ...options, method: 'POST', body: isFormData ? body : JSON.stringify(body) });
  },
  put: <T>(endpoint:string, body: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, { ...options, method: 'PUT', body: isFormData ? body : JSON.stringify(body) });
  },
  patch: <T>(endpoint: string, body: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, { ...options, method: 'PATCH', body: isFormData ? body : JSON.stringify(body) });
  },
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;