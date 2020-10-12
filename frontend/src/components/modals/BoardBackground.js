import React, {useState} from "react";
import { colors, images } from "../../static/js/const";

const BoardBackground = ({ position, setShowBoardModal, setBackground}) => {
  const [selected, setSelected] = useState({});
  return (
    <div style={position} className="label-modal--bg label-modal">
      <div className="label-modal__header">
        <p>Board Background</p>
        <button onClick={() => setShowBoardModal(false)}>
          <i className="fal fa-times"></i>
        </button>
      </div>
      <div>
        <p className="label-modal__labels-head">Photos</p>
        <ul className="label-modal__create-block">
          {images.map((s) => {
            return (
              <li
                className={`label-modal__create-label ${selected === s ? "label-modal__create-label--selected": ""}`}              >
              <button style={s}
                onClick={() => setSelected(s)}
              >
                {selected === s ? (
                    <i className="fal fa-check"></i>
                ) : null}
              </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <p className="label-modal__labels-head">Colors</p>
        <ul className="label-modal__create-block">
          {colors.map((s) => {
            return (
              <li className={`label-modal__create-label ${selected === s ? "label-modal__create-label--selected": ""}`}>
              <button style={s}
                onClick={()=> setSelected(s)}
              >
                {selected === s ? (
                    <i className="fal fa-check"></i>
                ) : null}
              </button>
              </li>
            );
          })}
          <li className="label-modal__create-label" style={{display: 'none'}}>
            <button></button>
          </li>
        </ul>
      </div>
      <button
          onClick={() => {
              setShowBoardModal(false);
              if (selected.backgroundColor === undefined && selected.backgroundImage === undefined)
                return;
              else  setBackground(selected);
          }}
          className="btn label-modal__create-button"
      >
          Select Background
      </button>
    </div>
  );
};

export default BoardBackground;