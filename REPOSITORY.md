# Repository provenance and checks

This repository is the exact scoped MIT context-engine source archive generated
for Q1Z3, plus repository documentation, tests, CI and provenance metadata.
The upstream README, package metadata, source and license are unchanged.

- Publisher: https://github.com/Quinze-Softwares-Inc
- Source directory: https://q1z3.com/open-source
- Algorithm explanation and downloads: https://q1z3.com/context-engine
- `UPSTREAM_MANIFEST.json` preserves the upstream release metadata.
- `PUBLICATION_MANIFEST.json` lists archive files and repository additions with
  hashes. It does not recursively hash itself.

Run the portable checks with Node.js 18 or newer:

    node --test tests/*.test.mjs

The tests verify declared categorization, exact-question matching and the
newest-decision boundary. A selected lesson is only a broker candidate;
these checks do not certify sharing permissions or semantic understanding.
