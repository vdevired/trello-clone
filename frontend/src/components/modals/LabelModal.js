import React, { useRef, useState, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { getEditControlsSidePosition } from "../boards/Card";
import { backendUrl, colors } from "../../static/js/const";
import useAxiosGet from "../../hooks/useAxiosGet";
import { authAxios, getAddBoardStyle } from "../../static/js/util";
import { updateCard } from "../../static/js/board";
import globalContext from "../../context/globalContext";

const zipWith3 = (xs, ys, zs, f) => xs.map((n, i) => f(n, ys[i], zs[i]));

const getLiContent = (data, selected) => {
    if (!data) return [];

    return data.map((label) => {
        const checked =
            selected.find((selectedLabel) => selectedLabel.id === label.id) !==
            undefined;
        return {
            ...label,
            style: {
                backgroundColor: `#${label.color}`,
            },
            checked,
        };
    });
};

const LabelModal = ({ list, card, cardElem, setShowModal }) => {
    const { board, setBoard } = useContext(globalContext);
    const [showCreateLabel, setShowCreateLabel] = useState(false);
    const labelElem = useRef(null);
    const [label, setLabel] = useState(null);
    const { data, replaceItem } = useAxiosGet(
        `/boards/labels/?board=${board.id}`
    );
    const liContent = getLiContent(data, card.labels);

    const toggleLabel = async (labelId) => {
        const { data } = await authAxios.put(
            `${backendUrl}/boards/items/${card.id}/`,
            {
                title: card.title,
                labels: labelId,
            }
        );
        updateCard(board, setBoard)(list.id, data);
    };

    return (
        <>
            {showCreateLabel ? (
                <CreateLabel
                    labelElem={labelElem}
                    setShowCreateLabel={setShowCreateLabel}
                    label={label}
                    replaceItem={replaceItem}
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
                        {liContent.map((label) => {
                            return (
                                <li
                                    key={uuidv4()}
                                    className="label-modal__label"
                                >
                                    <p
                                        onClick={() => toggleLabel(label.id)}
                                        style={label.style}
                                    >
                                        {label.title}
                                        {label.checked ? (
                                            <i
                                                className="fal fa-check"
                                                style={{
                                                    float: "right",
                                                    marginRight: "0.6em",
                                                }}
                                            ></i>
                                        ) : null}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setLabel(label);
                                            setShowCreateLabel(true);
                                        }}
                                        style={{ marginLeft: "1em" }}
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

const CreateLabel = ({ labelElem, setShowCreateLabel, label, replaceItem }) => {
    const [title, setTitle] = useState(label.title);
    const [color, setColor] = useState(label.color);
    return (
        <div
            style={getEditControlsSidePosition(labelElem.current)}
            className="label-modal label-modal--create"
        >
            <div className="label-modal__header">
                <button
                    style={{ marginRight: "auto", marginLeft: 0 }}
                    onClick={() => setShowCreateLabel(false)}
                >
                    <i className="fal fa-chevron-left"></i>
                </button>
                <p style={{ marginRight: "auto", marginLeft: 0 }}>Create</p>
            </div>

            <div className="label-modal__content">
                <p className="label-modal__title">Name</p>
                <input
                    className="label-modal__input"
                    placeholder="Enter label name"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div>
                <p className="label-modal__labels-head">Select a color</p>
                <ul className="label-modal__create-block">
                    {colors.map((colorOption) => {
                        return (
                            <li
                                key={uuidv4()}
                                className="label-modal__create-label"
                            >
                                <button
                                    className={
                                        color === colorOption[0].substring(1)
                                            ? "label-modal__create-label--selected"
                                            : ""
                                    }
                                    onClick={() =>
                                        setColor(colorOption[0].substring(1))
                                    }
                                    style={getAddBoardStyle(...colorOption)}
                                >
                                    {color === colorOption[0].substring(1) ? (
                                        <i className="fal fa-check"></i>
                                    ) : null}
                                </button>
                            </li>
                        );
                    })}
                    <li className="label-modal__create-label"></li>
                </ul>
            </div>
            <button
                onClick={async () => {
                    const { data } = await authAxios.put(
                        `${backendUrl}/boards/labels/${label.id}/`,
                        {
                            title,
                            color,
                        }
                    );
                    replaceItem(data);
                    setShowCreateLabel(false);
                }}
                className="btn label-modal__create-button"
            >
                Save
            </button>
        </div>
    );
};

export default LabelModal;
