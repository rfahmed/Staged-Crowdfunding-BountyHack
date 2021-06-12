'reach 0.1';

const thresh_arr = Array(UInt, 5);

const commonInterface = {
    informTimeout: Fun([], Null),
    seeGoal: Fun([UInt], Null),
    seeDonated: Fun([UInt, UInt], Null),
    seeThreshold: Fun([thresh_arr], Null),
    seeReleased: Fun([UInt], Null),
    seeDebug: Fun([UInt, UInt], Null),
}

const Alice = 
    {...commonInterface,
     goal: UInt,
    threshold: thresh_arr,
    getNextThreshold: Fun([thresh_arr, UInt, UInt], UInt),
    getPrevThreshold: Fun([thresh_arr, UInt, UInt], UInt),
    getFirstThreshold: Fun([thresh_arr], UInt),
    setGoal: Fun([], UInt), //sets the goal for the fundraising campaign and returns it
    }

const Bob = 
{
    ...commonInterface,
    contribution: UInt,
    getContribution: Fun([], UInt),
    acceptGoal: Fun([UInt], Null), //donates some amount of money to the goal and returns that it
}

const DEADLINE = 10;

export const main =
    Reach.App(
        {},
        [Participant('Alice', Alice),
        Participant('Bob', Bob)],
        (A, B) => {

            function donateRoutine(t, r, goal){
                var [total, released] = [t, r];
                invariant(balance() == total - released);  //Shuts up the compiler, but we should actually find a good invariant to check
                while (total <= goal && goal > balance()) {
                    commit();

                    //Bob will contribute more money
                    B.only(() => {
                        const donate = declassify(interact.getContribution());
                    });

                    //Publish the donation and pay into contract
                    B.publish(donate).pay(donate);
                    //Notify everyone that someone just donated
                    each([A, B], () => {
                        interact.seeDonated(donate, (total + donate));
                    });

                    commit();

                    A.only(() => {
                        const currGoal = declassify(interact.getNextThreshold(interact.threshold, (total + donate), goal));
                    });
                    A.publish(currGoal);

                    //Compute if money gets released or not

                    //Half of the donated funds are released when campaign reaches 50% (25% of overall funds)
                    //Remaining funds released when the goal is met
                    // console.log(threshold)


                    const isStaged = ((total + donate) >= (currGoal)) ? true : false;
                    each([A, B], () => {
                        interact.seeDebug(currGoal, released);
                    });

                    if (isStaged) {
                        const rel = currGoal - released; //balance();
                        const bal = balance();

                        each([A, B], () => {
                            interact.seeDebug(currGoal, released);
                        });

                        if (rel > bal) {
                            transfer(balance()).to(A);
                            commit();
                            exit();
                        } else {
                            transfer(rel).to(A);
                        }

                        //Notify everyone about the partial release of funds
                        each([A, B], () => {
                            interact.seeReleased(rel);
                        });

                        [total, released] = [total + donate, released + rel];
                        continue;
                    } else {
                        [total, released] = [total + donate, released];
                        continue;
                    }
                    // continue;
                }
            }

            //Timeouts do not work yet
            const informTimeout = () => {
                each([A, B], () => {
                    interact.informTimeout();
                });
            };

            //Alice picks a fundraising goal
            A.only(() => {
                const goal = declassify(interact.goal);
                // array pre_thresh =  declassify(interact.threshold);
                // let pre_thresh_post = []
                // for (const property in pre_thresh) {
                //     pre_thresh_post.append(property)
                // }
                const threshold = declassify(interact.threshold);
            });
            A.publish(goal);
            commit();

            A.publish(threshold);
            commit();

            //Inform all parties about the goal that was just posted
            each([A, B], () => {
                interact.seeGoal(goal);
                interact.seeThreshold(threshold);
            });

            //Bob will contribute money to the goal
            B.only(() => {
                interact.acceptGoal(goal);
                const donationAmount = declassify(interact.getContribution());
            });
            B.publish(donationAmount).pay(donationAmount);
            //B.publish(donationAmount).pay(donationAmount).timeout(DEADLINE, () => closeTo(A, informTimeout));

            each([A, B], () => {
                interact.seeDonated(donationAmount, donationAmount);
            });

            commit();

            // A.only(() => {
            //     const prevFirstGoal = declassify(interact.getPrevThreshold(threshold, donationAmount, goal));
            // })

            // A.publish(prevFirstGoal);

            A.only(() => {
                const firstGoal = declassify(interact.getNextThreshold(threshold, donationAmount, goal));
            })

            A.publish(firstGoal);

            //Money release check
            const isReached = ((donationAmount) >= (firstGoal)) ? true : false;

            each([A, B], () => {
                interact.seeDebug(firstGoal, donationAmount);
            });

            if (isReached) {
                const relFirst = firstGoal; //balance();
                const balFirst = balance();

                each([A, B], () => {
                    interact.seeDebug(firstGoal, 0);
                });

                if (relFirst > balFirst) {
                    transfer(balance()).to(A);
                    commit();
                    exit();
                } else {
                    transfer(relFirst).to(A);
                }

                //Notify everyone about the partial release of funds
                each([A, B], () => {
                    interact.seeReleased(relFirst);
                });
                donateRoutine(donationAmount, relFirst, goal);
            } else {
                //same thing, except our first donation did not meet a threshold
                donateRoutine(donationAmount, 0, goal);
            }

            //Keep donating until the goal is reached
            //var [total, released] = [donationAmount, firstGoal];


            //Release the remaining funds
            transfer(balance()).to(A);

            commit();

            exit();
        }
    );
