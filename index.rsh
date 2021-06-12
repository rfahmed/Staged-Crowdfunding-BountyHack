'reach 0.1';

const thresh_arr = Array(UInt, 3);

const commonInterface = {
    informTimeout: Fun([], Null),
    seeGoal: Fun([UInt], Null),
    seeDonated: Fun([UInt, UInt], Null),
    seeThreshold: Fun([thresh_arr], Null),
    seeReleased: Fun([UInt], Null),
    seeDebug: Fun([UInt, UInt], Null),
    getThreshold: Fun([Array(UInt, 3), UInt], UInt),
}

const DEADLINE = 10;

function voting(A, B, amt) {
    const [keepGoing, yays, nays] =
        parallelReduce([true, 0, 0])
            .invariant(true)
            .while(keepGoing && nays < 2)
            .case(B, (() => ({
                // when: declassify(interact.keepGoing())
            })),
                () => {
                    commit();
                    B.only(() => {
                        const { yes, no } = declassify(interact.getVote());
                    })
                    B.publish(yes, no);

                    return [true, yays + yes, nays + no];
                })
            .timeout(DEADLINE, () => {
                Anybody.publish();
                return [false, yays, nays];
            });
    const outcome = yays >= nays ? 1 : 0;
    const willTransfer = outcome == 1 ? A : B;

    const bal = balance();

    if (bal < amt) {
        transfer(balance()).to(willTransfer);
        each([A, B], () => {
            interact.seeReleased(bal);
        })
    } else {
        transfer(amt).to(willTransfer);
        each([A, B], () => {
            interact.seeReleased(amt);
        })
    }
}

export const main =
    Reach.App(
        {},
        [Participant('Alice', {
            ...commonInterface,
            goal: UInt,
            threshold: thresh_arr,
            // getNextThreshold: Fun([thresh_arr, UInt, UInt], UInt),
            setGoal: Fun([], UInt), //sets the goal for the fundraising campaign and returns it
        }),
        Participant('Bob', {
            ...commonInterface,
            contribution: UInt,
            getContribution: Fun([], UInt),
            acceptGoal: Fun([UInt], Null), //donates some amount of money to the goal and returns that it
            // keepGoing: Fun([], Bool),
            getVote: Fun([], Object({ yes: UInt, no: UInt }))
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
                const goal = declassify(interact.goal);
                const threshold = declassify(interact.threshold);
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
                // const firstRaise = declassify(interact.donate());
            })
            B.publish(goalAccepted);
            // commit();

            const [keepRaising, total] =
                parallelReduce([true, 0])
                    .invariant(balance() == total)
                    .while(keepRaising && total < goal)
                    .case(B, (() => ({
                        // when: declassify(interact.keepGoing())
                    })),
                        () => {
                            commit();
                            B.only(() => {
                                const raisedAmount = declassify(interact.getContribution());
                            });

                            B.publish(raisedAmount).pay(raisedAmount);

                            each([A, B], () => {
                                interact.seeDonated(raisedAmount, total + raisedAmount);
                            });
                            return [true, total + raisedAmount];
                        })
                    .timeout(DEADLINE, () => {
                        Anybody.publish();
                        return [false, total];
                    });

            const bal = balance();

            commit();
            
            A.only(() => {
                const amt = declassify(interact.getThreshold(threshold, 0));
            })

            A.publish(amt);

            if (bal < amt) {
                transfer(balance()).to(A);
                each([A, B], () => {
                    interact.seeReleased(bal);
                })
            } else {
                transfer(amt).to(A);
                each([A, B], () => {
                    interact.seeReleased(amt);
                })
            }

            commit();
            
            A.only(() => {
                const t1 = declassify(interact.getThreshold(threshold, 1));
            })

            A.publish(t1);

            voting(A, B, t1);


            commit();
            
            A.only(() => {
                const t2 = declassify(interact.getThreshold(threshold, 2));
            })

            A.publish(t2);


            voting(A, B, t2);

            //Release the remaining funds
            transfer(balance()).to(B);

            commit();

            exit();
        }
    );