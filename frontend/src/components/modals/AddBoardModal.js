import React, { useState, useRef } from "react";
import BoardBackground from "./BoardBackground";
import { getEditControlsSidePosition } from '../boards/Card';

const options = [
  [
    "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1391&q=80",
    true,
  ],
  [
    "https://images.unsplash.com/photo-1524129426126-1b85d8c74fd2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=614&q=80",
    true,
  ],
  [
    "https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1790&q=80",
    true,
  ],
  [
    "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1051&q=80",
    true,
  ],
  ["#4680FF", false],
  ["red", false],
  ["#FFB64D", false],
  ["purple", false],
];

function deepEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      (areObjects && !deepEqual(val1, val2)) ||
      (!areObjects && val1 !== val2)
    ) {
      return false;
    }
  }

  return true;
}

function isObject(object) {
  return object != null && typeof object === "object";
}

const AddBoardModal = () => {
  const [background, setBackground] = useState(
    bgImage(
      "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1391&q=80"
    )
  );
  const [title, setTitle] = useState("");
  const [showBoardModal, setShowBoardModal] = useState(false);
  const cardElem = useRef(null);
  return (
    <>
      {showBoardModal ? (
        <BoardBackground
          setShowBoardModal={setShowBoardModal}
          setBackground={setBackground}
          position={getEditControlsSidePosition(cardElem.current)}
        />
      ) : null}
      <div className="addboard-modal">
        <div className="addboard-modal__left">
          <div className="addboard-modal__title-block" style={background}>
            <input
              onChange={(t) => {
                setTitle(t.target.value);
              }}
              className="addboard-modal__title"
              placeholder="Add board title"
            />
            <a className="addboard-modal__exit">
              <i className="fal fa-times"></i>
            </a>
          </div>
          <button
            className={`addboard-modal__create btn--secondary btn${
              title.trim() !== "" ? "" : " btn--disabled"
            }`}
          >
            Create Board{" "}
          </button>
        </div>

        <div className="addboard-modal__right" ref={cardElem}>
          {options.map((option, index) => (
            <button
              onClick={() => {
                setBackground(bgImage(...option));
              }}
              className={`addboard-modal__color-box${
                option[1] ? " color-box--img" : ""
              }`}
              style={bgImage(...option)}
            >
              {" "}
              {deepEqual(background, bgImage(...option)) ? (
                <i className="fal fa-check"></i>
              ) : null}{" "}
            </button>
          ))}
          <button className="addboard-modal__color-box"
           onClick={() => setShowBoardModal(true)} 
          >
            <i className="fal fa-ellipsis-h"></i>
          </button>
        </div>
      </div>
    </>
  );
};

const bgImage = (bg, img = true) => {
  if (img) return { backgroundImage: `url(${bg})`, backgroundSize: "cover" };
  return { backgroundColor: bg };
};

export default AddBoardModal;
