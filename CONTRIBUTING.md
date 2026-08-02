# Contributing to CarbonSnap

Thank you for your interest in contributing! We welcome developers, carbon accounting experts, sustainability consultants, and documentation writers.

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). For detailed development setup, see the [Contributor Guide](docs/technical/contributor-guide.md).

---

## Developer Certificate of Origin (DCO)

We require all commits to be signed off per the **Developer Certificate of Origin v1.1**. The `Signed-off-by` line in your commit message certifies that you have the right to submit the contribution under the project's open-source license.

Sign off your commits automatically:

```bash
git commit -s -m "feat: add emission factor pack for Canada 2024"
```

---

## Contribution workflow

1. **Fork** the repository on GitHub.
2. **Create a feature branch:** `git checkout -b feat/new-emission-country-pack`
3. **Make your changes** — follow the coding standards (strict TypeScript, Tailwind design system).
4. **Verify:** `npm run lint` and `npm run build` must pass.
5. **Sign off and push:** `git commit -s && git push -u origin <branch>`
6. **Open a pull request** describing the problem solved and how it was verified.

---

## Adding an emission factor country pack

One of the most impactful contributions — localized factor datasets (DEFRA, EPA, ADEME, Environment Canada, …).

1. Create the pack in `/emission-factors/` (e.g. `CA_2024.json`) following the [schema](emission-factors/README.md).
2. Include required metadata: `countryCode`, `year`, `sourceAuthority`, `publicationDate`, and standard activity categories.
3. Validate:
   ```bash
   python scripts/update_emission_factors.py --validate emission-factors/CA_2024.json
   ```
4. Reference the new pack in `/emission-factors/README.md` and the README table.

---

## Coding standards

* **TypeScript strict mode** — no `any` in new code.
* **React:** functional components with explicit, typed props; existing component patterns.
* **Styling:** Tailwind utility classes following the existing high-contrast, accessible design system.
* **Calculations:** any change to `src/lib/calculator.ts` or factor data must match official GHG Protocol / IPCC published formulas.

---

## Reporting issues

* **Bugs** → [GitHub Issues](https://github.com/Yashraghuvans/CarbonSnap/issues)
* **Security vulnerabilities** → [SECURITY.md](SECURITY.md) (never file these publicly)
