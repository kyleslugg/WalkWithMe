import React, { Component } from 'react';
import MapWrapper from './components/MapWrapper';

//import './stylesheets/styles.css';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <MapWrapper />
      </div>
    );
  }
}

export default App;

//render(<App />, document.querySelector('#map-canvas'));
