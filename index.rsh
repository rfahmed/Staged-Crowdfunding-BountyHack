'reach 0.1';

const commonInterface = {
    informTimeout: Fun([], Null),
}

const DEADLINE = 10;

export const main =
    Reach.App(
        {},
        [Participant('Alice', {
            ...commonInterface,
            goal: UInt,
            setGoal: Fun([], UInt), //sets the goal for the fundraising campaign and returns it
        }),
        Participant('Bob', {
            ...commonInterface,
            contribution: UInt,
            donate: Fun([], UInt), //donates some amount of money to the goal and returns that it
        })],
        (A, B) => {

            const informTimeout = () => {
                each([A, B], () => {
                    interact.informTimeout();
                });
            };

            //Alice picks a fundraising goal
            A.only(() => {
                //const goal = declassify(interact.setGoal());
                const goal = declassify(interact.goal);
            });
            A.publish(goal);
            commit();

            //Bob will contribute money to the goal
            B.only(() => {
                //const donationAmount = declassify(interact.donate());
                const donationAmount = declassify(interact.contribution);
            });
            B.publish(donationAmount).pay(donationAmount);


            // //Keep donating until the goal is reached
            // var [total, released] = [donationAmount, 0];
            // invariant(total == donationAmount);
            // while (total <= goal) {
            //     commit();

            //     B.only(() => {
            //         const donate = declassify(interact.donate());
            //     });
            //     B.publish(donate).pay(donate);
            //     total = total + donate;
            //     //Compute if money gets released or not

            //     //Half of the donated funds are released when campaign reaches 50% (25% of overall funds)
            //     //Remaining funds released when the goal is met

            //     continue;
            // }

            // const isStageMet = 0;
            // const isGoalMet = 1;

            // if(isGoalMet){
            //     transfer(goal).to(A);
            // }else if(isStageMet){
            //     transfer(0.25 * goal).to(A);
            // }else{
            //     //do nothing
            // }

            // commit();

            // //Tell everyone and exit
            // each([A, B], () => {
            //     //interact.notifyAll();
            // });

            transfer(donationAmount).to(A);

            commit();

            exit();
        }
    );