const fetch = require('node-fetch');

async function run() {
  console.log("1. Création d'un agent terrain...");
  const phone = '77' + Math.floor(1000000 + Math.random() * 9000000).toString();
  const createRes = await fetch('http://localhost:3000/api/admin/field-agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prenom: 'Nouvel',
      nom: 'Agent',
      phone: phone,
      password: 'pass'
    })
  });
  const createData = await createRes.json();
  console.log("Réponse Création:", createData);

  if (createData.success) {
    console.log("Agent créé avec succès ! Mot de passe:", createData.data.password);
    
    console.log("\n2. Connexion avec l'agent...");
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phone,
        password: createData.data.password
      })
    });
    const loginData = await loginRes.json();
    console.log("Réponse Login:", JSON.stringify(loginData, null, 2));

    if (loginData.success) {
      const roles = loginData.data.user.roles;
      const isFieldAgent = roles.some(r => r.role.slug === 'homme_terrain');
      console.log("Est-ce un agent terrain ?", isFieldAgent ? "✅ OUI" : "❌ NON");
    }
  }
}

run();
