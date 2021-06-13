# Staged-Crowdfunding-BountyHack

A project for Bounty Hack 2021 [https://bostonblockchainweek.com/event/bounty-hack/] for staged approval crowdfunding methods.

## Demo: 
Please check out our video or the slideshow on this repo.

## Current State

The current iteration of the dapp is an interactive crowdfunding application between Alice (the creator of the crowdfunding campaign) and Bob (a member of the public) with up to 3 thresholds.

## Issues and Improvements

* The application currently does not work with muliple Bobs.
* Timeouts do not work

## Instructions

To run, please ensure you are in the "frontend" branch and run the command REACH_CONNECTOR_MODE=ALGO ./reach react (for Algorand).

## Debugging Information

Should you encounter any errors, it may be prudent to ensure that you have the latest version of reach. To make sure, run `$ ./reach update` and `$ ./reach compile`. Then start the servers again.

(For the web interface when one is created) If your docker container gets stuck in contract deployment, use `$ ./reach docker-reset` then restart the web-app and the devnet manually.
