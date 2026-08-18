# GitHub Backup Notes

The `flowsiteshq/Flowsite-main` repository contains a current source snapshot of the FlowSites application.

## Credential handling

The one-off billing scripts use `STRIPE_SECRET_KEY` from the environment. No Stripe or GitHub access keys are committed to the repository.

## Intentional exclusions

- `.project-config.json` is a local platform configuration file and is not part of the portable application source.
- `Flowsite-main-source-backup.zip` is a generated archive and is not included because the repository itself is the source backup.

