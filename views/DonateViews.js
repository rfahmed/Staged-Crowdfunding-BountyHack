import React from 'react';

const exports = {};

// Player views must be extended.
// It does not have its own Wrapper view.

exports.GetHand = class extends React.Component {
  render() {
    const {parent, playable, hand} = this.props;
    return (
      <div>
        {hand ? 'It was a draw! Pick again.' : ''}
        <br />
        {!playable ? 'Please wait...' : ''}
        <br />
        <button
          disabled={!playable}
          onClick={() => parent.playHand('ROCK')}
        >Rock</button>
        <button
          disabled={!playable}
          onClick={() => parent.playHand('PAPER')}
        >Paper</button>
        <button
          disabled={!playable}
          onClick={() => parent.playHand('SCISSORS')}
        >Scissors</button>
      </div>
    );
  }
}

exports.WaitingForResults = class extends React.Component {
  render() {
    return (
      <div>
        Waiting for results...
      </div>
    );
  }
}

exports.Done = class extends React.Component {
  render() {
    const {outcome} = this.props;
    return (
      <div>
        Thank you for playing. The outcome of this game was:
        <br />{outcome || 'Unknown'}
      </div>
    );
  }
}

exports.Timeout = class extends React.Component {
  render() {
    return (
      <div>
        There's been a timeout. (Someone took too long.)
      </div>
    );
  }
}
exports.WaitingVote = class extends React.Component {
  render() {
    return (
      <div>
        Others have attached to the contract. Waiting for votes to come in ...
      </div>
    );
  }
}

exports.VoteIntermission = class extends React.Component {
  render() {
    return (
      <div>
        Thanks for your votes! Please wait as funds are transported appropriately...
      </div>
    );
  }
}

exports.Ending = class extends React.Component {
  render() {
    return (
      <div>
        End of the contract. Thanks for crowdfunding with CHAAAIN REAAACTION Co.
      </div>
    );
  }
}
export default exports;
