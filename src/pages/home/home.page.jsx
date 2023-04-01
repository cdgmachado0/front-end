import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorage";
import {
  getAUMValue,
  getTotalVolumeInETH,
  getTotalVolumeInUSD,
} from "../../services/web3Service";
import { useStateValue } from "../../stateManagement/stateProvider.state";
import { 
  GOERLI_CHAIN_ID, 
  MAINNET_CHAIND_ID,
  ARBITRUM_CHAIN_ID
} from "../../utils/constants";

import "./home.styles.scss";

function Home() {
  const [] = useLocalStorage("login");

  const [{ address }] = useStateValue();

    useEffect(() => {
      setTimeout(() => {
        try {
          window.ethereum.on("chainChanged", (chain) => {
            if (chain != MAINNET_CHAIND_ID && chain != GOERLI_CHAIN_ID && chain != ARBITRUM_CHAIN_ID) {
              return
            } else {
              // dispatch chain change
              callWeb3Service();
            }
          });
        } catch {}
      }, 500);
    }, []);

  const [aumVol, setaumVol] = useState(0);
  const [usdVol, setusdVol] = useState(0);
  const [ethVol, setethVol] = useState(0);

  async function callWeb3Service() {
    let usdVol = await getTotalVolumeInUSD();
    let ethVol = await getTotalVolumeInETH();
    let aum = await getAUMValue();

    try {
      if (aum.includes(".")) {
        aum = aum.split(".")[0] + "."+ aum.split(".")[1].slice(0, 2);
      }
      if (ethVol.includes(".")) {
        ethVol = ethVol.split(".")[0] + "."+ ethVol.split(".")[1].slice(0, 2);
      }
      if (usdVol.includes(".")) {
        usdVol = usdVol.split(".")[0] + "."+ usdVol.split(".")[1].slice(0, 2);
      }
    } catch {}

    setaumVol(aum);
    setusdVol(ethVol); 
    setethVol(usdVol);
  }

  function formatNum(num) {
    return parseFloat(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  function checkMetamask(num) {
    if (window.ethereum) {
      if (num === 1) {
        return aumVol ? formatNum(aumVol) : "Loading...";
      } else if (num === 2) {
        return usdVol && ethVol ? `${usdVol} - ${formatNum(ethVol)}` : "Loading...";
      }
    } else {
      return 'Download Metamask';
    }
  }

  useEffect(() => {
    callWeb3Service();
  }, []);

  return (
    <div className="home">
      <Link to="/app" className="launch_btn">
        Launch App
      </Link>
      <div className="home_logo"></div>
      <div className="home_vol">
        <div className="vol">
          <h1>AUM (USD)</h1>
          <h2>{checkMetamask(1)}</h2>
        </div>
        <div className="vol">
          <h1>TOTAL VOLUME (ETH - USD)</h1>
          <h2>{checkMetamask(2)}</h2>
        </div>
      </div>
    </div>
  );
}

export default Home;
