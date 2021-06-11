'reach 0.1';

const thresh_arr = Array(UInt, 5);

const commonInterface = { 
    informTimeout: Fun([], Null),
    seeGoal: Fun([UInt], Null),
    seeDonated: Fun([UInt, UInt], Null),
    seeThreshold: Fun([thresh_arr], Null),
    seeReleased: Fun([UInt], Null),
    // seeDebug: Fun([UInt, UInt, Bool], Null),
}

const DEADLINE = 2;

export const main =
    Reach.App(
        {},
        [Participant('Alice', {
            ...commonInterface,
            goal: UInt,
            threshold: thresh_arr,
            setGoal: Fun([], UInt), //sets the goal for the fundraising campaign and returns it
        }),
        Participant('Bob', {
            ...commonInterface,
            contribution: UInt,
            getContribution: Fun([], UInt),
            acceptGoal: Fun([UInt], Null), //donates some amount of money to the goal and returns that it
        })],
        (A, B) => {

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
            })

            //Keep donating until the goal is reached
            var [total, released] = [donationAmount, 0];
            invariant(true);  //Shuts up the compiler, but we should actually find a good invariant to check
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
                    interact.seeDonated(donate, total + donate);
                });

                //Compute if money gets released or not

                //Half of the donated funds are released when campaign reaches 50% (25% of overall funds)
                //Remaining funds released when the goal is met
                // console.log(threshold)
                const currGoal = 0;
                const fullTotal = total + donate;
                const i = 0;
                invariant(true);
                while (i < 5) {
                    if (threshold[i] > fullTotal) {
                        currGoal = threshold[i];
                        break;
                    }
                    i++;
                    continue;
                }

                const isStaged = ((total + donate) >= (currGoal)) ? true : false;
                // each([A, B], () => {
                //     interact.seeDebug(total + donate, threshold, isStaged);
                // });

                if (isStaged && released == 0) {
                    const rel = balance();
                    transfer(rel).to(A);

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

            //Release the remaining funds
            transfer(balance()).to(A);

            commit();

            exit();
        }
    );