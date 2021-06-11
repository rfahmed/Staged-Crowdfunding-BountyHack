'reach 0.1';

const thresh_arr = Array(UInt, 5);

const commonInterface = {
    informTimeout: Fun([], Null),
}

const DEADLINE = 10;

export const main =
    Reach.App(
        {},
        [Participant('Alice', {
            ...commonInterface,
        }),
        Participant('Bob', {
            ...commonInterface,
        })],
        (A, B) => {

            //Alice sets the goal and thresholds

            //Alice publishes goal and thresholds

            //Bobs accept the goal and thresholds

            //Bobs raise enough money to cover the goal
            //some while loop

            //Verify the stages were completed with a simple voting system
            //some while loop
                //Alice claims a goal complete
                //Bobs vote
                //If > 50% of the bobs vote yes, the money for that stage is released
                //Otherwise the money for that stage is returned
                //In timeout: Money is returned
            
            exit();
        }
    );