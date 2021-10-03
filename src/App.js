import logo from './logo.svg';
import './App.css';
import Wallet from "./components/WalletContainer/Wallet";
import {BrowserRouter, Route} from "react-router-dom";


function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Route exact path='/' component={Wallet}/>
                <Route exact path='/:walletAddress' component={Wallet}/>
            </div>
        </BrowserRouter>
    );
}

export default App;
