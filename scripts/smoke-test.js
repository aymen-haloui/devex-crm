(async () => {
  const base = process.env.BASE_URL || 'http://localhost:3001';
  const tests = [
    {
      path: '/api/mass-actions/tags',
      method: 'POST',
      body: { entity: 'Contacts', ids: ['1','2'], tag: 'smoke-test' }
    },
    {
      path: '/api/mass-actions/dedupe',
      method: 'POST',
      body: { entity: 'Contacts', items: [{ id: '1', email: 'a@x.com' }, { id: '2', email: 'a@x.com' }, { id: '3', email: 'b@x.com' }] }
    },
    {
      path: '/api/mass-actions/update',
      method: 'POST',
      body: { entity: 'Contacts', ids: ['1','2'], updates: { status: 'active' } }
    }
  ];

  for (const t of tests) {
    try {
      console.log('---', t.path, '---');
      // Include a dev auth cookie + header-based identity so middleware and
      // request auth short-circuit accept the request in local dev.
      const res = await fetch(base + t.path, {
        method: t.method,
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'auth-token=dev',
          'x-user-id': 'dev',
          'x-organization-id': 'org1',
          'x-user-email': 'dev@dx.local',
          'x-user-role': 'admin'
        },
        body: JSON.stringify(t.body)
      });
      const text = await res.text();
      console.log('Status:', res.status);
      try { console.log('Body:', JSON.parse(text)); } catch { console.log('Body (raw):', text); }
    } catch (err) {
      console.error('Error calling', t.path, err);
    }
  }
})();
