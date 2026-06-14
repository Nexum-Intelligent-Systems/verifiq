// Live smoke test for the magic-code /intake endpoint (docs/43 step 5).
//
// POSTs a real intake to a deployed Convex httpAction, which creates a project
// and emails a secure upload link. Use against a live deployment only — there
// are no secrets here; the endpoint does the work.
//
//   node scripts/smoke-intake.mjs <intake-url> <work-email> [project-name]
//
// e.g. node scripts/smoke-intake.mjs https://acme-123.convex.site/intake you@firm.ie

const [, , url, email, projectName] = process.argv;

if (!url || !email) {
  console.error("usage: node scripts/smoke-intake.mjs <intake-url> <work-email> [project-name]");
  process.exit(2);
}

const body = {
  name: "Smoke Test",
  email,
  project_name: projectName || "Smoke test pack",
  practice: "VerifIQ smoke",
  notes: "Automated go-live smoke (docs/43).",
  purpose: "first_read",
};

try {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log(`HTTP ${res.status}`);
  console.log(text);
  if (res.ok) {
    console.log(`\n✓ Intake accepted. Check ${email} for the secure upload link,`);
    console.log("  then confirm a project appears in the Convex dashboard.");
    process.exit(0);
  }
  console.error("\n✗ Intake was not accepted — see the status/body above.");
  process.exit(1);
} catch (err) {
  console.error("✗ Request failed:", err.message);
  process.exit(1);
}
