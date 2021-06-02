# Staged-Crowdfunding-BountyHack
A project for Bounty Hack 2021 [https://bostonblockchainweek.com/event/bounty-hack/] for staged approval crowdfunding methods. 

## Instructions

To run, type `$ ./reach run` into the command line.

## Debugging Information

If your docker container gets stuck in contract deployment, use `$ ./reach docker-reset` then restart the web-app and the devnet manually.

In case you get a contract length error, `$ ./reach update` and `$ ./reach compile`. Then start the servers again.