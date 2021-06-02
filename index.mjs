import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

(async () => {
    const stdlib = await loadStdlib();
    const startingBalance = stdlib.parseCurrency(10);

    const accAlice = await stdlib.newTestAccount(startingBalance);
    const accBob = await stdlib.newTestAccount(startingBalance);

    const ctcAlice = accAlice.deploy(backend);
    const ctcBob = accBob.attach(backend, ctcAlice.getInfo());

    const fmt = (x) => stdlib.formatCurrency(x, 4);
    const getBalance = async (who) => fmt(await stdlib.balanceOf(who));

    //   const commonInterface = (Who) => ({
    //     goalAmount: stdlib.parseCurrency(5),
    //     progressAmount: stdlib.parseCurrency(0),
    //     releasedAmount: stdlib.parseCurrency(0),
    //   })

    const beforeAlice = await getBalance(accAlice);
    const beforeBob = await getBalance(accBob);

    await Promise.all([
        backend.Alice(
            ctcAlice, {
            //...commonInterface('Alice'),
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
            //...commonInterface('Bob'),
            donate: () => {
                const amount = stdlib.parseCurrency(Math.floor(Math.random() * 3) + 1);
                console.log(`Bob donates ${fmt(amount)} to the campaign.`);
                return amount;
            }
        }),
    ]);

    const afterAlice = await getBalance(accAlice);
    const afterBob = await getBalance(accBob);

    console.log(`Alice went from ${beforeAlice} to ${afterAlice}`);
    console.log(`Bob went from ${beforeBob} to ${afterBob}`);

})();