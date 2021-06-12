# Staged-Crowdfunding-BountyHack

A project for Bounty Hack 2021 [https://bostonblockchainweek.com/event/bounty-hack/] for staged approval crowdfunding methods.

## Instructions

To run, first type `$ make build` to compile changes. Then `$ make run-alice` in one terminal and `$ make run-bob` in another terminal in the same directory.

## Debugging Information

Should you encounter any errors, it may be prudent to ensure that you have the latest version of reach. To make sure, run `$ ./reach update` and `$ ./reach compile`. Then start the servers again.

If your docker container gets stuck in contract deployment, use `$ ./reach docker-reset` then restart the web-app and the devnet manually.