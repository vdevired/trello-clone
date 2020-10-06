import React from "react";

const capitalize = (s) => {
  return s[0].toUpperCase() + s.slice(1).toLowerCase();
};

const AuthError = ({ signup, msgs, position, setErrMsgs}) => {
  position.position = 'fixed';
  return (
    <div class="label-modal" style = {position}>
      <div class="label-modal__header label-modal__header--noborder">
        { signup?  <p>Error Signing up</p> : <p> Error Logging in </p>
        }
        <i class="fal fa-times" onClick={() => setErrMsgs({msgs: msgs, err: false})}></i>
      </div>
      <ul class="label-modal__error">
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
