import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ControlModule from "../../components/controlModule/controlModule.component";
import MetamaskWalletBtn from "../../components/metamaskWalletBtn/connectMetamask.component";
// import useLocalStorage from "../../hooks/useLocalStorage";
import { balanceOf, getOzelBalances } from "../../services/web3Service";
import { useStateValue } from "../../stateManagement/stateProvider.state";

import { v4 as uuidv4 } from "uuid";

import "./main.styles.scss";
import PopUp from "../../components/popUp/popUp.component";
import {
  GOERLI_CHAIN_ID,
  MAINNET_CHAIND_ID,
  ARBITRUM_CHAIN_ID
} from "../../utils/constants";

function Main() {
  const [{ address, chain }, dispatch] = useStateValue();
  const [ozelBalance, setozelBalance] = useState(0);
  const [ozelBalanceUsd, setozelBalanceUsd] = useState(0);
  const [ozelBalanceWeth, setozelBalanceWeth] = useState(0);
  const [opt, setOpt] = useState("...")
  const [showPopUp, setshowPopUp] = useState(false);
  const [installMetamaskPopUpMessage] = useState(
    "Please install the Metamask extension"
  );
  const [showInstallMetamaskPopUp, setshowInstallMetamaskPopUp] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    callWeb3Service();
  }, [address, chain]);

  useEffect(() => {
    setTimeout(() => {
      try {
        if (
          window.ethereum.chainId != MAINNET_CHAIND_ID &&
          window.ethereum.chainId != GOERLI_CHAIN_ID &&
          window.ethereum.chainId != ARBITRUM_CHAIN_ID
        ) {
          setshowPopUp(true);
        }

        window.ethereum.on("chainChanged", (chain) => {
          if (chain != MAINNET_CHAIND_ID && chain != GOERLI_CHAIN_ID && chain != ARBITRUM_CHAIN_ID) {
            setshowPopUp(true);
          } else {

            // dispatch chain change
            dispatch({
              type: "CHAIN",
              payload: chain,
            });

            setshowPopUp(false);
          }
        });
      } catch { }
    }, 500)
  }, []);

  async function callWeb3Service() {
    if (!address) {
      setozelBalance(0)
      setozelBalanceUsd(0)
      setozelBalanceWeth(0)
      return
    };

    let ozelBalance = await balanceOf(address);
    if (ozelBalance.includes(".")) {
      ozelBalance = ozelBalance.split(".")[0] + "." + ozelBalance.split(".")[1].slice(0, 3);
    }
    setozelBalance(ozelBalance);

    let [ozelBalanceWeth, ozelBalanceUsd] = await getOzelBalances(address);
    if (ozelBalanceWeth.includes(".")) {
      ozelBalanceWeth = ozelBalanceWeth.split(".")[0] + "." + ozelBalanceWeth.split(".")[1].slice(0, 3);
    }
    setozelBalanceWeth(ozelBalanceWeth);

    if (ozelBalanceUsd.includes(".")) {
      ozelBalanceUsd = ozelBalanceUsd.split(".")[0] + "." + ozelBalanceUsd.split(".")[1].slice(0, 2);
    }
    setozelBalanceUsd(ozelBalanceUsd);
  }

  function handleHamChange(e) {
    const event = e.target.value;
    setOpt(event)

    if (event == "Home") {
      navigate("/");
    }
    
    if (event == "Docs") {
      window.open("https://docs.ozelprotocol.xyz/", "_blank", "noopener,noreferrer");
      setOpt("...")
    }
  }

  function enablePopUp() {
    setshowInstallMetamaskPopUp(true);
  }

  function disablePopUp() {
    setshowInstallMetamaskPopUp(false);
  }

  return (
    <div className="mainPage">
      {showPopUp && (
        <PopUp
          message="Connect through Ethereum Mainnet, Goerli or Arbitrum One"
          showClosePopUp={false}
        />
      )}
      {/* install metamask popUp */}
      {showInstallMetamaskPopUp && (
        <PopUp
          message={installMetamaskPopUpMessage}
          closePopUp={disablePopUp}
        />
      )}
      <div className="metamask_ham">
        <MetamaskWalletBtn enablePopUp={enablePopUp} disablePopUp={disablePopUp} />
        <select name="tokens" id="tokens" className="defaultInput" value={opt} onChange={handleHamChange} >
          <option key={uuidv4()} value={"..."}>&#8226;&#8226;&#8226; </option>
          <option key={uuidv4()} value={"Docs"}>Docs </option>
          <option key={uuidv4()} value={"Home"}>Home </option>
        </select>
      </div>
      <div className="info">
        <div className="field">
          <input
            disabled
            className="defaultInput"
            type="text"
            value={ozelBalance ? ozelBalance : ""}
          />
          <label className="defaultBtn">OZL&nbsp;Balance</label>
        </div>
        <div className="field">
          <input
            disabled
            className="defaultInput"
            type="text"
            value={ozelBalanceUsd ? ozelBalanceUsd : ""}
          />
          <label className="defaultBtn">in USD</label>
        </div>
        <div className="field">
          <input
            disabled
            className="defaultInput"
            type="text"
            value={ozelBalanceWeth ? ozelBalanceWeth : ""}
          />
          <label className="defaultBtn">in ETH</label>
        </div>
      </div>
      <ControlModule />
    </div>
  );
}

export default Main;
