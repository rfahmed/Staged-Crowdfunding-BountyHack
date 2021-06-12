import { loadStdlib } from '@reach-sh/stdlib'; 
import * as backend from './build/index.main.mjs';
import { ask, yesno, done } from '@reach-sh/stdlib/ask.mjs';

(async () => {
    const stdlib = await loadStdlib();

    const isAlice = await ask(`Are you Alice? (The creator)`, yesno);
    const who = isAlice ? 'Alice' : 'Bob';

    console.log(`Started crowdfunding dapp as ${who}`);

    let acc = null;
    const createAcc = await ask(`Would you like to create an account? (Only possible on devnet)`, yesno);
    if (createAcc) {
        acc = await stdlib.newTestAccount(stdlib.parseCurrency(1000));
    } else {
        const wantSecret = await ask('Would you like to enter an account secret?', yesno);
        if (wantSecret){
            const secret = await ask(`What is your account secret?`, (x => x));
            acc = await stdlib.newAccountFromSecret(secret);
        }
        else {
            console.log('Exiting Program, try again if you wish to login');
            process.exit(0)
        }
    }

    let ctc = null;
    const deployCtc = await ask(
        `Do you want to deploy the contract? (y/n)`,
        yesno
    );
    if (deployCtc) {
        // acc.setGasLimit(5000000);
        ctc = acc.deploy(backend);
        const info = await ctc.getInfo();
        console.log(`The contract is deployed as = ${JSON.stringify(info)}`);
    } else {
        const info = await ask(
            `Please paste the contract information:`,
            JSON.parse
        );
        ctc = acc.attach(backend, info);
    }

    const fmt = (x) => stdlib.formatCurrency(x, 4);
    const getBalance = async () => fmt(await stdlib.balanceOf(acc));

    const before = await getBalance();
    console.log(`Your balance is ${before}`);

    const interact = { ...stdlib.hasRandom };

    interact.informTimeout = async () => {
        console.log(`There was a timeout.`);
        const after = await getBalance();
        console.log(`Your balance is ${after}`);
        process.exit(0);
    };

    interact.seeGoal = (goal) => {
        console.log(`Alice set the fundraising goal to ${fmt(goal)}.`);
    };

    interact.seeThreshold = (thresh) => {
        console.log(`The thresholds are: ` + thresh);
    }

    interact.seeDonated = (amt, tot) => {
        console.log(`Someone just donated ${fmt(amt)}.`);
        console.log(`The total donation amount is ${fmt(tot)}`);
    }

    interact.seeReleased = (amt) => {
        console.log(`${fmt(amt)} was just released`);
    }

    interact.seeDebug = (first, second) => {
        console.log(`First value is ${fmt(first)}`);
        console.log(`Second value is ${fmt(second)}`);
        // console.log(`Third value is ${third}`);
    }

    interact.getThreshold = (thresh, index) => {
        return stdlib.parseCurrency(stdlib.bigNumberify(thresh[index]));
    }

    if (isAlice) {
        const amt = await ask(
            `How much do you want to crowdfund?`,
            stdlib.parseCurrency
        );
        interact.goal = amt;
        const thresholds = await ask(
            'What would you like the fundraising thresholds to be (enter comma separated list (limit is 3 but if you have less enter 0s at the))?'
        );
        const newArr = JSON.parse("[" + thresholds + "]");
        const finalArr = Array.from(newArr);
        // console.log(typeof(finalArr))
        interact.threshold = finalArr;

        // interact.getNextThreshold = (thresh, amt, goal) => {
        //     // console.log(`goal is type ${typeof(goal)} and thresh[i] is type ${typeof(thresh[0])}`);
        //     for(var i = 0; i < 5; i++){
        //         // console.log(`thresh[i] is ${thresh[i]} amt is ${fmt(amt)}`);
        //         // console.log(`thresh[i] > amt ? ${stdlib.gt(thresh[i], fmt(amt))}`);
        //         if(stdlib.gt(thresh[i], fmt(amt))){
        //             // console.log(`returned thresh[i] is ${stdlib.bigNumberify(thresh[i])}`);
        //             return stdlib.parseCurrency(stdlib.bigNumberify(thresh[i]));
        //         }
        //     }
        //     // console.log(`returned goal is ${goal}`);
        //     return goal;
        // }
    } else {
        interact.acceptGoal = async (amt) => {
            const accepted = await ask(
                `Do you accept the goal of ${fmt(amt)}?`,
                yesno
            );
            if (accepted) {
                console.log(`You have accepted the goal of ${fmt(amt)}`);
                return;
            } else {
                console.log(`Denied. Exiting program.`);
                process.exit(0);
            }
        };
        interact.getContribution = async () => {
            const wantDonate = await ask('Would you like to donate funds?', yesno);
            if (wantDonate) {
                const amt = await ask(
                    `How much do you want to contribute?`,
                    stdlib.parseCurrency
                );
                interact.contribution = amt;
                return amt;
            }
            else {
                console.log("Thank you for donating! Please await voting.");
                return 0;
                // process.exit(0);
            }
        };

        interact.getVote = async () => {
            const isDeserving = await ask(`Has Alice done a good job to release the next batch of funds?`, yesno);
            if(isDeserving){
                return {yes: 1, no: 0};
            }else{
                return {yes: 0, no: 1};
            }
        }
        
    }

    const part = isAlice ? backend.Alice : backend.Bob;
    await part(ctc, interact);

    const after = await getBalance();
    console.log(`Your balance is ${after}`);

    done();

// Non-interactive stuff below, kept for reference
    // const startingBalance = stdlib.parseCurrency(10);

    // const accAlice = await stdlib.newTestAccount(startingBalance);
    // const accBob = await stdlib.newTestAccount(startingBalance);

    // const ctcAlice = accAlice.deploy(backend);
    // const ctcBob = accBob.attach(backend, ctcAlice.getInfo());

    // const fmt = (x) => stdlib.formatCurrency(x, 4);
    // const getBalance = async (who) => fmt(await stdlib.balanceOf(who));

    //   const commonInterface = (Who) => ({
    //       informTimeout: () => {
    //           console.log(`${Who} observed a timeout.`);
    //       }
    //   });

    // const beforeAlice = await getBalance(accAlice);
    // const beforeBob = await getBalance(accBob);

    // await Promise.all([
    //     backend.Alice(
    //         ctcAlice, {
    //         ...commonInterface('Alice'),
    //         setGoal: () => {
    //             const amount = stdlib.parseCurrency(Math.floor(Math.random() * 10) + 5);
    //             console.log(`Alice sets the goal to ${fmt(amount)}.`);
    //             return amount;
    //         },
    //         acceptFunds: (amount) => {
    //             console.log(`Alice has accepted ${fmt(amount)}.`);
    //         }
    //     }),
    //     backend.Bob(
    //         ctcBob, {
    //         ...commonInterface('Bob'),
    //         donate: () => {
    //             const amount = stdlib.parseCurrency(Math.floor(Math.random() * 3) + 1);
    //             console.log(`Bob donates ${fmt(amount)} to the campaign.`);
    //             return amount;
    //         }
    //     }),
    // ]);

    // const afterAlice = await getBalance(accAlice);
    // const afterBob = await getBalance(accBob);

    // console.log(`Alice went from ${beforeAlice} to ${afterAlice}`);
    // console.log(`Bob went from ${beforeBob} to ${afterBob}`);

})();