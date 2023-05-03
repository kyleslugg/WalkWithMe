import React, { Component } from 'react';
import Map from './components/Map';

//import './stylesheets/styles.css';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Map />
      </div>
    );
  }
}

export default App;

//render(<App />, document.querySelector('#map-canvas'));
