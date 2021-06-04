# Staged-Crowdfunding-BountyHack
A project for Bounty Hack 2021 [https://bostonblockchainweek.com/event/bounty-hack/] for staged approval crowdfunding methods.

## Current State

The current iteration of the dapp is an interactive crowdfunding application between Alice (the creator of the crowdfunding campaign) and Bob (a member of the public) with one threshold at 50%. Upon reaching the threshold, 50% of the money raised up to that point will be released to Alice.

## Issues and Improvements

* The application currently does not work with muliple Bobs.
* No web based graphical user interface exists. Everything runs in the command line.

## Instructions

To run, first type `$ make build` to compile changes. Then `$ make run-alice` in one terminal and `$ make run-bob` in another terminal in the same directory.

## Debugging Information

Should you encounter any errors, it may be prudent to ensure that you have the latest version of reach. To make sure, run `$ ./reach update` and `$ ./reach compile`. Then start the servers again.

(For the web interface when one is created) If your docker container gets stuck in contract deployment, use `$ ./reach docker-reset` then restart the web-app and the devnet manually.