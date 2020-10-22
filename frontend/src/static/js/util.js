import humanizeDuration from "humanize-duration";
import axios from "axios";

import { backendUrl } from "./const";

const options = {
    largest: 1, // Only returns 1 unit, so 1 day and not 1 day 2 hours or 1 min and not 1 min 5 seconds
    round: true, // 1 hour vs 1.2 hours
    spacer: "", // 3hours vs 3 hours
    language: "shortEn", // Specify language
    languages: {
        // Define custom language
        shortEn: {
            y: () => "y",
            mo: () => "mo",
            w: () => "w",
            d: () => "d",
            h: () => "h",
            m: () => "m",
            s: () => "s",
            ms: () => "ms",
        },
    },
};

export const timeSince = (created_at) => {
    let timeInMillis = new Date() - new Date(created_at);
    return humanizeDuration(timeInMillis, options);
};

export const modalBlurHandler = (setShowModal) => {
    let blur = document.querySelector(".out-of-focus");
    return () => {
        blur.style.display = "block";
        blur.addEventListener("click", () => {
            setShowModal(false);
        });

        return () => {
            blur.style.display = "none";
            blur.removeEventListener("click", () => {
                setShowModal(false);
            });
        };
    };
};

export const authAxios = axios.create();

authAxios.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            config.headers["Authorization"] = "Bearer " + accessToken;
        }
        return config;
    },
    (error) => {
        Promise.reject(error);
    }
);

authAxios.interceptors.response.use(
    (response) => {
        return response;
    },
    async function (error) {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const url = backendUrl + "/token/refresh/";
                const refreshToken = localStorage.getItem("refreshToken");
                const { data: resData } = await axios.post(url, {
                    refresh: refreshToken,
                });
                // Successfully refreshed
                localStorage.setItem("accessToken", resData.access);
                const accessToken = localStorage.getItem("accessToken");
                authAxios.defaults.headers.common["Authorization"] =
                    "Bearer " + accessToken;
                return authAxios(originalRequest);
            } catch (error) {
                // Refresh token failed too
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export const mergeRefs = (...refs) => {
    const filteredRefs = refs.filter(Boolean);
    if (!filteredRefs.length) return null;
    if (filteredRefs.length === 0) return filteredRefs[0];
    return (inst) => {
        for (const ref of filteredRefs) {
            if (typeof ref === "function") {
                ref(inst);
            } else if (ref) {
                ref.current = inst;
            }
        }
    };
};

const getImageBrightness = (imageSrc, callback) => {
    var img = document.createElement("img"),
        colorSum = 0,
        i = 0,
        len,
        canvas,
        ctx,
        imageData,
        data,
        brightness,
        r,
        g,
        b,
        avg;

    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.style.display = "none";

    document.body.appendChild(img);

    img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let r, g, b, avg;

        for (let x = 0, len = data.length; x < len; x += 4) {
            r = data[x];
            g = data[x + 1];
            b = data[x + 2];
            avg = Math.floor((r + g + b) / 3);
            colorSum += avg;
        }

        const brightness = Math.floor(colorSum / (this.width * this.height));
        callback(brightness);
    };
};

const getColorBrightness = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    const rgb = result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;

    const brightness = Math.round(
        (parseInt(rgb.r) * 299 +
            parseInt(rgb.g) * 587 +
            parseInt(rgb.b) * 114) /
            1000
    );
    return brightness;
};

export const handleBackgroundBrightness = (
    board,
    setIsBackgroundDark
) => () => {
    if (!board) return;
    if (board.color) {
        const brightness = getColorBrightness(`#${board.color}`);
        if (brightness <= 125) setIsBackgroundDark(true);
        else setIsBackgroundDark(false);
    } else {
        const image = board.image || board.image_url;
        getImageBrightness(image, (brightness) => {
            if (brightness <= 125) setIsBackgroundDark(true);
            else setIsBackgroundDark(false);
        });
    }
};
