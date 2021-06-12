import React from 'react';
import PlayerViews from './PlayerViews';

const exports = {...PlayerViews};

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
    const def1= 10, def2 = 25, def3 = 50, def4 = 70, def5 = 90;
    return (
      <div>
        <input type='number' placeholder={defaultGoal} onChange={(e) => this.setState({goal: e.currentTarget.value})}/> 
        {standardUnit}
        <input type='number' placeholder={def1} onChange={(e) => this.setState({def1: e.currentTarget.value})}/>
        {standardUnit}
        <input type='number' placeholder={def2} onChange={(e) => this.setState({def2: e.currentTarget.value})}/>
        {standardUnit}
        <input type='number' placeholder={def3} onChange={(e) => this.setState({def3: e.currentTarget.value})}/>
        {standardUnit}
        <input type='number' placeholder={def4} onChange={(e) => this.setState({def4: e.currentTarget.value})}/>
        {standardUnit}
        <input type='number' placeholder={def5} onChange={(e) => this.setState({def5: e.currentTarget.value})}/>
        {standardUnit}
        <br />
        <button
          onClick={() => parent.setGoal(goal, def1, def2, def3, def4, def5)}
        >Set goal</button>
      </div>
    );
  }
}


exports.Deploy = class extends React.Component {
  render() {
    const {parent, goal, standardUnit, def1, def2, def3, def4, def5} = this.props;
    return (
      <div>
        Goal (pay to deploy): <strong>{goal}</strong> {standardUnit}
        Checkpoints: <strong>{def1, def2, def3, def4, def5}</strong>
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
