# Staged-Crowdfunding-BountyHack
A project for Bounty Hack 2021 [https://bostonblockchainweek.com/event/bounty-hack/] for staged approval crowdfunding methods. 

## Instructions

The current iteration of the dapp is interactive in a manner similar to tutorial 8, where Alice sets a crowdfunding goal and Bob gets to contribute.

To run, first type `$ make build` to compile changes. Then `$ make run-alice` in one terminal and `$ make run-bob` in another terminal in the same directory.

## Debugging Information

If your docker container gets stuck in contract deployment, use `$ ./reach docker-reset` then restart the web-app and the devnet manually.

In case you get a contract length error, `$ ./reach update` and `$ ./reach compile`. Then start the servers again.