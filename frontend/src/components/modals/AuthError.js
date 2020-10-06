import React, {useEffect} from "react";
import {modalBlurHandler} from "../../static/js/util";

const capitalize = (s) => {
  return s[0].toUpperCase() + s.slice(1).toLowerCase();
};

const AuthError = ({ signup, msgs, position, setErrMsgs}) => {
  useEffect(modalBlurHandler(setErrMsgs), [])

  position.position = 'fixed';
  return (
    <div className="label-modal" style = {position}>
      <div className="label-modal__header label-modal__header--noborder">
        { signup?  <p>Error Signing up</p> : <p> Error Logging in </p>
        }
        <i className="fal fa-times" onClick={() => setErrMsgs({msgs: msgs, err: false})}></i>
      </div>
      <ul className="label-modal__error">
        { Object.keys(msgs).map((k,v) => (
          <li>
            <span style={{ color: "red" }}>{capitalize(k.toString())}:</span>{" "}
            {capitalize(msgs[k].toString())}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuthError;
