import React from 'react';
import AppViews from './views/AppViews';
import DeployerViews from './views/DeployerViews';
import AttacherViews from './views/AttacherViews';
import {renderDOM, renderView} from './views/render';
import './index.css';
import * as backend from './build/index.main.mjs';
import * as reach from '@reach-sh/stdlib/ETH';

// old variables from tut
const handToInt = {'ROCK': 0, 'PAPER': 1, 'SCISSORS': 2};
const intToOutcome = ['Bob wins!', 'Draw!', 'Alice wins!'];
const {standardUnit} = reach;
const defaults = {defaultFundAmt: '10', defaultGoal: '0.0003', standardUnit};

// new variables im adding
const decision = ['Alice was voted unsuccessful.', 'Alice was voted successful.'];


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {view: 'ConnectAccount', ...defaults};
  }
  async componentDidMount() {
    const acc = await reach.getDefaultAccount();
    const balAtomic = await reach.balanceOf(acc);
    const bal = reach.formatCurrency(balAtomic, 4);
    // updating current account + balance
    this.setState({acc, bal});
    // if a native faucet detected -> ask if fund account, else go to alice/bob
    try {
      const faucet = await reach.getFaucet();
      this.setState({view: 'FundAccount', faucet});
    } catch (e) {
      this.setState({view: 'DeployerOrAttacher'});
    }
  }
  async fundAccount(fundAmount) {
    await reach.transfer(this.state.faucet, this.state.acc, reach.parseCurrency(fundAmount));
    this.setState({view: 'DeployerOrAttacher'});
  }
  // goes to DeployerOrAttacher in AppViews
  async skipFundAccount() { this.setState({view: 'DeployerOrAttacher'}); }
  // depending on what is chosen, goes to class deployer or attacher in index.js
  selectAttacher() { this.setState({view: 'Wrapper', ContentView: Attacher}); }
  selectDeployer() { this.setState({view: 'Wrapper', ContentView: Deployer}); }
  render() { return renderView(this, AppViews); }
}

class CommonInterface extends React.Component {

  random() { return reach.hasRandom.random(); }
  informTimeout() {this.setState({view: 'Timeout'}); }
  setGoal(goal, def1, def2, def3) { this.setState({view: 'Deploy', goal, def1, def2, def3}); }
}

class Deployer extends CommonInterface {
  constructor(props) {
    super(props);
    this.state = {view: 'SetGoal'};
  }
  async deploy() {
    // important backend line 
    const ctc = this.props.acc.deploy(backend);
    this.setState({view: 'Deploying', ctc});
    this.goal = reach.parseCurrency(this.state.goal); // UInt
    this.def1 = reach.parseCurrency(this.state.def1);
    this.def2 = reach.parseCurrency(this.state.def2);
    this.def3 = reach.parseCurrency(this.state.def3);
    const temp_arr = JSON.parse("[" + this.def1 + "," + this.def2 + "," + this.def3 + "]");
    this.threshold = Array.from(temp_arr);
    backend.Alice(ctc, this);
    const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
    this.setState({view: 'WaitingForAttacher', ctcInfoStr});
  }

  render() { return renderView(this, DeployerViews); }
}

class Attacher extends CommonInterface {
  constructor(props) {
    super(props);
    this.state = {view: 'Attach'};
  }
  attach(ctcInfoStr) {
    const ctc = this.props.acc.attach(backend, JSON.parse(ctcInfoStr));
    this.setState({view: 'Attaching'});
    backend.Bob(ctc, this);
  }
  async acceptGoal(goalAtomic) { // Fun([UInt], Null)
    const goal = reach.formatCurrency(goalAtomic, 4);
    return await new Promise(resolveAcceptedP => {
      this.setState({view: 'AcceptTerms', goal, resolveAcceptedP});
    });
  }
  termsAccepted() {
    this.state.resolveAcceptedP();
    this.setState({view: 'Verification'});
  }
  async getVote(voteVal) {
    this.nay = 0;
    this.yay = voteVal;
    const y = voteVal;
    this.setState({view: 'Ending', y});
  }
  render() { return renderView(this, AttacherViews); }
}

renderDOM(<App />);
