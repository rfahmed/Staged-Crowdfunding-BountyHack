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
    const ctcBob = accBob.attach(backend, ctcAlice.getInfo());

    const fmt = (x) => stdlib.formatCurrency(x, 4);
    const getBalance = async (who) => fmt(await stdlib.balanceOf(who));

    //Implements the common interface
    const commonInterface = (Who) => ({
        informTimeout: () => {
            console.log(`${Who} observed a timeout.`);
        }
    });

    await Promise.all([
        backend.Alice(
            ctcAlice, {
            ...commonInterface('Alice'),
            setGoal: () => {
                const amount = stdlib.parseCurrency(Math.floor(Math.random() * 10) + 5);
                console.log(`Alice sets the goal to ${fmt(amount)}.`);
                return amount;
            },
            acceptFunds: (amount) => {
                console.log(`Alice has accepted ${fmt(amount)}.`);
            }
        }),
        backend.Bob(
            ctcBob, {
            ...commonInterface('Bob'),
            donate: () => {
                const amount = stdlib.parseCurrency(Math.floor(Math.random() * 3) + 1);
                console.log(`Bob donates ${fmt(amount)} to the campaign.`);
                return amount;
            }
        }),
    ]);

    done();

})();