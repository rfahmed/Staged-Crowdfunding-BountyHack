'reach 0.1';

const commonInterface = {
  fundingGoal: Fun([], UInt), //current funding goal for this campaign
  fundsPledged: Fun([], UInt), //returns value of current funds pledged
  fundsRaised: Fun([], UInt) // returns value of current funds raised
};

const crowdMember = { // campaign participant
  pledgedFunds: Fun([], UInt), // returns value of pledged funds
  extractedFunds: Fun([UInt], UInt) // takes in milestone number returns value of extracted funds
  };

const Founder = { // person running campaign
  numMilestones: Fun([], UInt), //returns number of milestones in this project
  milestonesReached: Fun([], UInt) //returns number of most recent milestone
};

export const main =
  Reach.App(
    {},
    [ Participant('crowdMember', {}),
      Participant('Receiver', {}),
      Participant('Bystander', {}) ],
    (Funder, Receiver, Bystander) => {