import React from "react";
import { v4 as uuidv4 } from "uuid";

import {
    convertUnsplashToOptions,
    getAddBoardStyle,
} from "../../static/js/util";
import useAxiosGet from "../../hooks/useAxiosGet";
import { colors } from "../../static/js/const";

const BoardBackground = ({
    position,
    setShowBoardModal,
    extraBackground,
    setExtraBackground,
    setSelectedBackground,
}) => {
    const accessKey = process.env.REACT_APP_UNSPLASH_API_ACCESS_KEY;
    const { data } = useAxiosGet(
        `https://api.unsplash.com/photos?client_id=${accessKey}&page=2`,
        false
    );
    const images = convertUnsplashToOptions(data);
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
                    {images.slice(0, 6).map((imageOption) => (
                        <li
                            className={`label-modal__create-label ${
                                extraBackground?.[0] === imageOption[0]
                                    ? "label-modal__create-label--selected"
                                    : ""
                            }`}
                            key={uuidv4()}
                        >
                            <button
                                style={getAddBoardStyle(...imageOption)}
                                onClick={() => {
                                    setExtraBackground(imageOption);
                                    setSelectedBackground(0);
                                }}
                            >
                                {extraBackground?.[0] === imageOption?.[0] ? (
                                    <i className="fal fa-check"></i>
                                ) : null}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <p className="label-modal__labels-head">Colors</p>
                <ul className="label-modal__create-block">
                    {colors.slice(0, 6).map((colorOption) => (
                        <li
                            className={`label-modal__create-label ${
                                extraBackground?.[0] === colorOption[0]
                                    ? "label-modal__create-label--selected"
                                    : ""
                            }`}
                            key={uuidv4()}
                        >
                            <button
                                style={getAddBoardStyle(...colorOption)}
                                onClick={() => {
                                    setExtraBackground(colorOption);
                                    setSelectedBackground(0);
                                }}
                            >
                                {extraBackground?.[0] === colorOption[0] ? (
                                    <i className="fal fa-check"></i>
                                ) : null}
                            </button>
                        </li>
                    ))}
                    <li
                        className="label-modal__create-label"
                        style={{ display: "none" }}
                    >
                        <button></button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default BoardBackground;
