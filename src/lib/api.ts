const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface RequestOptions extends RequestInit {
  bodyData?: any;
}

async function request(path: string, options: RequestOptions = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.bodyData && !(options.bodyData instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.bodyData);
  } else if (options.bodyData instanceof FormData) {
    options.body = options.bodyData;
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, fetchOptions);

  // If response is a CSV download, return plain text
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    if (!response.ok) {
      throw new Error('Failed to download CSV data.');
    }
    return response.text();
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API Request failed');
  }

  return data;
}

export const api = {
  get: (path: string, options?: RequestOptions) => 
    request(path, { ...options, method: 'GET' }),
    
  post: (path: string, bodyData?: any, options?: RequestOptions) => 
    request(path, { ...options, method: 'POST', bodyData }),
    
  put: (path: string, bodyData?: any, options?: RequestOptions) => 
    request(path, { ...options, method: 'PUT', bodyData }),
    
  delete: (path: string, options?: RequestOptions) => 
    request(path, { ...options, method: 'DELETE' }),
};
