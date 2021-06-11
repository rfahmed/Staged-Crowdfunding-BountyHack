import { loadStdlib } from '@reach-sh/stdlib'; 
import * as backend from './build/index.main.mjs';
import { ask, yesno, done } from '@reach-sh/stdlib/ask.mjs';

const numOfBobs = 10;

(async () => {
    const stdlib = await loadStdlib();
    const startingBalance = stdlib.parseCurrency(100);

    const accAlice = await stdlib.newTestAccount(startingBalance);
    const accBobArray = await Promise.all(
        Array.from({ length: numOfBobs }, () =>
        stdlib.newTestAccount(startingBalance)
        )
    );

    const ctcAlice = accAlice.deploy(backend);
    // const ctcBob = accBob.attach(backend, ctcAlice.getInfo());

    const fmt = (x) => stdlib.formatCurrency(x, 4);
    const getBalance = async (who) => fmt(await stdlib.balanceOf(who));

    //Implements the common interface
    const commonInterface = (Who) => ({
        informTimeout: () => {
            console.log(`${Who} observed a timeout.`);
        },
        
        seeGoal: (amt) => {
            console.log(`The goal has been set to ${fmt(amt)}`);
        },

        seeThreshold: (thresh) => {
            console.log(`The thresholds are: ` + thresh);
        },

        seeDonation: (amt, tot) => {
            console.log(`Someone just donated ${fmt(amt)}`);
            console.log(`Total donated is now ${fmt(tot)}`);
        }
    });

    await Promise.all([
        backend.Alice(
            ctcAlice, {
            ...commonInterface('Alice'),
            setGoal: () => {
                // const amount = stdlib.parseCurrency(Math.floor(Math.random() * 10) + 5);
                // Hard code for testing
                const amount = stdlib.parseCurrency(100);
                return amount;
            },

            setThreshold: () => {
                //Hard code for testing
                const thresh = [10,20,30,40,50];
                return thresh;
            }
        }),
    ].concat(
        accBobArray.map((accBob, i) => {
            const ctcBob = accBob.attach(backend, ctcAlice.getInfo());
            return backend.Bob(
                ctcBob, {
                ...commonInterface('Bob'),
    
                acceptGoal: (goal) => {
                    console.log(`Bob number ${i} has accepted the goal of ${fmt(goal)}`);
                    return true;
                },
    
                acceptThresholds: (thresh) => {
                    console.log(`Bob number ${i} has accepted the thresholds of ` + thresh);
                    return true;
                },

                donate: () => {
                    const amt = stdlib.parseCurrency(Math.floor(Math.random() * 60) + 1);
                    console.log(`Bob number ${i} donates ${fmt(amt)}`);
                    return amt;
                }
            });
        })
    ));

    const afterAlice = await getBalance(accAlice);
    console.log(`Alice now has ${fmt(afterAlice)}`);

    done();

})();