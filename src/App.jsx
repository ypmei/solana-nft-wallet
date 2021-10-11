import { BrowserRouter, Route } from 'react-router-dom';
import './App.css';
import Wallet from './components/WalletContainer/Wallet';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Route exact path="/" component={Wallet} />
        <Route exact path="/:walletAddress" component={Wallet} />
      </div>
    </BrowserRouter>
  );
}

export default App;
