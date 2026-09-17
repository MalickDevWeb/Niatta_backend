const fetch = require('node-fetch'); // Next.js node context has global fetch in node 18+, we can just use native fetch

async function run() {
  console.log("1. Création d'un agent terrain...");
  const createRes = await fetch('http://localhost:3000/api/admin/field-agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prenom: 'Agent',
      nom: 'Test',
      phone: '772223344',
      password: 'pass'
    })
  });
  const createData = await createRes.json();
  console.log("Réponse Création:", createData);

  if (!createData.success) {
    console.log("L'agent existe peut-être déjà. Tentative de login...");
  } else {
    console.log("Agent créé avec succès ! Mot de passe:", createData.data.password);
  }

  console.log("\n2. Connexion avec l'agent...");
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '772223344',
      password: createData.success ? createData.data.password : 'pass'
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

run();
