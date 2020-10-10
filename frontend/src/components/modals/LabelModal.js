import React, { useRef, useState, useEffect } from "react";
import { getEditControlsSidePosition } from "../boards/Card";
import { modalBlurHandler } from "../../static/js/util";

const colors = [
  { backgroundColor: "#0079bf" },
  { backgroundColor: "#70b500" },
  { backgroundColor: "#ff9f1a" },
  { backgroundColor: "#eb5a46" },
  { backgroundColor: "#f2d600" },
  { backgroundColor: "#c377e0" },
  { backgroundColor: "#ff78cb" },
  { backgroundColor: "#00c2e0" },
  { backgroundColor: "#51e898" },
  { backgroundColor: "#c4c9cc" },
];

const zipWith3 = (xs, ys, zs, f) => xs.map((n, i) => f(n, ys[i], zs[i]));

const LabelModal = ({ cardElem, setShowModal }) => {
  useEffect(modalBlurHandler(setShowModal), []);
  const [showCreateLabel, setShowCreateLabel] = useState(false);
  const labelElem = useRef(null);
  const [liId, setLiId] = useState(-1);
  const [liContent, setLiContent] = useState(
    zipWith3(colors, Array(colors.length).fill(""), Array(colors.length).fill(false) ,(style, content, checked) => {
      return {
        style: style,
        content: content,
        checked: checked
      };
    })
  );

  return (
    <>
      {showCreateLabel ? (
        <CreateLabel
          labelElem={labelElem}
          setShowCreateLabel={setShowCreateLabel}
          liContent={liContent}
          setLiContent={setLiContent}
          liId={liId}
        />
      ) : null}
      <div
        style={getEditControlsSidePosition(cardElem.current, 40)}
        className="label-modal"
        ref={labelElem}
      >
        <div className="label-modal__header">
          <p>Labels</p>
          <button onClick={() => setShowModal(false)}>
            <i className="fal fa-times"></i>
          </button>
        </div>
        <div>
          <ul className="label-modal__labels-block">
            {liContent.map((x, index) => {
              return (
                <li className="label-modal__label">
                  <p
                    onClick={() => {
                        setLiContent(it => {
                          return it.map((item, idx) => {
                            let nitem;
                            if (idx === index){
                               nitem = {...item};
                               nitem.checked = ! item.checked; 
                               return nitem;
                            }
                            return item;
                          });
                        });
                    }}
                    style={x.style}
                  >
                    {x.content}
                    {x.checked ? (
                      <i
                        className="fal fa-check"
                        style={{ float: "right", marginRight: '0.6em'}}
                      ></i>
                    ) : null}
                  </p>
                  <button
                    onClick={() => {
                      setShowCreateLabel(true);
                      setLiId(index);
                    }}
                    style={{marginLeft: '1em'}}
                  >
                  <i className="fal fa-pencil"></i>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};

const CreateLabel = ({
  labelElem,
  setShowCreateLabel,
  liContent,
  setLiContent,
  liId,
}) => {
  const [content, setContent] = useState("");
  const [color, setColor] = useState(liContent[liId].style);
  return (
    <div
      style={getEditControlsSidePosition(labelElem.current)}
      className="label-modal label-modal--create"
    >
      <div className="label-modal__header">
        <button onClick={() => setShowCreateLabel(false)}>
          <i className="fal fa-chevron-left"></i>
        </button>
        <p>Create</p>
      </div>

      <div className="label-modal__search">
        <p>Name</p>
        <input
          placeholder="Enter label name"
          type="text"
          onChange={(t) => setContent(t.target.value)}
        />
      </div>

      <div>
        <p className="label-modal__labels-head">Select a color</p>
        <ul className="label-modal__create-block">
          {colors.map((x) => {
            return (
              <li className="label-modal__create-label">
                <button
                  className={
                    color === x ? "label-modal__create-label--selected" : ""
                  }
                  onClick={() => setColor(x)}
                  style={x}
                >
                  {color === x ? <i className="fal fa-check"></i> : null}
                </button>
              </li>
            );
          })}
          <li className="label-modal__create-label">
            <button>
              No
              <br />
              Color
            </button>
          </li>
        </ul>
      </div>
      <button
        onClick={() => {
          setShowCreateLabel(false);
          if (content !== "") liContent[liId].content = content;
          liContent[liId].style = color;
          setLiContent(liContent);
        }}
        className="btn label-modal__create-button"
      >
        Create
      </button>
    </div>
  );
};

export default LabelModal;