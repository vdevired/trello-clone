import React, { useState, useEffect } from "react";
import { authAxios } from "../static/js/util";
import { backendUrl } from "../static/js/const";
import axios from "axios";

const useAxiosGet = (url, onSite = true) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unmounted = false;
        const fetchData = async () => {
            const axiosUsed = onSite ? authAxios : axios;
            url = onSite ? backendUrl + url : url;

            try {
                const res = await axiosUsed.get(url);
                if (!unmounted) {
                    setData(res.data);
                    setLoading(false);
                }
            } catch (error) {
                if (!unmounted) {
                    setError(true);
                    setErrorMessage(error.message);
                    setLoading(false);
                }
            }
        };
        fetchData();
        return () => {
            unmounted = true;
        };
    }, [url]);

    // Below three functions are only if data is an array
    const addItem = (item) => {
        setData((prevData) => [...prevData, item]);
    };

    const replaceItem = (newItem, key = "id") => {
        setData((prevData) =>
            prevData.map((item) => {
                if (item[key] === newItem[key]) return newItem;
                return item;
            })
        );
    };

    const removeItem = (id) => {
        setData((prevData) => prevData.filter((item) => item.id !== id));
    };

    return {
        data,
        setData,
        loading,
        error,
        errorMessage,
        addItem,
        replaceItem,
        removeItem,
    };
};

export default useAxiosGet;
