# Security Policy

CarbonSnap takes security seriously. We appreciate responsible disclosure from researchers and the community.

---

## Supported versions

| Version | Supported |
| :--- | :--- |
| Latest release | ✅ |
| `main` branch | ✅ |
| Older releases | ❌ |

Security fixes are released for the latest version only.

---

## Reporting a vulnerability

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Report privately via **GitHub Security Advisories**:
https://github.com/Yashraghuvans/CarbonSnap/security/advisories/new

### What to include

* Type of issue (e.g. auth bypass, XSS, CSRF, tenant isolation flaw, calculation tampering)
* Full proof of concept or step-by-step reproduction
* Impact assessment — especially anything affecting multi-tenant isolation or report integrity

### Our commitment

* Acknowledge receipt within **24 hours**
* Triage response and remediation estimate within **72 hours**
* Coordinated disclosure — we publish a security advisory and patch release once fixed

---

## What we protect

* **Tenant isolation:** every API route verifies the caller's Firebase ID token; ledger operations are scoped by `orgId`/`periodId`.
* **Report integrity:** SHA-256 checksums on reports and verification certificates.
* **Secrets:** no credentials in the repository — all secrets live in `.env` (git-ignored).

If you find anything that weakens these guarantees, please report it — even if it seems minor.
