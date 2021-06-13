'reach 0.1';

const thresh_arr = Array(UInt, 3);

const commonInterface = {
    informTimeout: Fun([], Null),
    getThreshold: Fun([Array(UInt, 3), UInt], UInt),
    seeDone: Fun([], Null),
}

const DEADLINE = 10;

function voting(A, B, amt) {
    // const [keepGoing, yays, nays] =
    //     parallelReduce([true, 0, 0])
    //         .invariant(true)
    //         .while(keepGoing)
    //         .case(B, (() => ({
    //             // when: declassify(interact.keepGoing())
    //         })),
    //             () => {
    //                 commit();
    //                 B.only(() => {
    //                     const { yes, no } = declassify(interact.getVote());
    //                 })
    //                 B.publish(yes, no);

    //                 return [true, yays + yes, nays + no];
    //             })
    //         .timeout(DEADLINE, () => {
    //             Anybody.publish();
    //             return [false, yays, nays];
    //         });

    commit(); 
    B.only(() => {
        const yes = declassify(interact.yay);
        const no = declassify(interact.nay);
    })

    B.publish(yes, no);

    const outcome = yes > no ? 1 : 0;
    const willTransfer = outcome == 1 ? A : B;

    const bal = balance();

    if (bal < amt) {
        transfer(balance()).to(willTransfer);
    } else {
        transfer(amt).to(willTransfer);
    }
}

export const main =
    Reach.App(
        {},
        [Participant('Alice', {
            ...commonInterface,
            goal: UInt,
            def1: UInt,
            def2: UInt,
            def3: UInt,
            threshold: thresh_arr,
            // getNextThreshold: Fun([thresh_arr, UInt, UInt], UInt),
            setGoal: Fun([], UInt), //sets the goal for the fundraising campaign and returns it
            showBobAttached: Fun([], Null),
        }),
        Participant('Bob', {
            ...commonInterface,
            acceptGoal: Fun([UInt], Null), //donates some amount of money to the goal and returns that it
            // keepGoing: Fun([], Bool),
            // getVote: Fun([], Object({ yes: UInt, no: UInt }))
            yay: UInt,
            nay: UInt,
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

            // commit();

            //Bobs accept the goal and thresholds
            B.only(() => {
                const goalAccepted = declassify(interact.acceptGoal(goal));
                // const firstRaise = declassify(interact.donate());
            })
            B.publish(goalAccepted).pay(goal);
            // commit();

            A.only(() => {
                interact.showBobAttached();
            })

            // const [keepRaising, total] =
            //     parallelReduce([true, 0])
            //         .invariant(balance() == total)
            //         .while(keepRaising && total < goal)
            //         .case(B, (() => ({
            //             // when: declassify(interact.keepGoing())
            //         })),
            //             () => {
            //                 commit();
            //                 B.only(() => {
            //                     const raisedAmount = declassify(interact.getContribution());
            //                 });

            //                 B.publish(raisedAmount).pay(raisedAmount);

            //                 return [true, total + raisedAmount];
            //             })
            //         .timeout(DEADLINE, () => {
            //             Anybody.publish();
            //             return [false, total];
            //         });

            const bal = balance();

            commit();
            
            A.only(() => {
                const amt = declassify(interact.def1);
            })

            A.publish(amt);

            if (bal < amt) {
                transfer(balance()).to(A);
            } else {
                transfer(amt).to(A);
            }

            commit();
            
            A.only(() => {
                const t1 = declassify(interact.def2);
            })

            A.publish(t1);

            voting(A, B, t1);


            commit();
            
            A.only(() => {
                const t2 = declassify(interact.def3);
            })

            A.publish(t2);


            voting(A, B, t2);

            //Release the remaining funds
            transfer(balance()).to(B);

            commit();

            each([A, B], () => {
                interact.seeDone();
            })

            exit();
        }
    );
