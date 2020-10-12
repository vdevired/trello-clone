import React, {useState} from "react";
import { colors, images } from "../../static/js/const";

const BoardBackground = (/*{ setShowBoardModal }*/) => {
  const [selected, setSelected] = useState({});
  return (
    <div className="label-modal--bg label-modal">
      <div className="label-modal__header">
        <p>Board Background</p>
        <button /*onClick={setShowBoardModal(false)}*/>
          <i className="fal fa-times"></i>
        </button>
      </div>
      <div>
        <p className="label-modal__labels-head">Photos</p>
        <ul className="label-modal__create-block">
          {images.map((s) => {
            return (
              <li
                className="label-modal__create-label label-modal__create-label--img"
              >
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
              <li className="label-modal__create-label">
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
    </div>
  );
};

export default BoardBackground;