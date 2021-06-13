import React from 'react';
import DonateViews from './DonateViews';

const exports = {...DonateViews};

const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

exports.Wrapper = class extends React.Component {
  render() {
    const {content} = this.props;
    return (
      // this "className" is how class Deployer chooses this wrapper instead of the other
      <div className="Deployer">
        <h2>Deployer (Alice)</h2>
        {content}
      </div>
    );
  }
}

exports.SetGoal = class extends React.Component {
  render() {
    const {parent, defaultGoal, standardUnit} = this.props;
    const goal = (this.state || {}).goal || defaultGoal;
    const def1= (this.state || {}).def1 || 0.0001;
    const def2= (this.state || {}).def2 || 0.0001;
    const def3= (this.state || {}).def3 || 0.0001;
    return (
      <div>
        <p>Goal:</p>
        <input type='number' placeholder={defaultGoal} onChange={(e) => this.setState({goal: e.currentTarget.value})}/> 
        {standardUnit}
        <br></br>
        <p>Checkpoints:</p>
        <input type='number' placeholder={def1} onChange={(e) => this.setState({def1: e.currentTarget.value})}/>
        {standardUnit}
        <input type='number' placeholder={def2} onChange={(e) => this.setState({def2: e.currentTarget.value})}/>
        {standardUnit}
        <input type='number' placeholder={def3} onChange={(e) => this.setState({def3: e.currentTarget.value})}/>
        {standardUnit}
        <br />
        <br></br>
        <button
          onClick={() => parent.setGoal(goal, def1, def2, def3)}
        >Set goal</button>
      </div>
    );
  }
}


exports.Deploy = class extends React.Component {
  render() {
    const {parent, goal, standardUnit, def1, def2, def3} = this.props;
    return (
      <div>
        Goal (pay to deploy): <strong>{goal}</strong> {standardUnit}
        Checkpoint 1: <strong>{def1}</strong>
        Checkpoint 2: <strong>{def2}</strong>
        Checkpoint 3: <strong>{def3}</strong>
        <br />
        <button
          onClick={() => parent.deploy()}
        >Deploy</button>
      </div>
    );
  }
}

exports.Deploying = class extends React.Component {
  render() {
    return (
      <div>Deploying... please wait.</div>
    );
  }
}

exports.WaitingForAttacher = class extends React.Component {
  async copyToClipborad(button) {
    const {ctcInfoStr} = this.props;
    navigator.clipboard.writeText(ctcInfoStr);
    const origInnerHTML = button.innerHTML;
    button.innerHTML = 'Copied!';
    button.disabled = true;
    await sleep(1000);
    button.innerHTML = origInnerHTML;
    button.disabled = false;
  }

  render() {
    const {ctcInfoStr} = this.props;
    return (
      <div>
        Waiting for Attacher to join...
        <br /> Please give them this contract info:
        <pre className='ContractInfo'>
          {ctcInfoStr}
        </pre>
        <button
          onClick={(e) => this.copyToClipborad(e.currentTarget)}
        >Copy to clipboard</button>
      </div>
    )
  }
}

export default exports;
