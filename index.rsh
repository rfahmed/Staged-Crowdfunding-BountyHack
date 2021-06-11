'reach 0.1';

// const thresh_arr = Array(UInt, 5);

const commonInterface = {
    informTimeout: Fun([], Null), //Notify that a timeout has occured
    seeGoal: Fun([UInt], Null), //Show the goal amount
    seeThreshold: Fun([Array(UInt, 5)], Null), //Show the thresholds
    seeDonation: Fun([UInt, UInt], Null), //Show the amount someone just donated
}

const deadline = 10;

export const main =
    Reach.App(
        {},
        [Participant('Alice', {
            ...commonInterface,
            setGoal: Fun([], UInt), //Sets the goal
            setThreshold: Fun([], Array(UInt, 5)), //Creates 5 thresholds
        }),
        ParticipantClass('Bob', {
            ...commonInterface,
            acceptGoal: Fun([UInt], Bool),
            acceptThresholds: Fun([Array(UInt, 5)], Bool),
            donate: Fun([], UInt),
        })],
        (A, B) => {

            //Utility to inform timeouts
            const informTimeout = () => {
                each([A, B], () => {
                    interact.informTimeout();
                });
            };

            //Alice sets the goal and thresholds
            A.only(() => {
                const goal = declassify(interact.setGoal());
                const threshold = declassify(interact.setThreshold());
            });

            //Alice publishes goal and thresholds
            A.publish(goal, threshold);
            commit();

            //Inform all parties that the goal and thresholds were published
            each([A, B], () => {
                interact.seeGoal(goal);
                interact.seeThreshold(threshold);
            })

            // commit();

            //Bobs accept the goal and thresholds
            B.only(() => {
                const goalAccepted = declassify(interact.acceptGoal(goal));
                const threshAccepted = declassify(interact.acceptThresholds(threshold));
                // const firstRaise = declassify(interact.donate());
            })
            B.publish(goalAccepted, threshAccepted);
            // commit();

            //Bobs raise enough money to cover the goal
            // const [ timeRemaining, keepGoing ] = makeDeadline(deadline);
            // const [ currentPot, auctionRunning, winnerAddress ] = 
            //     parallelReduce([0, true, this])
            //       .invariant(balance() == currentPot)
            //       .while(keepGoing() && auctionRunning)
            //       .case(B,
            //         (() => {
            //             const bbid = declassify(interact.donate());
            //             const mbid = bbid + currentPot;

            //             const address = this;
            //             return ({
            //                 // when: declassify(interact.mayBid(mbid, bbid)),
            //                 msg: [mbid, address]
            //             });
            //         }),
            //         ((bid) => bid[0]),
            //         ((mbid) => {
            //             const bidValue = mbid[0];
            //             const updatedPotValue = bidValue;

            //             transfer(currentPot).to(winnerAddress);
            //             return [ updatedPotValue, true, mbid[1]];
            //         })
            //        )
            //        .timeout(timeRemaining(), () => {
            //            race(A, B).publish();
            //            return [ currentPot, false, winnerAddress]
            //         });



            //some while loop
            var total = 0;
            invariant(balance() == total);
            while(total < goal){
                commit();

                B.only(() => {
                    const raisedAmount = declassify(interact.donate());
                });

                B.publish(raisedAmount).pay(raisedAmount);

                A.only(() => {
                    interact.seeDonation(raisedAmount, total + raisedAmount);
                });

                // commit();

                total = total + raisedAmount;
                continue;
            }

            //Verify the stages were completed with a simple voting system
            //some while loop
                //Alice claims a goal complete
                //Bobs vote
                //If > 50% of the bobs vote yes, the money for that stage is released
                //Otherwise the money for that stage is returned
                //In timeout: Money is returned

            transfer(balance()).to(A);

            commit();
            
            exit();
        }
    );