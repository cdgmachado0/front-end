import React, { useEffect, useState } from "react";
import {
  changeAccountSlippage,
  changeAccountToken,
  changeAccountTokenNSlippage,
  getAccountsByUser,
  getTokenDatabase
} from "../../services/web3Service";
import { useStateValue } from "../../stateManagement/stateProvider.state";

import { v4 as uuidv4 } from "uuid";
import PopUp from "../popUp/popUp.component";
import { setToken } from "../../utils/constants";
import Clipboard from "../clipboard/clipboard.component";
import Web3 from 'web3';
import Spinner from "../../assets/spinner.gif";


function ChangeTab() {
  const [{ address, chain }] = useStateValue();

  const [tokenAddresses, settokenAddresses] = useState([]);
  const [userAddresses, setuserAddresses] = useState([]);
  const [userAddressNames, setuserAddressNames] = useState([]);

  const [newTokenCheck, setnewTokenCheck] = useState(false);
  const [newSlippageCheck, setnewSlippageCheck] = useState(false);

  const [slippage, setslippage] = useState("");
  const [selectedToken, setselectedToken] = useState("");
  const [selectedAddress, setselectedAddress] = useState("");
  const [selectedAddressName, setselectedAddressName] = useState("");

  const [invalidSlippage, setinvalidSlippage] = useState(false);

  const [newToken, setnewToken] = useState("");
  const [newSlippage, setnewSlippage] = useState("");

  const [message, setmessage] = useState("");
  const [message2, setmessage2] = useState("");

  const [showPopUp, setshowPopUp] = useState(false);

  const [sendingTx, setsendingTx] = useState(false);
  const [loader, setLoader] = useState(false);


  const web3 = new Web3();

  useEffect(() => {
    if (!address) return;
    resetModule();
  }, [address, chain]);

  async function callWeb3Service() {
    const tokens = await getTokenDatabase(address);
    settokenAddresses([...tokens]);

    let { 0: userAddresses, 1: userAddressNames } = await getAccountsByUser(
      address
    );

    setuserAddresses([...userAddresses]);
    if (userAddresses.length) setselectedAddress(userAddresses[0]);

    // to prevent same name;
    userAddressNames = userAddressNames.map((item, i) => item + `_${i}`);

    setuserAddressNames([...userAddressNames]);
    if (userAddressNames.length) setselectedAddressName(userAddressNames[0]);
  }

  function handleTokenChange(e) {
    localStorage.setItem("selectedToken", e.target.value);
    localStorage.setItem("tokenName", setToken(e.target.value));
    setselectedToken(e.target.value);
  }

  function handleUserAddressChange(e) {
    const addressIndex = userAddressNames.indexOf(e.target.value);

    setselectedAddress(userAddresses[addressIndex]);
    setselectedAddressName(userAddressNames[addressIndex]);
  }

  function disablePopUp() {

    resetModule();

    setshowPopUp(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (sendingTx || invalidSlippage) return;

    setsendingTx(true);
    setLoader(true);

    // to delete any messages from previous tx
    setmessage2("");

    let newtoken = "";
    let newslippage = "";
    localStorage.setItem("status", 0);
    if (selectedAddress.length == 42) {
      localStorage.setItem("selectedAddress", selectedAddress);
    } else {
      localStorage.removeItem("selectedAddress");
    }
    if (parseFloat(slippage) > 0) {
      localStorage.setItem("slippage", slippage);
    } else {
      localStorage.removeItem("slippage");
    }

    try {
      if (newTokenCheck && newSlippageCheck) {
        const tx = await changeAccountTokenNSlippage(
          selectedAddress,
          selectedToken,
          slippage,
          address
        );

        newtoken = tx.events[0].raw.topics[1];
        newtoken = web3.utils.toChecksumAddress("0x" + newtoken.slice(2).replace(/^0+/, ''));
        newslippage = web3.utils.hexToNumber(tx.events[1].raw.topics[1]) / 100;

        setnewToken(newtoken);
        setnewSlippage(newslippage);

        setmessage(
          setToken(newtoken)
            ? "New token successfully changed to " + setToken(newtoken)
            : "New token successfully changed to " + newtoken
        );

        setmessage2(
          "New slippage successfully changed to " + newslippage + "%"
        );
      } else if (newTokenCheck) {

        // console.log("tokenAddresses", tokenAddresses);
        const tx = await changeAccountToken(
          selectedAddress,
          selectedToken,
          address
        );

        newtoken = tx.events[0].raw.topics[1];
        newtoken = web3.utils.toChecksumAddress("0x" + newtoken.slice(2).replace(/^0+/, ''));


        setnewToken(newtoken);
        setmessage(
          setToken(newtoken)
            ? "New token successfully changed to " + setToken(newtoken)
            : "New token successfully changed to " + newtoken
        );

      } else if (newSlippageCheck) {
        const tx = await changeAccountSlippage(selectedAddress, slippage, address);

        newslippage = web3.utils.hexToNumber(tx.events[0].raw.topics[1]) / 100;

        setnewSlippage(newslippage);

        setmessage("New slippage successfully changed to " + newslippage + "%");

      } else {
        // do nothing
      }

      setTimeout(() => {
        setshowPopUp(true);
        setLoader(false)
        localStorage.setItem("status", 1);

      }, 6000);

    } catch (err) {
      console.log(err.message);
      setLoader(false)
    }

    setsendingTx(false);
  }

  async function handleTokenCheck() {
    setnewTokenCheck(!newTokenCheck);
  }

  async function handleSpippageCheck() {
    setnewSlippageCheck(!newSlippageCheck);
  }

  function validateSlippageInput(e) {
    setslippage(e.target.value);

    const input = parseFloat(e.target.value);

    if (!e.target.value && e.target.value != 0) {
      localStorage.removeItem("slippage");
      return
    };

    if (input < 0.01 || input > 5) {
      localStorage.removeItem("slippage");
      setinvalidSlippage(true);
    } else {
      localStorage.setItem("slippage", e.target.value);
      setinvalidSlippage(false);
    }

    // check number of digits after decimals
    if (e.target.value.split(".")[1]?.length > 2) {
      localStorage.removeItem("slippage");
      setinvalidSlippage(true);
    }
  }

  function resetModule() {
    setslippage("");
    setselectedToken("");
    setselectedAddress("");
    setselectedAddressName("");

    setnewTokenCheck(false);
    setnewSlippageCheck(false);

    callWeb3Service();
  }

  return (
    <>
      {
        loader &&
        <div style={{ position: "fixed", zIndex: 1000, backgroundColor: "rgba(0,0,0,0.6)", width: "100%", height: "100%", top: "0", left: "0", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={Spinner} alt="Spinner" width={"100"} />
        </div>
      }

      {showPopUp && (
        <PopUp
          message={message}
          message2={message2}
          closePopUp={disablePopUp}
        />
      )}
      <div className="form">
        <div className="field">
          <label>Select Account:</label>
          {userAddresses.length ? (
            <select
              name="tokens"
              id="tokens"
              className="defaultInput-Black limitWidth"
              value={selectedAddressName}
              onChange={handleUserAddressChange}
            >
              {userAddressNames.map((token) => (
                <option key={uuidv4()} readOnly value={token}>
                  {token.split("_")[0]}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="defaultInput-Black"
              readOnly
              type="select"
              value="No account created"
            />
          )}
        </div>
        {selectedAddress && (
          <div className="field">
            <label>Raw Account:</label>
            <Clipboard textToCopy={selectedAddress} />
          </div>
        )}
        <div className={`field ${!userAddresses.length && "disable"}`}>
          <input
            className="defaultInput-Black"
            type="checkbox"
            checked={newTokenCheck}
            onChange={handleTokenCheck}
          />
          <label className={`${!newTokenCheck && "disable"}`}>New Token</label>
          {tokenAddresses.length ? (
            <select
              name="tokens"
              id="tokens"
              className={`defaultInput-Black limitWidth  ${!newTokenCheck && "disable"
                }`}
              value={selectedToken}
              onChange={handleTokenChange}
            >
              <option value="" disabled>
                - - Choose - -
              </option>
              {tokenAddresses.map((token) => (
                <option key={uuidv4()} readOnly value={token} name={setToken(token) ? setToken(token) : token}>
                  {setToken(token) ? setToken(token) : token}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={`defaultInput-Black ${!newTokenCheck && "disable"}`}
              readOnly
              type="select"
              value="Fetching tokens..."
            />
          )}
        </div>
        <div className={`field ${!userAddresses.length && "disable"}`}>
          <input
            className="defaultInput-Black"
            type="checkbox"
            checked={newSlippageCheck}
            onChange={handleSpippageCheck}
          />
          <label className={`${!newSlippageCheck && "disable"}`}>
            New Slippage (%)
          </label>
          <input
            className={`defaultInput-Black ${!newSlippageCheck && "disable"} ${invalidSlippage && "invalid-input"
              }`}
            onChange={validateSlippageInput}
            type="number"
            placeholder="0.01-5%"
            value={slippage}
          />
        </div>
        <input
          className={`defaultInput-Black submitBtn 
          ${!newSlippageCheck && !newTokenCheck && "disable"} 
          ${invalidSlippage && "disable"} 
          ${newSlippageCheck && !slippage && "disable"}
          ${newTokenCheck && !selectedToken && "disable"}`}
          readOnly
          type="submit"
          onClick={handleSubmit}
          value={sendingTx ? "Sending Transaction" : "Change Details"}
        />
      </div>
    </>
  );
}

export default ChangeTab;
