import React, { useEffect, useState } from "react";
import Web3 from "web3";

import "./connectMetamask.style.scss";

import { toast } from "react-toastify";
import { useStateValue } from "../../stateManagement/stateProvider.state";
import PopUp from "../popUp/popUp.component";

import EthereumLogo from "../../assets/Ethereum.png"
import ArbitrumLogo from "../../assets/Arbitrum-One.png"



export default function MetamaskWalletBtn({ enablePopUp }) {
  const [{ address }, dispatch] = useStateValue();
  const [isLoading, setisLoading] = useState(false);
  const [showPopUp, setshowPopUp] = useState(false);
  const [message, setmessage] = useState("");
  const [chainConnected, setChainConnected] = useState(0);

  const accountChangeHandler = async (account) => {
    dispatch({
      type: "METAMASK_ADDRESS",
      payload: account,
    });

    setisLoading(false);
  };

  async function connectMetamaskHandler() {
    if (isLoading) return;
    setisLoading(true);

    if (window.ethereum) {
      // res[0] for fetching a first wallet
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((res) => accountChangeHandler(res[0]));

      window.ethereum.on("accountsChanged", (accounts) => {
        accountChangeHandler(accounts[0]);
      });

      window.ethereum.on('chainChanged', async (CHAIN) => {
        setChainConnected(CHAIN === 1 ? 1 : CHAIN === 5 ? 5 : CHAIN === 42161 ? 42161 : CHAIN === "0x1" ? 1 : CHAIN === "0x5" ? 5 : CHAIN === "0xa4b1" ? 42161 : 0);
      });

      const myWeb3 = await new Web3(window.ethereum)
      const CHAIN = await myWeb3.eth.getChainId()
      setChainConnected(CHAIN === 1 ? 1 : CHAIN === 5 ? 5 : CHAIN === 42161 ? 42161 : CHAIN === "0x1" ? 1 : CHAIN === "0x5" ? 5 : CHAIN === "0xa4b1" ? 42161 : 0);


    } else {
      enablePopUp(true);
      setisLoading(false);
    }
  }

  function disconnectMetamaskHandler() {
    dispatch({
      type: "DISCONNECT",
      payload: "",
    });

    toast.success("Sign out successfully.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }
  
  useEffect(() => {
    if(address !== "") connectMetamaskHandler()

  }, [])



  return (
    <>
      <div className={`metamask__btnContainer`} style={{ display: "flex" }}>
        {address ? <>
          {
            (chainConnected === 1 || chainConnected === 5 || chainConnected === 42161) ?
              <div className="metamask__Btn">
                <img src={(chainConnected === 1 || chainConnected === 5) ? EthereumLogo : ArbitrumLogo} width="20px" alt="wallet logo" />
              </div>
              :
              <div className="metamask__Btn">Invalid Network</div>
          }
          <div
            className="metamask__connectBtn metamask__Btn"
            onClick={disconnectMetamaskHandler}
          >
            Disconnect: {address.slice(0, 5)}...{address.slice(-5)}
          </div>
        </> : (
          <div
            className="metamask__connectBtn metamask__Btn"
            onClick={connectMetamaskHandler}
          >
            {isLoading ? "Loggin in..." : "Connect Metamask"}
          </div>
        )}
      </div>
    </>
  );
}
