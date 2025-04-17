const request = (url, body) =>
    fetch(url, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(body),
    }).then(async (r) => {
      if (!r.ok) throw new Error((await r.json()).message || 'Request failed');
      return r.json();
    });
  
  export const signUp = (data) => request('/api/auth/register', data);
  export const signIn = (data) => request('/api/auth/login',    data);
  